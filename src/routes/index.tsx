import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
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
import { Footer } from "../components/Footer";
import { PaymentTestModeBanner } from "../components/PaymentTestModeBanner";
import { track } from "@/lib/analytics";
import {
  ARSENAL_COMPARE_AT_PRICE,
  ARSENAL_PRICE,
  ARSENAL_PRODUCT,
} from "@/lib/product";

const SITE = "https://arsenalmed.com.br";

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
      { property: "og:url", content: `${SITE}/` },
      { property: "og:locale", content: "pt_BR" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE}/` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          name: ARSENAL_PRODUCT.name,
          description:
            "Manual de plantão em PDF organizado por cenário clínico, com 33 cenários de emergência e terapia intensiva, mais o Catálogo de Fármacos e Tabelas como segundo volume.",
          brand: { "@type": "Brand", name: "Arsenal Med" },
          author: { "@type": "Person", name: "Artur Batista" },
          inLanguage: "pt-BR",
          offers: {
            "@type": "Offer",
            url: `${SITE}/comprar`,
            price: (ARSENAL_PRODUCT.priceCents / 100).toFixed(2),
            priceCurrency: "BRL",
            availability: "https://schema.org/InStock",
          },
        }),
      },
    ],
  }),
  component: Index,
});

function Index() {
  useEffect(() => {
    track("view_landing");
  }, []);

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
      <Footer />
    </div>
  );
}
