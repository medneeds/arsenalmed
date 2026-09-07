import { createFileRoute } from "@tanstack/react-router";
import { Header } from "../components/Header";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Política de Privacidade — Arsenal Med" },
      {
        name: "description",
        content:
          "Como o Arsenal Med coleta, usa e protege dados pessoais para entrega dos materiais, pagamentos e comunicações.",
      },
      { property: "og:title", content: "Política de Privacidade — Arsenal Med" },
      { property: "og:type", content: "article" },
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
            Ao pedir o Arsenal Compacto, registramos nome, e-mail, perfil profissional, origem do cadastro e a data e o texto do consentimento aceito. Em uma compra, registramos o e-mail, o CPF informado para identificar a licença pessoal, identificadores técnicos da transação e o status do pagamento. Os dados financeiros do cartão ou Pix são processados pela Stripe e não são armazenados pelo Arsenal Med.
          </p>

          <h2 className="mt-10 text-tinta">Para que usamos</h2>
          <p className="mt-3 text-tinta">
            Para entregar o material solicitado, gerar sua cópia identificada, confirmar pagamentos, dar suporte, disponibilizar correções e atualizações da versão adquirida e, quando houver consentimento, enviar comunicações sobre o Arsenal Med.
          </p>

          <h2 className="mt-10 text-tinta">Compartilhamento necessário</h2>
          <p className="mt-3 text-tinta">
            Utilizamos fornecedores de infraestrutura estritamente necessários para operar o serviço, como Stripe para pagamentos, Supabase para banco e armazenamento e o serviço de e-mail conectado ao projeto. Não vendemos listas nem comercializamos seus dados pessoais.
          </p>

          <h2 className="mt-10 text-tinta">Seus direitos</h2>
          <p className="mt-3 text-tinta">
            Você pode cancelar comunicações promocionais a qualquer momento e solicitar acesso, correção ou exclusão dos dados quando aplicável. Dados que precisem ser mantidos por obrigação legal, prevenção a fraude ou comprovação da transação podem ser conservados pelo período necessário.
          </p>
        </div>
      </main>
    </div>
  );
}
