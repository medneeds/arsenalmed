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
import { ARSENAL_COMPARE_AT_PRICE, ARSENAL_PRICE } from "@/lib/product";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Arsenal Med 3.0 — Manual de Plantão" },
      {
        name: "description",
        content:
          `33 cenários de emergência e terapia intensiva para consulta off-line. Manual completo + catálogo de fármacos e 10 tabelas em bônus. De ${ARSENAL_COMPARE_AT_PRICE} por ${ARSENAL_PRICE}, pagamento único.`,
      },
      { property: "og:title", content: "Arsenal Med 3.0 — Manual de Plantão" },
      {
        property: "og:description",
        content:
          `33 cenários do paciente grave, organizados por cenário. Manual completo + catálogo em bônus. ${ARSENAL_PRICE}, pagamento único.`,
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
