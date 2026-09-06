import { createFileRoute } from "@tanstack/react-router";

const MAX_DOWNLOADS = 5;
const SIGNED_URL_SECONDS = 600; // 10 minutos
const FILE_PATH = "arsenal-med-3.pdf";
const BUCKET = "downloads";

export const Route = createFileRoute("/api/public/download")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const token = new URL(request.url).searchParams.get("token");
        if (!token || !/^[0-9a-f-]{36}$/i.test(token)) {
          return Response.json({ error: "Link de download inválido." }, { status: 400 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const { data: compra, error } = await supabaseAdmin
          .from("compras")
          .select("id, downloads, expira_em, status, arquivo_path")
          .eq("token_download", token)
          .maybeSingle();


        if (error || !compra) {
          return Response.json({ error: "Link de download inválido." }, { status: 404 });
        }
        if (compra.status !== "pago") {
          return Response.json({ error: "Pagamento ainda não confirmado." }, { status: 402 });
        }
        if (new Date(compra.expira_em).getTime() < Date.now()) {
          return Response.json(
            { error: "Este link expirou. Fale com o suporte para receber um novo." },
            { status: 410 },
          );
        }
        if (compra.downloads >= MAX_DOWNLOADS) {
          return Response.json(
            { error: "Limite de downloads atingido. Fale com o suporte." },
            { status: 429 },
          );
        }

        const { error: updateError } = await supabaseAdmin
          .from("compras")
          .update({ downloads: compra.downloads + 1 })
          .eq("id", compra.id);
        if (updateError) {
          console.error("falha ao incrementar downloads:", updateError);
        }

        const { data: signed, error: signError } = await supabaseAdmin.storage
          .from(BUCKET)
          .createSignedUrl(FILE_PATH, SIGNED_URL_SECONDS);
        if (signError || !signed?.signedUrl) {
          console.error("falha ao assinar URL:", signError);
          return Response.json({ error: "Arquivo indisponível no momento." }, { status: 500 });
        }

        return Response.json({
          url: signed.signedUrl,
          downloadsRestantes: MAX_DOWNLOADS - (compra.downloads + 1),
        });
      },
    },
  },
});
