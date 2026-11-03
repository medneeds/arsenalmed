import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

// Lançamento automático do gasto diário das campanhas (copiado do Gerenciador
// de Anúncios pelo Claude a cada checagem). Mesmo token do relatório:
// Authorization: Bearer <ADMIN_REPORT_TOKEN>. Só escreve em
// investimento_campanhas; lançar de novo o mesmo dia e campanha substitui o valor.
function iguais(a: string, b: string): boolean {
  const ea = new TextEncoder().encode(a);
  const eb = new TextEncoder().encode(b);
  let diff = ea.length ^ eb.length;
  const n = Math.max(ea.length, eb.length);
  for (let i = 0; i < n; i++) diff |= (ea[i] ?? 0) ^ (eb[i] ?? 0);
  return diff === 0;
}

const NO_STORE = { "Cache-Control": "no-store" };

export const Route = createFileRoute("/api/admin/investimento")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const esperado = process.env["ADMIN_REPORT_TOKEN"];
        const header = request.headers.get("authorization") ?? "";
        const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
        if (!esperado || esperado.length < 16 || !token || !iguais(token, esperado)) {
          return Response.json({ error: "unauthorized" }, { status: 401, headers: NO_STORE });
        }

        const { investimentoSchema } = await import("@/lib/painel.functions");
        const corpo = z.object({ lancamentos: z.array(investimentoSchema).min(1).max(62) }).safeParse(
          await request.json().catch(() => null),
        );
        if (!corpo.success) {
          return Response.json({ error: "invalid", issues: corpo.error.issues.slice(0, 5) }, { status: 400, headers: NO_STORE });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const agora = new Date().toISOString();
        const { error } = await supabaseAdmin
          .from("investimento_campanhas")
          .upsert(
            corpo.data.lancamentos.map((l) => ({ ...l, atualizado_em: agora })),
            { onConflict: "dia,utm_campaign" },
          );
        if (error) {
          console.error("[investimento] falha:", error.message);
          return Response.json({ error: "internal" }, { status: 500, headers: NO_STORE });
        }
        return Response.json({ ok: true, lancados: corpo.data.lancamentos.length }, { headers: NO_STORE });
      },
    },
  },
});
