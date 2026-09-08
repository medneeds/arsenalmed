import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { ARSENAL_PRODUCT } from "@/lib/product";

export type StripeVenda = {
  id: string;
  criadoEm: string;
  valorCentavos: number;
  moeda: string;
  metodo: string;
  status: string;
};

export type StripeResumo = {
  ok: true;
  produto: string;
  precoAtualCentavos: number | null;
  totalCentavos: number;
  periodoCentavos: number;
  vendasTotal: number;
  vendasPeriodo: number;
  ticketMedioCentavos: number;
  moeda: string;
  porMetodo: { metodo: string; quantidade: number; totalCentavos: number }[];
  serie: { dia: string; vendas: number; receitaCentavos: number }[];
  vendas: StripeVenda[];
  periodoDias: number;
  pixStatus: "active" | "pending" | "inactive" | "desconhecido";
};

export type StripeResumoResult = StripeResumo | { ok: false; error: string };

function diaISO(ms: number): string {
  return new Date(ms - 3 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

export const getStripeArsenalResumo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { dias?: number; environment: "sandbox" | "live" }) => ({
    dias: Math.min(Math.max(Number(input?.dias ?? 30), 7), 180),
    environment: input.environment === "sandbox" ? ("sandbox" as const) : ("live" as const),
  }))
  .handler(async ({ data, context }): Promise<StripeResumoResult> => {
    const { data: isAdmin, error: roleError } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (roleError) throw new Error("Não foi possível verificar suas permissões.");
    if (!isAdmin) throw new Error("Forbidden");

    try {
      const { createStripeClient } = await import("@/lib/stripe.server");
      const stripe = createStripeClient(data.environment);

      // Preços do Arsenal Med (todos os preços do mesmo produto, ativos ou não)
      const byLookup = await stripe.prices.list({
        lookup_keys: [ARSENAL_PRODUCT.lookupKey],
        limit: 10,
      });
      const precoAtual = byLookup.data.find((p) => p.active) ?? byLookup.data[0] ?? null;
      const produtoId =
        precoAtual && typeof precoAtual.product === "string"
          ? precoAtual.product
          : (precoAtual?.product as { id?: string } | undefined)?.id;

      const priceIds = new Set(byLookup.data.map((p) => p.id));
      if (produtoId) {
        const todos = await stripe.prices.list({ product: produtoId, limit: 100 });
        for (const p of todos.data) priceIds.add(p.id);
      }

      if (priceIds.size === 0) {
        return {
          ok: false,
          error: `Nenhum preço encontrado na Stripe para "${ARSENAL_PRODUCT.lookupKey}".`,
        };
      }

      // Sessões de checkout pagas, filtradas pelos preços do Arsenal Med
      const vendas: StripeVenda[] = [];
      let startingAfter: string | undefined;
      for (let page = 0; page < 10; page++) {
        const list = await stripe.checkout.sessions.list({
          limit: 100,
          expand: ["data.line_items"],
          ...(startingAfter ? { starting_after: startingAfter } : {}),
        });
        for (const s of list.data) {
          if (s.payment_status !== "paid") continue;
          const items = s.line_items?.data ?? [];
          const doArsenal = items.some((li) => li.price?.id && priceIds.has(li.price.id));
          if (!doArsenal) continue;
          const metodos = s.payment_method_types ?? [];
          vendas.push({
            id: s.id,
            criadoEm: new Date(s.created * 1000).toISOString(),
            valorCentavos: s.amount_total ?? 0,
            moeda: (s.currency ?? ARSENAL_PRODUCT.currency).toUpperCase(),
            metodo: metodos.includes("pix") && metodos.length === 1 ? "pix" : (metodos[0] ?? "—"),
            status: s.payment_status,
          });
        }
        if (!list.has_more) break;
        startingAfter = list.data[list.data.length - 1]?.id;
        if (!startingAfter) break;
      }

      vendas.sort((a, b) => (a.criadoEm < b.criadoEm ? 1 : -1));

      const agora = Date.now();
      const desde = agora - data.dias * 24 * 60 * 60 * 1000;
      const noPeriodo = vendas.filter((v) => new Date(v.criadoEm).getTime() >= desde);
      const soma = (rows: StripeVenda[]) => rows.reduce((a, v) => a + v.valorCentavos, 0);

      const mapaMetodo = new Map<string, { quantidade: number; totalCentavos: number }>();
      for (const v of noPeriodo) {
        const atual = mapaMetodo.get(v.metodo) ?? { quantidade: 0, totalCentavos: 0 };
        atual.quantidade += 1;
        atual.totalCentavos += v.valorCentavos;
        mapaMetodo.set(v.metodo, atual);
      }

      const serieMapa = new Map<string, { dia: string; vendas: number; receitaCentavos: number }>();
      for (let i = data.dias - 1; i >= 0; i--) {
        const dia = diaISO(agora - i * 24 * 60 * 60 * 1000);
        serieMapa.set(dia, { dia, vendas: 0, receitaCentavos: 0 });
      }
      for (const v of noPeriodo) {
        const entry = serieMapa.get(diaISO(new Date(v.criadoEm).getTime()));
        if (entry) {
          entry.vendas += 1;
          entry.receitaCentavos += v.valorCentavos;
        }
      }

      let pixStatus: StripeResumo["pixStatus"] = "desconhecido";
      try {
        const conta = await stripe.accounts.retrieve();
        const pix = conta.capabilities?.pix_payments;
        pixStatus = pix === "active" ? "active" : pix === "pending" ? "pending" : "inactive";
      } catch {
        pixStatus = "desconhecido";
      }

      const totalCentavos = soma(vendas);
      return {
        ok: true,
        produto: ARSENAL_PRODUCT.name,
        precoAtualCentavos: precoAtual?.unit_amount ?? null,
        totalCentavos,
        periodoCentavos: soma(noPeriodo),
        vendasTotal: vendas.length,
        vendasPeriodo: noPeriodo.length,
        ticketMedioCentavos: vendas.length ? Math.round(totalCentavos / vendas.length) : 0,
        moeda: vendas[0]?.moeda ?? ARSENAL_PRODUCT.currency.toUpperCase(),
        porMetodo: [...mapaMetodo.entries()]
          .map(([metodo, v]) => ({ metodo, ...v }))
          .sort((a, b) => b.totalCentavos - a.totalCentavos),
        serie: [...serieMapa.values()],
        vendas: vendas.slice(0, 100),
        periodoDias: data.dias,
        pixStatus,
      };
    } catch (error) {
      const { getStripeErrorMessage } = await import("@/lib/stripe.server");
      return { ok: false, error: getStripeErrorMessage(error) };
    }
  });
