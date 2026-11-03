import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
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
  // Página de destino da campanha de captação: conta como visita qualificada (ViewContent no Pixel).
  useEffect(() => {
    track("view_landing", { pagina: "compacto" });
  }, []);

  return (
    <div className="min-h-screen bg-papel text-tinta">
      <Header />
      <main className="pt-16">
        {/* Direto ao ponto: quem chega veio do anúncio — título, formulário e pronto. */}
        <section className="bg-papel px-4 pb-12 pt-8 md:px-6 md:py-20">
          <div className="mx-auto grid max-w-5xl items-start gap-6 md:grid-cols-[1.1fr_1fr] md:gap-14">
            <div>
              <p className="label text-musgo-500">GRATUITO · SEM CARTÃO · PDF</p>
              <h1 className="mt-4 text-[28px] leading-[1.15] text-tinta md:text-[40px]">
                5 cenários do paciente grave, prontos para o seu próximo plantão
              </h1>
              <p className="mt-4 text-[16px] leading-relaxed text-tinta md:text-[17px]">
                Conduta na ordem, doses e as 11 armadilhas que mais custam caro na beira do leito.
                Abre off-line no celular.
              </p>
              <ul className="mt-6 hidden space-y-3 md:block">
                {CENARIOS.map((c) => (
                  <li key={c.n} className="flex items-center gap-3">
                    <span className="font-mono text-sm font-bold text-ocre">{c.n}</span>
                    <span className="font-heading text-sm font-bold uppercase tracking-[0.06em] text-tinta">
                      {c.titulo}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="h-fit border border-musgo-300 bg-papel-2 p-5 md:p-8">
              <CompactoLeadForm origem="pagina_compacto" />
            </div>
          </div>
        </section>

        {/* Os 5 cenários */}
        <section className="bg-papel-2 px-4 py-12 md:hidden">
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

      </main>
      <Footer />
    </div>
  );
}
