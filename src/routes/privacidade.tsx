import { createFileRoute } from "@tanstack/react-router";
import { Header } from "../components/Header";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Política de Privacidade — Arsenal Med" },
      {
        name: "description",
        content:
          "Como o Arsenal Med coleta, usa e protege seus dados pessoais, e como cancelar o recebimento de comunicações.",
      },
      { property: "og:title", content: "Política de Privacidade — Arsenal Med" },
      {
        property: "og:description",
        content: "Como o Arsenal Med coleta, usa e protege seus dados pessoais.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Privacidade,
});

function Privacidade() {
  return (
    <div className="min-h-screen bg-papel text-tinta">
      <Header />
      <main className="px-4 pb-24 pt-28 md:px-6">
        <div className="mx-auto max-w-[680px]">
          <p className="label text-musgo-500">LGPD</p>
          <h1 className="mt-5 text-tinta">Política de privacidade</h1>

          <h2 className="mt-10 text-tinta">Quais dados coletamos</h2>
          <p className="mt-3 text-tinta">
            Ao pedir o Arsenal Compacto, registramos nome, e-mail, perfil profissional, a origem do
            cadastro e a data e o texto do consentimento que você aceitou. Em uma compra, registramos
            o e-mail e os dados do pagamento processados pela Stripe.
          </p>

          <h2 className="mt-10 text-tinta">Para que usamos</h2>
          <p className="mt-3 text-tinta">
            Para enviar o material solicitado, dar suporte, entregar atualizações do manual e enviar
            comunicações sobre o Arsenal Med. Não vendemos nem compartilhamos sua lista com
            terceiros.
          </p>

          <h2 className="mt-10 text-tinta">Seus direitos</h2>
          <p className="mt-3 text-tinta">
            Você pode cancelar o recebimento a qualquer momento pelo link no rodapé de cada e-mail, e
            pedir acesso, correção ou exclusão dos seus dados escrevendo para o suporte.
          </p>
        </div>
      </main>
    </div>
  );
}
