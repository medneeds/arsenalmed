import { createFileRoute } from "@tanstack/react-router";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { CompactoLeadForm } from "../components/CompactoLeadForm";
import { track } from "@/lib/analytics";

const SITE = "https://arsenalmed.com.br";

export const Route = createFileRoute("/compacto")({
  head: () => ({
    meta: [
      { title: "Arsenal Compacto — 5 Cenários do Paciente Grave, Grátis" },
      {
        name: "description",
        content:
          "Baixe grátis o Arsenal Compacto: 5 cenários de emergência na íntegra — intubação, choque séptico, estado de mal epiléptico, cetoacidose e hipercalemia — mais as 11 armadilhas que mais custam caro no plantão.",
      },
      { property: "og:title", content: "Arsenal Compacto — 5 Cenários do Paciente Grave, Grátis" },
      {
        property: "og:description",
        content:
          "5 cenários de emergência na íntegra + 11 armadilhas do plantão. PDF gratuito, sem cartão.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE}/compacto` },
      { property: "og:locale", content: "pt_BR" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: `${SITE}/compacto` }],
  }),
  component: CompactoPage,
});

const CENARIOS = [
  { n: "01", titulo: "Intubação de emergência" },
  { n: "02", titulo: "Choque séptico" },
  { n: "03", titulo: "Estado de mal epiléptico" },
  { n: "04", titulo: "Cetoacidose diabética" },
  { n: "05", titulo: "Hipercalemia grave" },
];

function CompactoPage() {
  return (
    <div className="min-h-screen bg-papel text-tinta">
      <Header />
      <main className="pt-16">
        {/* Hero + formulário */}
        <section className="bg-papel px-4 py-16 md:px-6 md:py-24">
          <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-2 md:gap-14">
            <div>
              <p className="label text-musgo-500">GRATUITO · SEM CARTÃO</p>
              <h1 className="mt-5 text-tinta">
                5 cenários do paciente grave, prontos para o seu próximo plantão
              </h1>
              <p className="mt-6 text-[17px] leading-relaxed text-tinta">
                O Arsenal Compacto é um guia de bolso em PDF com cinco emergências na íntegra —
                conduta passo a passo, doses e o que fazer primeiro — mais as 11 armadilhas que
                mais custam caro na beira do leito.
              </p>
              <ul className="mt-7 space-y-3">
                {[
                  "Consulta off-line, direto no celular",
                  "Organizado por cenário, não por classe farmacológica",
                  "O mesmo formato da edição completa — sem versão reduzida",
                ].map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center bg-musgo-700 font-heading text-xs font-bold text-papel">
                      ✓
                    </span>
                    <span className="text-[16px] leading-relaxed text-tinta">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="h-fit border border-musgo-300 bg-papel-2 p-6 md:p-8">
              <CompactoLeadForm origem="pagina_compacto" />
            </div>
          </div>
        </section>

        {/* Os 5 cenários */}
        <section className="bg-papel-2 px-4 py-16 md:px-6 md:py-24">
          <div className="mx-auto max-w-3xl">
            <p className="label text-musgo-500">O QUE TEM DENTRO</p>
            <h2 className="mt-5 text-tinta">Os cinco cenários</h2>
            <div className="mt-8 divide-y divide-musgo-300 border border-musgo-300 bg-papel">
              {CENARIOS.map((c) => (
                <div key={c.n} className="flex items-center gap-4 px-5 py-4">
                  <span className="font-mono text-sm font-bold text-ocre">{c.n}</span>
                  <span className="font-heading text-base font-bold uppercase tracking-[0.06em] text-tinta">
                    {c.titulo}
                  </span>
                </div>
              ))}
              <div className="flex items-center gap-4 bg-musgo-100 px-5 py-4">
                <span className="font-mono text-sm font-bold text-ferrugem">+</span>
                <span className="font-heading text-base font-bold uppercase tracking-[0.06em] text-tinta">
                  As 11 armadilhas que mais custam caro no plantão
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Ponte para o completo */}
        <section className="bg-papel px-4 py-16 md:px-6 md:py-24">
          <div className="mx-auto max-w-[680px] text-center">
            <p className="label text-musgo-500">EDIÇÃO COMPLETA</p>
            <h2 className="mt-5 text-tinta">Estes são 5 dos 33 cenários</h2>
            <p className="mt-6 text-[16px] leading-relaxed text-tinta">
              O Arsenal Med 3.0 é a edição completa: 33 cenários do paciente grave em 2 volumes —
              Manual Completo e o Catálogo de Fármacos e Tabelas em bônus.
            </p>
            <a
              href="/"
              onClick={() => track("click_buy", { origem: "pagina_compacto_rodape" })}
              className="mt-8 inline-flex min-h-12 items-center justify-center border border-musgo-600 px-6 py-3 font-heading text-sm font-bold uppercase tracking-[0.12em] text-musgo-800 transition-colors hover:bg-musgo-800 hover:text-papel"
            >
              CONHECER O ARSENAL MED 3.0
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
