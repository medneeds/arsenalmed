import { createFileRoute } from "@tanstack/react-router";

const MAX_DOWNLOADS_PER_FILE = 5;
const SIGNED_URL_SECONDS = 600;
const BUCKET = "downloads";

const FILES = {
  manual: {
    masterPath: "arsenal-med-3.pdf",
    pathColumn: "arquivo_path",
    counterColumn: "downloads_manual",
    downloadName: "ArsenalMed-3.0-Manual-Completo.pdf",
  },
  catalogo: {
    masterPath: "arsenal-med-catalogo.pdf",
    pathColumn: "catalogo_path",
    counterColumn: "downloads_catalogo",
    downloadName: "ArsenalMed-Catalogo-Farmacos-e-Tabelas.pdf",
  },
} as const;

type FileKind = keyof typeof FILES;

export const Route = createFileRoute("/api/public/download")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const token = url.searchParams.get("token");
        const kindRaw = url.searchParams.get("arquivo") ?? "manual";
        if (!token || !/^[0-9a-f-]{36}$/i.test(token)) {
          return Response.json({ error: "Link de download inválido." }, { status: 400 });
        }
        if (kindRaw !== "manual" && kindRaw !== "catalogo") {
          return Response.json({ error: "Arquivo inválido." }, { status: 400 });
        }
        const kind = kindRaw as FileKind;
        const config = FILES[kind];

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const { data: compra, error } = await supabaseAdmin
          .from("compras")
          .select("id, expira_em, status, arquivo_path, catalogo_path, downloads_manual, downloads_catalogo")
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
            { error: "Este acesso expirou. Escreva para suporte@arsenalmed.com.br para receber um novo link." },
            { status: 410 },
          );
        }

        const currentDownloads = Number(compra[config.counterColumn] ?? 0);
        if (currentDownloads >= MAX_DOWNLOADS_PER_FILE) {
          return Response.json(
            { error: "Limite de downloads deste arquivo atingido. Escreva para suporte@arsenalmed.com.br." },
            { status: 429 },
          );
        }

        const storagePath = (compra[config.pathColumn] as string | null) ?? config.masterPath;
        const { data: signed, error: signError } = await supabaseAdmin.storage
          .from(BUCKET)
          .createSignedUrl(storagePath, SIGNED_URL_SECONDS, { download: config.downloadName });

        if (signError || !signed?.signedUrl) {
          console.error(`falha ao assinar URL ${kind}:`, signError);
          return Response.json({ error: "Arquivo indisponível no momento." }, { status: 500 });
        }

        const { data: updated, error: updateError } = await supabaseAdmin
          .from("compras")
          .update(
            { [config.counterColumn]: currentDownloads + 1 } as {
              downloads_manual?: number;
              downloads_catalogo?: number;
            },
          )
          .eq("id", compra.id)
          .eq(config.counterColumn, currentDownloads)
          .select("id")
          .maybeSingle();

        if (updateError || !updated) {
          return Response.json(
            { error: "Este link foi usado em outra janela. Tente novamente." },
            { status: 409 },
          );
        }

        return Response.json({
          url: signed.signedUrl,
          arquivo: kind,
          downloadsRestantes: MAX_DOWNLOADS_PER_FILE - (currentDownloads + 1),
        });
      },
    },
  },
});
