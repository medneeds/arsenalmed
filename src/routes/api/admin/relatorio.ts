import { createFileRoute } from "@tanstack/react-router";

// Relatório para análise externa. Só responde com
// Authorization: Bearer <ADMIN_REPORT_TOKEN>. Nunca devolve e-mail completo,
// nome completo ou CPF. Parâmetros: ?dias=7 (1–366) ou ?desde=AAAA-MM-DD.
function iguais(a: string, b: string): boolean {
  const ea = new TextEncoder().encode(a);
  const eb = new TextEncoder().encode(b);
  let diff = ea.length ^ eb.length;
  const n = Math.max(ea.length, eb.length);
  for (let i = 0; i < n; i++) diff |= (ea[i] ?? 0) ^ (eb[i] ?? 0);
  return diff === 0;
}

const NO_STORE = { "Cache-Control": "no-store" };

export const Route = createFileRoute("/api/admin/relatorio")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const esperado = process.env["ADMIN_REPORT_TOKEN"];
        const header = request.headers.get("authorization") ?? "";
        const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
        if (!esperado || esperado.length < 16 || !token || !iguais(token, esperado)) {
          return Response.json({ error: "unauthorized" }, { status: 401, headers: NO_STORE });
        }

        const url = new URL(request.url);
        const { diaLocal, ehDia, somarDias } = await import("@/lib/periodo");
        const hoje = diaLocal(new Date());
        const diasParam = Number(url.searchParams.get("dias"));
        const desdeParam = url.searchParams.get("desde");
        let desde: string;
        if (ehDia(desdeParam)) desde = desdeParam;
        else if (Number.isInteger(diasParam) && diasParam >= 1 && diasParam <= 366) desde = somarDias(hoje, -(diasParam - 1));
        else desde = somarDias(hoje, -6);

        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { carregarPainel } = await import("@/lib/painel.server");
          const { relatorioJson } = await import("@/lib/relatorio");
          const dados = await carregarPainel(supabaseAdmin, { desde, ate: hoje });
          return Response.json(relatorioJson(dados), { headers: NO_STORE });
        } catch (e) {
          console.error("[relatorio] falha:", e);
          return Response.json({ error: "internal" }, { status: 500, headers: NO_STORE });
        }
      },
    },
  },
});
