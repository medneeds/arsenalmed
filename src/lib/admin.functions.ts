import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type DiaSerie = {
  dia: string;
  leads: number;
  compras: number;
  receitaCentavos: number;
};

export type CompraLinha = {
  id: string;
  email: string;
  criadoEm: string;
  valorCentavos: number;
  status: string;
  expiraEm: string;
  downloadsManual: number;
  downloadsCatalogo: number;
  temCatalogo: boolean;
};

export type DashboardData = {
  receita: {
    totalCentavos: number;
    hojeCentavos: number;
    seteDiasCentavos: number;
    trintaDiasCentavos: number;
    ticketMedioCentavos: number;
  };
  funil: {
    leads: number;
    checkoutsIniciados: number;
    comprasPagas: number;
    leadsQueCompraram: number;
    taxaLeadParaCompra: number;
    taxaCheckoutParaPago: number;
  };
  serie: DiaSerie[];
  compras: CompraLinha[];
  periodoDias: number;
};

function diaISO(value: string | Date): string {
  const d = typeof value === "string" ? new Date(value) : value;
  // Agrupa por dia no fuso de São Paulo (UTC-3)
  const local = new Date(d.getTime() - 3 * 60 * 60 * 1000);
  return local.toISOString().slice(0, 10);
}

const PAGOS = new Set(["pago", "paid", "completed", "succeeded"]);

export const getAdminDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { dias?: number } | undefined) => ({
    dias: Math.min(Math.max(Number(input?.dias ?? 30), 7), 180),
  }))
  .handler(async ({ data, context }) => {
    const { data: isAdmin, error: roleError } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (roleError) throw new Error("Não foi possível verificar suas permissões.");
    if (!isAdmin) throw new Error("Forbidden");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const desde = new Date(Date.now() - data.dias * 24 * 60 * 60 * 1000);

    const [comprasRes, leadsRes] = await Promise.all([
      supabaseAdmin
        .from("compras")
        .select(
          "id,email,criado_em,valor_centavos,status,expira_em,downloads_manual,downloads_catalogo,catalogo_path",
        )
        .order("criado_em", { ascending: false }),
      supabaseAdmin.from("leads").select("email,criado_em").order("criado_em", { ascending: false }),
    ]);

    if (comprasRes.error) throw new Error(comprasRes.error.message);
    if (leadsRes.error) throw new Error(leadsRes.error.message);

    const comprasTodas = comprasRes.data ?? [];
    const leads = leadsRes.data ?? [];
    const pagas = comprasTodas.filter((c) => PAGOS.has(String(c.status).toLowerCase()));

    const agora = Date.now();
    const janela = (dias: number) => agora - dias * 24 * 60 * 60 * 1000;
    const hojeStr = diaISO(new Date());

    const soma = (rows: typeof pagas) => rows.reduce((acc, c) => acc + (c.valor_centavos ?? 0), 0);

    const totalCentavos = soma(pagas);
    const hojeCentavos = soma(pagas.filter((c) => diaISO(c.criado_em) === hojeStr));
    const seteDiasCentavos = soma(pagas.filter((c) => new Date(c.criado_em).getTime() >= janela(7)));
    const trintaDiasCentavos = soma(
      pagas.filter((c) => new Date(c.criado_em).getTime() >= janela(30)),
    );

    const emailsPagos = new Set(pagas.map((c) => c.email.trim().toLowerCase()));
    const emailsLeads = new Set(leads.map((l) => l.email.trim().toLowerCase()));
    const leadsQueCompraram = [...emailsLeads].filter((e) => emailsPagos.has(e)).length;

    // Série diária
    const mapa = new Map<string, DiaSerie>();
    for (let i = data.dias - 1; i >= 0; i--) {
      const dia = diaISO(new Date(agora - i * 24 * 60 * 60 * 1000));
      mapa.set(dia, { dia, leads: 0, compras: 0, receitaCentavos: 0 });
    }
    for (const l of leads) {
      const entry = mapa.get(diaISO(l.criado_em));
      if (entry) entry.leads += 1;
    }
    for (const c of pagas) {
      const entry = mapa.get(diaISO(c.criado_em));
      if (entry) {
        entry.compras += 1;
        entry.receitaCentavos += c.valor_centavos ?? 0;
      }
    }

    const dentroDoPeriodo = (iso: string) => new Date(iso).getTime() >= desde.getTime();

    return {
      receita: {
        totalCentavos,
        hojeCentavos,
        seteDiasCentavos,
        trintaDiasCentavos,
        ticketMedioCentavos: pagas.length ? Math.round(totalCentavos / pagas.length) : 0,
      },
      funil: {
        leads: leads.filter((l) => dentroDoPeriodo(l.criado_em)).length,
        checkoutsIniciados: comprasTodas.filter((c) => dentroDoPeriodo(c.criado_em)).length,
        comprasPagas: pagas.filter((c) => dentroDoPeriodo(c.criado_em)).length,
        leadsQueCompraram,
        taxaLeadParaCompra: emailsLeads.size
          ? Math.round((leadsQueCompraram / emailsLeads.size) * 1000) / 10
          : 0,
        taxaCheckoutParaPago: comprasTodas.length
          ? Math.round((pagas.length / comprasTodas.length) * 1000) / 10
          : 0,
      },
      serie: [...mapa.values()],
      compras: comprasTodas.slice(0, 200).map((c) => ({
        id: c.id,
        email: c.email,
        criadoEm: c.criado_em,
        valorCentavos: c.valor_centavos ?? 0,
        status: c.status,
        expiraEm: c.expira_em,
        downloadsManual: c.downloads_manual ?? 0,
        downloadsCatalogo: c.downloads_catalogo ?? 0,
        temCatalogo: Boolean(c.catalogo_path),
      })),
      periodoDias: data.dias,
    } satisfies DashboardData;
  });

export const claimAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("claim_admin_if_none");
    if (error) throw new Error(error.message);
    return { isAdmin: Boolean(data) };
  });

export const getMyAdminStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (error) throw new Error(error.message);
    return { isAdmin: Boolean(data) };
  });
