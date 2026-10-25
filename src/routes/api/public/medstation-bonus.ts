import { createFileRoute } from "@tanstack/react-router";
import {
  MEDSTATION_BONUS_ORIGEM,
  MEDSTATION_SESSION_PREFIX,
  MEDSTATION_VERIFY_URL,
  isBonusReference,
  novoPrazoRenovacao,
  parseBonusEligibility,
} from "@/lib/medstation-bonus";

const notFound = () => Response.json({ error: "Referência não encontrada." }, { status: 404 });

/**
 * Bônus do plano anual MedStation. A MedStation envia { reference } e nós
 * confirmamos no endereço dela antes de gravar. Sem segredo compartilhado: só
 * quem tem uma referência real de pagamento anual consegue liberar o acesso.
 * Não gera arquivos nem envia e-mail: os PDFs personalizados saem no primeiro
 * download e a MedStation já avisa o cliente.
 */
export const Route = createFileRoute("/api/public/medstation-bonus")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let reference: unknown;
        try {
          reference = ((await request.json()) as { reference?: unknown } | null)?.reference;
        } catch {
          return notFound();
        }
        if (!isBonusReference(reference)) return notFound();

        // 1. Confirma a referência na MedStation.
        let verifyBody: unknown;
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 10_000);
        try {
          const res = await fetch(MEDSTATION_VERIFY_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reference }),
            signal: controller.signal,
          });
          if (res.status === 400) return notFound();
          if (!res.ok) {
            console.error("[medstation-bonus] confirmação indisponível", res.status);
            return Response.json({ error: "Confirmação indisponível." }, { status: 502 });
          }
          verifyBody = await res.json();
        } catch (e) {
          console.error("[medstation-bonus] falha ao confirmar", (e as Error)?.message);
          return Response.json({ error: "Confirmação indisponível." }, { status: 502 });
        } finally {
          clearTimeout(timer);
        }

        const bonus = parseBonusEligibility(verifyBody);
        if (!bonus) return notFound();

        const sessionId = MEDSTATION_SESSION_PREFIX + reference;
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        // 2. Renovação: só estende o prazo.
        const estender = async (): Promise<Response> => {
          const { data: existente, error } = await supabaseAdmin
            .from("compras")
            .select("id, expira_em")
            .eq("stripe_session_id", sessionId)
            .maybeSingle();
          if (error || !existente) {
            console.error("[medstation-bonus] falha ao ler compra", error);
            return Response.json({ error: "Falha ao gravar." }, { status: 500 });
          }
          const novo = novoPrazoRenovacao(existente.expira_em, bonus.accessUntil);
          if (novo) {
            const { error: upError } = await supabaseAdmin
              .from("compras")
              .update({ expira_em: novo })
              .eq("id", existente.id);
            if (upError) {
              console.error("[medstation-bonus] falha ao estender prazo", upError);
              return Response.json({ error: "Falha ao gravar." }, { status: 500 });
            }
          }
          console.log("[medstation-bonus] renovação", { estendido: Boolean(novo) });
          return Response.json({ ok: true, acao: novo ? "estendido" : "sem_alteracao" });
        };

        const { data: jaExiste, error: readError } = await supabaseAdmin
          .from("compras")
          .select("id")
          .eq("stripe_session_id", sessionId)
          .maybeSingle();
        if (readError) {
          console.error("[medstation-bonus] falha ao ler compra", readError);
          return Response.json({ error: "Falha ao gravar." }, { status: 500 });
        }
        if (jaExiste) return estender();

        // 3. Novo bônus. Se a pessoa já tem acesso criado ou CPF em outra compra
        // do Arsenal, reaproveita para o bônus aparecer direto na conta dela.
        const { data: outras } = await supabaseAdmin
          .from("compras")
          .select("user_id, cpf")
          .ilike("email", bonus.email)
          .eq("status", "pago");
        const userId = (outras ?? []).find((c) => c.user_id)?.user_id ?? null;
        const cpf =
          (outras ?? [])
            .map((c) => (c.cpf ?? "").replace(/\D/g, ""))
            .find((c) => c.length === 11) ?? null;

        const { error: insertError } = await supabaseAdmin.from("compras").insert({
          email: bonus.email,
          stripe_session_id: sessionId,
          valor_centavos: 0,
          produto: "arsenal_med_3",
          status: "pago",
          expira_em: bonus.accessUntil,
          origem: MEDSTATION_BONUS_ORIGEM,
          user_id: userId,
          cpf,
        });

        if (insertError) {
          // Dois avisos simultâneos: o outro já gravou, então só estende.
          if (insertError.code === "23505") return estender();
          console.error("[medstation-bonus] falha ao gravar", insertError);
          return Response.json({ error: "Falha ao gravar." }, { status: 500 });
        }

        console.log("[medstation-bonus] bônus registrado", { vinculado: Boolean(userId) });
        return Response.json({ ok: true, acao: "registrado" });
      },
    },
  },
});
