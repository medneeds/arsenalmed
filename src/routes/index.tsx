import { createFileRoute } from "@tanstack/react-router";
import { Header } from "../components/Header";
import { Hero } from "../components/Hero";
import { Problema } from "../components/Problema";
import { Anatomia } from "../components/Anatomia";
import { Amostra } from "../components/Amostra";


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
        {/* HERO — placeholder, substituído no próximo passo */}
        <section className="flex h-[70vh] flex-col items-center justify-center gap-8 bg-musgo-800 px-4">
          <Logo size={96} variant="musgo" />
          <p className="label text-musgo-300">Hero em construção</p>
        </section>
      </main>
    </div>
  );
}
