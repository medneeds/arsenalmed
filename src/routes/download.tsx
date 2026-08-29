import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "../components/Header";
import { Logo } from "../components/Logo";

type State =
  | { kind: "carregando" }
  | { kind: "pronto"; url: string; downloadsRestantes: number }
  | { kind: "erro"; message: string };

export const Route = createFileRoute("/download")({
  validateSearch: (search: Record<string, unknown>): { token?: string } => ({
    token: typeof search.token === "string" ? search.token : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Download — Arsenal Med 3.0" },
      { name: "description", content: "Download do manual Arsenal Med 3.0." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DownloadPage,
});

function DownloadPage() {
  const { token } = Route.useSearch();
  const [state, setState] = useState<State>({ kind: "carregando" });

  useEffect(() => {
    if (!token) {
      setState({ kind: "erro", message: "Link de download inválido." });
      return;
    }
    let cancelled = false;
    fetch(`/api/public/download?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const body = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok) {
          setState({ kind: "erro", message: body.error ?? "Não foi possível liberar o download." });
          return;
        }
        setState({ kind: "pronto", url: body.url, downloadsRestantes: body.downloadsRestantes });
      })
      .catch(() => {
        if (!cancelled) setState({ kind: "erro", message: "Falha de conexão. Tente novamente." });
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="min-h-screen bg-papel text-tinta">
      <Header />
      <main className="mx-auto max-w-[560px] px-4 pb-20 pt-24 md:px-6">
        <div className="border border-musgo-300 p-6 text-center md:p-10">
          <div className="flex justify-center">
            <Logo size={56} />
          </div>

          {state.kind === "carregando" && (
            <>
              <h1 className="mt-6 font-heading text-2xl font-bold uppercase tracking-wide">
                Preparando o arquivo
              </h1>
              <p className="mt-3 text-[16px] leading-relaxed text-musgo-600">Um instante.</p>
            </>
          )}

          {state.kind === "pronto" && (
            <>
              <p className="label mt-6 text-ocre">DOWNLOAD LIBERADO</p>
              <h1 className="mt-4 font-heading text-2xl font-bold uppercase tracking-wide">
                Arsenal Med 3.0
              </h1>
              <a
                href={state.url}
                className="mt-8 block bg-ocre px-5 py-4 text-center font-heading text-base font-bold uppercase tracking-[0.12em] text-musgo-900 transition-colors hover:bg-musgo-800 hover:text-papel"
              >
                BAIXAR PDF
              </a>
              <p className="mt-4 font-mono text-xs uppercase tracking-widest text-musgo-300">
                link válido por 10 minutos · {state.downloadsRestantes} download(s) restante(s)
              </p>
            </>
          )}

          {state.kind === "erro" && (
            <>
              <h1 className="mt-6 font-heading text-2xl font-bold uppercase tracking-wide">
                Download indisponível
              </h1>
              <p className="mt-3 text-[16px] leading-relaxed text-musgo-600">{state.message}</p>
            </>
          )}

          <p className="mt-8 text-sm text-musgo-600">
            <Link to="/" className="underline underline-offset-4 hover:text-tinta">
              Voltar para a página inicial
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
