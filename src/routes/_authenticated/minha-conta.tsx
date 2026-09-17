import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { getMinhasCompras, type MinhaCompra } from "@/lib/conta.functions";
import { Header } from "../../components/Header";
import { Logo } from "../../components/Logo";
import { track } from "@/lib/analytics";

export const Route = createFileRoute("/_authenticated/minha-conta")({
  head: () => ({
    meta: [
      { title: "Minha conta — Arsenal Med 3.0" },
      { name: "description", content: "Área de download do Arsenal Med 3.0." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Minha conta — Arsenal Med 3.0" },
      { property: "og:description", content: "Área de download do Arsenal Med 3.0." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MinhaContaPage,
});

type FileKind = "manual" | "catalogo";
type FileState =
  | { kind: "idle" }
  | { kind: "carregando" }
  | { kind: "pronto"; url: string; downloadsRestantes: number }
  | { kind: "erro"; message: string };

const dataBR = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

function VolumeCard({
  kind,
  titulo,
  subtitulo,
  restantes,
  bloqueado,
  state,
  onLiberar,
}: {
  kind: FileKind;
  titulo: string;
  subtitulo: string;
  restantes: number;
  bloqueado: boolean;
  state: FileState;
  onLiberar: (kind: FileKind) => void;
}) {
  return (
    <div className="border border-musgo-300 bg-papel p-5 text-left">
      <p className="label text-ocre">{kind === "manual" ? "VOLUME 1" : "BÔNUS · VOLUME 2"}</p>
      <h3 className="mt-3 font-heading text-lg font-bold uppercase tracking-wide text-tinta sm:text-xl">
        {titulo}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-musgo-600">{subtitulo}</p>

      {bloqueado ? (
        <p className="mt-5 border border-musgo-300 p-3 font-mono text-[11px] uppercase tracking-widest text-musgo-500">
          {restantes === 0 ? "limite de downloads atingido" : "acesso expirado"} · suporte@arsenalmed.com.br
        </p>
      ) : (
        <>
          {(state.kind === "idle" || state.kind === "erro") && (
            <button
              type="button"
              onClick={() => onLiberar(kind)}
              className="mt-5 flex min-h-12 w-full items-center justify-center bg-ocre px-5 py-3 font-heading text-sm font-bold uppercase tracking-[0.12em] text-musgo-900 transition-colors hover:bg-musgo-800 hover:text-papel"
            >
              {state.kind === "erro" ? "TENTAR NOVAMENTE" : "GERAR LINK DE DOWNLOAD"}
            </button>
          )}
          {state.kind === "carregando" && (
            <p className="mt-5 font-mono text-xs uppercase tracking-widest text-musgo-500" role="status">
              Preparando link seguro…
            </p>
          )}
          {state.kind === "pronto" && (
            <>
              <a
                href={state.url}
                className="mt-5 flex min-h-12 w-full items-center justify-center bg-ocre px-5 py-3 font-heading text-sm font-bold uppercase tracking-[0.12em] text-musgo-900 transition-colors hover:bg-musgo-800 hover:text-papel"
              >
                BAIXAR PDF
              </a>
              <p className="mt-3 font-mono text-[11px] uppercase tracking-widest text-musgo-500">
                link válido por 10 min · {state.downloadsRestantes} download(s) restante(s)
              </p>
            </>
          )}
          {state.kind !== "pronto" && (
            <p className="mt-3 font-mono text-[11px] uppercase tracking-widest text-musgo-500">
              {restantes} download(s) restante(s)
            </p>
          )}
          {state.kind === "erro" && (
            <p className="mt-3 text-sm font-semibold text-alerta" role="alert">
              {state.message}
            </p>
          )}
        </>
      )}
    </div>
  );
}

function CompraBloco({ compra }: { compra: MinhaCompra }) {
  const [manual, setManual] = useState<FileState>({ kind: "idle" });
  const [catalogo, setCatalogo] = useState<FileState>({ kind: "idle" });

  async function liberar(kind: FileKind) {
    const setState = kind === "manual" ? setManual : setCatalogo;
    setState({ kind: "carregando" });
    try {
      const { data: sessao } = await supabase.auth.getSession();
      const accessToken = sessao.session?.access_token;
      if (!accessToken) {
        setState({ kind: "erro", message: "Sessão expirada. Entre novamente." });
        return;
      }
      const res = await fetch(
        `/api/public/download?compra=${encodeURIComponent(compra.id)}&arquivo=${kind}`,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setState({ kind: "erro", message: body.error ?? "Não foi possível liberar o download." });
        return;
      }
      setState({ kind: "pronto", url: body.url, downloadsRestantes: body.downloadsRestantes });
      track(kind === "manual" ? "download_manual" : "download_catalogo");
    } catch {
      setState({ kind: "erro", message: "Falha de conexão. Tente novamente." });
    }
  }

  return (
    <section className="mt-8 border border-musgo-300 p-5 md:p-6">
      <p className="font-mono text-[11px] uppercase tracking-widest text-musgo-500">
        compra de {dataBR(compra.criadoEm)} · acesso válido até {dataBR(compra.expiraEm)}
      </p>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <VolumeCard
          kind="manual"
          titulo="Manual Completo"
          subtitulo="33 cenários de emergência e terapia intensiva, organizados na ordem de execução."
          restantes={compra.downloadsManualRestantes}
          bloqueado={compra.expirado || compra.downloadsManualRestantes === 0}
          state={manual}
          onLiberar={liberar}
        />
        <VolumeCard
          kind="catalogo"
          titulo="Catálogo de Fármacos e Tabelas"
          subtitulo="Fármacos, diluições, doses e 10 tabelas de referência."
          restantes={compra.downloadsCatalogoRestantes}
          bloqueado={compra.expirado || compra.downloadsCatalogoRestantes === 0}
          state={catalogo}
          onLiberar={liberar}
        />
      </div>
    </section>
  );
}

function MinhaContaPage() {
  const navigate = useNavigate();
  const [compras, setCompras] = useState<MinhaCompra[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;
    getMinhasCompras()
      .then((c) => ativo && setCompras(c))
      .catch((e: unknown) => {
        if (ativo) setErro(e instanceof Error ? e.message : "Não foi possível carregar suas compras.");
      });
    return () => {
      ativo = false;
    };
  }, []);

  async function sair() {
    await supabase.auth.signOut();
    await navigate({ to: "/entrar", replace: true });
  }

  return (
    <div className="min-h-screen bg-papel text-tinta">
      <Header />
      <main className="mx-auto max-w-[860px] px-4 pb-20 pt-24 md:px-6">
        <div className="border border-musgo-300 p-5 text-center md:p-8">
          <div className="flex justify-center">
            <Logo size={52} />
          </div>
          <p className="label mt-6 text-ocre">ÁREA DO COMPRADOR</p>
          <h1 className="mt-3 font-heading text-xl font-bold uppercase tracking-wide sm:text-2xl">
            Seus arquivos do Arsenal Med 3.0
          </h1>
          <p className="mx-auto mt-3 max-w-[560px] text-[15px] leading-relaxed text-musgo-600">
            Gere o link somente quando for baixar. Abrir ou atualizar esta página não consome seu limite.
            Salve os dois PDFs no aparelho — a consulta funciona sem internet.
          </p>
        </div>

        {erro && (
          <p role="alert" className="mt-6 border border-alerta/40 bg-alerta/5 p-4 text-sm text-alerta">
            {erro}
          </p>
        )}

        {compras === null && !erro && (
          <p className="mt-8 text-center font-mono text-xs uppercase tracking-widest text-musgo-500">
            Carregando…
          </p>
        )}

        {compras !== null && compras.length === 0 && (
          <div className="mt-8 border border-musgo-300 p-6 text-center">
            <p className="text-[15px] leading-relaxed text-musgo-600">
              Não encontramos nenhuma compra confirmada nesta conta. Se você comprou com outro e-mail,
              escreva para suporte@arsenalmed.com.br.
            </p>
            <Link
              to="/comprar"
              className="mt-5 inline-flex min-h-12 items-center justify-center bg-ocre px-6 font-heading text-sm font-bold uppercase tracking-[0.12em] text-musgo-900"
            >
              VER O PACOTE COMPLETO
            </Link>
          </div>
        )}

        {compras?.map((c) => <CompraBloco key={c.id} compra={c} />)}

        <div className="mt-8 flex flex-col items-center gap-3 text-sm text-musgo-600">
          <button type="button" onClick={sair} className="underline underline-offset-4 hover:text-tinta">
            Sair da conta
          </button>
          <Link to="/" className="underline underline-offset-4 hover:text-tinta">
            Voltar para a página inicial
          </Link>
        </div>
      </main>
    </div>
  );
}
