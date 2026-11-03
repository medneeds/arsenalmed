import { createFileRoute } from "@tanstack/react-router";

// Link "não quero mais receber" dos e-mails da sequência. Valida o token
// (HMAC do e-mail) e marca leads.descadastrado_em.
function pagina(titulo: string, texto: string, status = 200) {
  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${titulo} · Arsenal Med</title><meta name="robots" content="noindex"></head>
<body style="margin:0;background:#F5F2E6;font-family:Georgia,serif;color:#222A1C">
<main style="max-width:520px;margin:12vh auto;padding:32px 24px;border:1px solid #C3CAB2;background:#fdfcf8">
<p style="font:700 11px/1 Arial,sans-serif;letter-spacing:2px;text-transform:uppercase;color:#3E4A30;margin:0">Arsenal Med</p>
<h1 style="font-size:22px;margin:14px 0 10px">${titulo}</h1><p style="font-size:16px;line-height:1.5;margin:0 0 18px">${texto}</p>
<a href="https://arsenalmed.com.br" style="color:#3E4A30">arsenalmed.com.br</a></main></body></html>`;
  return new Response(html, { status, headers: { "Content-Type": "text/html; charset=utf-8" } });
}

export const Route = createFileRoute("/api/public/descadastrar")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const email = (url.searchParams.get("e") ?? "").trim().toLowerCase();
        const token = url.searchParams.get("t") ?? "";
        const { tokenValido } = await import("@/lib/descadastro.server");
        if (!email || !token || !tokenValido(email, token)) {
          return pagina("Link inválido", "Não conseguimos confirmar este link. Responda qualquer e-mail nosso pedindo o descadastro e fazemos manualmente.", 400);
        }
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const db = supabaseAdmin as unknown as { from: (t: string) => any };
        const { error } = await db.from("leads").update({ descadastrado_em: new Date().toISOString() }).eq("email", email);
        if (error) {
          console.error("[descadastrar] falha:", error);
          return pagina("Tente de novo", "Não conseguimos registrar agora. Tente o link novamente em alguns minutos.", 500);
        }
        return pagina("Pronto, você foi descadastrado", "Você não vai mais receber os e-mails da sequência do Arsenal Compacto. O material que você baixou continua sendo seu.");
      },
    },
  },
});
