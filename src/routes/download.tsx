import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Header } from "../components/Header";
import { Logo } from "../components/Logo";

type FileKind = "manual" | "catalogo";
type FileState =
  | { kind: "idle" }
  | { kind: "carregando" }
  | { kind: "pronto"; url: string; downloadsRestantes: number }
  | { kind: "erro"; message: string };

export const Route = createFileRoute("/download")({
  validateSearch: (search: Record<string, unknown>): { token: string | undefined } => ({
    token: typeof search["token"] === "string" ? (search["token"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Seus arquivos — Arsenal Med 3.0" },
      { name: "description", content: "Área de entrega do Arsenal Med 3.0." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: DownloadPage,
});

function DownloadPage() {
  const { token } = Route.useSearch();
  const [manual, setManual] = useState<FileState>({ kind: "idle" });
  const [catalogo, setCatalogo] = useState<FileState>({ kind: "idle" });

  async function liberar(kind: FileKind) {
    const setState = kind === "manual" ? setManual : setCatalogo;
    if (!token) {
      setState({ kind: "erro", message: "Link de download inválido." });
      return;
    }
    setState({ kind: "carregando" });
    try {
      const res = await fetch(
        `/api/public/download?token=${encodeURIComponent(token)}&arquivo=${kind}`,
      );
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setState({ kind: "erro", message: body.error ?? "Não foi possível liberar o download." });
        return;
      }
      setState({
        kind: "pronto",
        url: body.url,
        downloadsRestantes: body.downloadsRestantes,
      });
    } catch {
      setState({ kind: "erro", message: "Falha de conexão. Tente novamente." });
    }
  }

  const Card = ({ kind, titulo, subtitulo, state }: { kind: FileKind; titulo: string; subtitulo: string; state: FileState }) => (
    <div className="border border-musgo-300 bg-papel p-5 text-left">
      <p className="label text-ocre">{kind === "manual" ? "VOLUME 1" : "BÔNUS · VOLUME 2"}</p>
      <h2 className="mt-3 font-heading text-xl font-bold uppercase tracking-wide text-tinta">{titulo}</h2>
      <p className="mt-2 text-sm leading-relaxed text-musgo-600">{subtitulo}</p>

      {(state.kind === "idle" || state.kind === "erro") && (
        <button
          type="button"
          onClick={() => liberar(kind)}
          className="mt-5 w-full bg-ocre px-5 py-3 text-center font-heading text-sm font-bold uppercase tracking-[0.12em] text-musgo-900 transition-colors hover:bg-musgo-800 hover:text-papel"
        >
          GERAR LINK DE DOWNLOAD
        </button>
      )}
      {state.kind === "carregando" && (
        <p className="mt-5 font-mono text-xs uppercase tracking-widest text-musgo-500">Preparando link seguro…</p>
      )}
      {state.kind === "pronto" && (
        <>
          <a
            href={state.url}
            className="mt-5 block w-full bg-ocre px-5 py-3 text-center font-heading text-sm font-bold uppercase tracking-[0.12em] text-musgo-900 transition-colors hover:bg-musgo-800 hover:text-papel"
          >
            BAIXAR PDF
          </a>
          <p className="mt-3 font-mono text-[11px] uppercase tracking-widest text-musgo-400">
            link válido por 10 min · {state.downloadsRestantes} download(s) restante(s) deste volume
          </p>
        </>
      )}
      {state.kind === "erro" && (
        <p className="mt-3 text-sm font-semibold text-alerta">{state.message}</p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-papel text-tinta">
      <Header />
      <main className="mx-auto max-w-[760px] px-4 pb-20 pt-24 md:px-6">
        <div className="border border-musgo-300 p-6 text-center md:p-10">
          <div className="flex justify-center">
            <Logo size={56} />
          </div>
          <p className="label mt-6 text-ocre">COMPRA CONFIRMADA</p>
          <h1 className="mt-4 font-heading text-2xl font-bold uppercase tracking-wide">
            Seus arquivos do Arsenal Med 3.0
          </h1>
          <p className="mx-auto mt-3 max-w-[560px] text-[16px] leading-relaxed text-musgo-600">
            Gere o link somente quando for baixar. Abrir ou atualizar esta página não consome seu limite de downloads.
          </p>

          {!token ? (
            <p className="mt-8 border border-alerta/30 bg-alerta/5 p-4 text-sm text-alerta">
              Link de entrega inválido. Use o endereço recebido após a compra.
            </p>
          ) : (
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <Card
                kind="manual"
                titulo="Manual Completo"
                subtitulo="33 cenários de emergência e terapia intensiva, organizados na ordem de execução."
                state={manual}
              />
              <Card
                kind="catalogo"
                titulo="Catálogo de Fármacos e Tabelas"
                subtitulo="Segundo volume incluído como bônus: fármacos, diluições, doses e tabelas de referência."
                state={catalogo}
              />
            </div>
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
