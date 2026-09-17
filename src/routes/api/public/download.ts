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
        const compraId = url.searchParams.get("compra");
        const bearer = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
        const kindRaw = url.searchParams.get("arquivo") ?? "manual";

        const UUID = /^[0-9a-f-]{36}$/i;
        const usaSessao = !token && Boolean(compraId);

        if (!usaSessao && (!token || !UUID.test(token))) {
          return Response.json({ error: "Link de download inválido." }, { status: 400 });
        }
        if (usaSessao && (!UUID.test(compraId!) || !bearer)) {
          return Response.json({ error: "Sessão inválida. Entre novamente." }, { status: 401 });
        }
        if (kindRaw !== "manual" && kindRaw !== "catalogo") {
          return Response.json({ error: "Arquivo inválido." }, { status: 400 });
        }
        const kind = kindRaw as FileKind;
        const config = FILES[kind];

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const selectCols =
          "id, expira_em, status, arquivo_path, catalogo_path, downloads_manual, downloads_catalogo";

        let compra:
          | {
              id: string;
              expira_em: string;
              status: string;
              arquivo_path: string | null;
              catalogo_path: string | null;
              downloads_manual: number;
              downloads_catalogo: number;
            }
          | null = null;

        if (usaSessao) {
          const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(bearer);
          if (userError || !userData?.user) {
            return Response.json({ error: "Sessão expirada. Entre novamente." }, { status: 401 });
          }
          const { data, error } = await supabaseAdmin
            .from("compras")
            .select(selectCols)
            .eq("id", compraId!)
            .eq("user_id", userData.user.id)
            .maybeSingle();
          if (error || !data) {
            return Response.json({ error: "Compra não encontrada nesta conta." }, { status: 404 });
          }
          compra = data;
        } else {
          const { data, error } = await supabaseAdmin
            .from("compras")
            .select(selectCols)
            .eq("token_download", token!)
            .maybeSingle();
          if (error || !data) {
            return Response.json({ error: "Link de download inválido." }, { status: 404 });
          }
          compra = data;
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

        const storagePath = compra[config.pathColumn] as string | null;
        if (!storagePath) {
          return Response.json(
            {
              error:
                "Sua cópia identificada ainda está sendo preparada. Tente novamente em instantes ou escreva para suporte@arsenalmed.com.br.",
            },
            { status: 409 },
          );
        }
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
