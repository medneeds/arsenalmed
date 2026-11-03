import { createFileRoute } from "@tanstack/react-router";
import { etapaDevida, janelaDeBusca } from "@/lib/sequencia-compacto";

// Chamado de hora em hora pelo pg_cron (migração 20261103010000). Idempotente:
// cada etapa de cada lead é registrada em lead_emails antes do envio, e a chave
// primária impede envio duplicado mesmo com chamadas simultâneas.
const SITE = "https://arsenalmed.com.br";
const MAX_POR_EXECUCAO = 40; // abaixo do limite por hora do e-mail da Lovable

async function executar(): Promise<Response> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
  const { urlDescadastro } = await import("@/lib/descadastro.server");
  // Tabelas novas ainda não constam nos tipos gerados.
  const db = supabaseAdmin as unknown as { from: (t: string) => any };
  const agora = new Date();
  const { desde, ate } = janelaDeBusca(agora);

  const { data: leads, error } = await db
    .from("leads")
    .select("email, nome, criado_em, descadastrado_em")
    .gte("criado_em", desde)
    .lte("criado_em", ate)
    .is("descadastrado_em", null)
    .limit(500);
  if (error) {
    console.error("[sequencia] falha ao ler leads (migração aplicada?):", error);
    return Response.json({ ok: false, error: "leads" }, { status: 503 });
  }
  if (!leads?.length) return Response.json({ ok: true, enviados: 0 });

  const emails = leads.map((l: { email: string }) => l.email);
  const [{ data: envios, error: e2 }, { data: compras }] = await Promise.all([
    db.from("lead_emails").select("email, etapa").in("email", emails),
    db.from("compras").select("email").in("email", emails).eq("status", "pago"),
  ]);
  if (e2) {
    console.error("[sequencia] falha ao ler lead_emails (migração aplicada?):", e2);
    return Response.json({ ok: false, error: "lead_emails" }, { status: 503 });
  }

  const enviadasPorEmail = new Map<string, Set<string>>();
  for (const r of envios ?? []) {
    if (!enviadasPorEmail.has(r.email)) enviadasPorEmail.set(r.email, new Set());
    enviadasPorEmail.get(r.email)!.add(r.etapa);
  }
  const compradores = new Set((compras ?? []).map((c: { email: string }) => c.email.toLowerCase()));

  let enviados = 0;
  const falhas: string[] = [];
  for (const lead of leads) {
    if (enviados >= MAX_POR_EXECUCAO) break;
    const e = etapaDevida(lead, enviadasPorEmail.get(lead.email) ?? new Set(), compradores.has(lead.email), agora);
    if (!e) continue;

    // Reserva a etapa; se outra execução já reservou, a chave primária recusa.
    const { error: reserva } = await db.from("lead_emails").insert({ email: lead.email, etapa: e.etapa });
    if (reserva) continue;

    try {
      await sendTemplateEmail(e.template, lead.email, {
        templateData: {
          nome: lead.nome,
          salesUrl: `${SITE}/?utm_source=email&utm_medium=sequencia&utm_campaign=compacto&utm_content=${e.etapa}`,
          videoUrl: `${SITE}/?utm_source=email&utm_medium=sequencia&utm_campaign=compacto&utm_content=${e.etapa}#video`,
          compactoUrl: `${SITE}/compacto?utm_source=email&utm_medium=sequencia&utm_content=${e.etapa}`,
          descadastroUrl: urlDescadastro(lead.email),
        },
        idempotencyKey: `sequencia-${e.etapa}-${lead.email}`,
      });
      enviados++;
    } catch (err) {
      // Libera a reserva para tentar de novo na próxima hora.
      await db.from("lead_emails").delete().eq("email", lead.email).eq("etapa", e.etapa);
      falhas.push(e.etapa);
      console.error(`[sequencia] falha ao enviar ${e.etapa}:`, err);
    }
  }
  return Response.json({ ok: true, enviados, falhas: falhas.length });
}

export const Route = createFileRoute("/api/public/sequencia-compacto")({
  server: {
    handlers: {
      POST: () => executar(),
      GET: () => executar(),
    },
  },
});
