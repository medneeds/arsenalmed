import { createFileRoute } from "@tanstack/react-router";
import { Header } from "../components/Header";
import { Hero } from "../components/Hero";
import { Problema } from "../components/Problema";
import { Anatomia } from "../components/Anatomia";
import { Amostra } from "../components/Amostra";
import { Conteudo } from "../components/Conteudo";
import { ParaQuem } from "../components/ParaQuem";
import { Autor } from "../components/Autor";
import { Preco } from "../components/Preco";
import { Faq } from "../components/Faq";
import { Compacto } from "../components/Compacto";
import { PaymentTestModeBanner } from "../components/PaymentTestModeBanner";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Arsenal Med — Manual de Sobrevivência Clínica" },
      {
        name: "description",
        content:
          "O manual prático de conduta clínica para o plantão brasileiro. Direto, prescritivo, sem enrolação.",
      },
      { property: "og:title", content: "Arsenal Med — Manual de Sobrevivência Clínica" },
      {
        property: "og:description",
        content:
          "O manual prático de conduta clínica para o plantão brasileiro. Direto, prescritivo, sem enrolação.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-papel text-tinta">
      <Header />
      <main className="pt-16">
        <PaymentTestModeBanner />
        <Hero />
        <Problema />
        <Anatomia />
        <Amostra />
        <Conteudo />
        <ParaQuem />
        <Autor />
        <Preco />
        <Faq />
        <Compacto />
      </main>
    </div>
  );
}
