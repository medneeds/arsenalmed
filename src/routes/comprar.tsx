import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Header } from "../components/Header";
import { Logo } from "../components/Logo";
import { PaymentTestModeBanner } from "../components/PaymentTestModeBanner";
import { StripeEmbeddedCheckout } from "../components/StripeEmbeddedCheckout";
import { formatCpf, isValidCpf, onlyDigits } from "@/lib/cpf";


export const Route = createFileRoute("/comprar")({
  head: () => ({
    meta: [
      { title: "Comprar — Arsenal Med 3.0" },
      { name: "description", content: "Pagamento único de R$ 69,90. Pix ou cartão. Acesso imediato ao manual." },
      { property: "og:title", content: "Comprar — Arsenal Med 3.0" },
      { property: "og:description", content: "Pagamento único de R$ 69,90. Pix ou cartão. Acesso imediato ao manual." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ComprarPage,
});

function ComprarPage() {
  const [email, setEmail] = useState("");
  const [started, setStarted] = useState(false);

  return (
    <div className="min-h-screen bg-papel text-tinta">
      <Header />
      <main className="mx-auto max-w-[560px] px-4 pb-20 pt-24 md:px-6">
        <PaymentTestModeBanner />

        <div className="mt-8 flex items-center gap-4 border border-musgo-300 bg-papel p-5">
          <Logo size={44} />
          <div>
            <p className="label text-ocre">EDIÇÃO COMPLETA</p>
            <h1 className="font-heading text-xl font-bold uppercase tracking-wide text-tinta">
              Arsenal Med 3.0
            </h1>
            <p className="font-mono text-lg font-semibold text-tinta">R$ 69,90</p>
          </div>
        </div>

        {!started ? (
          <div className="mt-6 border border-musgo-300 p-5">
            <label htmlFor="email" className="label block text-musgo-600">
              E-mail para receber o manual (opcional)
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@exemplo.com"
              className="mt-3 w-full border border-musgo-300 bg-papel px-4 py-3 font-mono text-sm text-tinta outline-none placeholder:text-musgo-300 focus:border-musgo-500"
            />
            <p className="mt-2 text-sm leading-relaxed text-musgo-600">
              Se deixar em branco, você informa o e-mail na tela de pagamento. O link de download
              chega por e-mail e também aparece logo após a confirmação.
            </p>
            <button
              onClick={() => setStarted(true)}
              className="mt-5 block w-full bg-ocre px-5 py-4 text-center font-heading text-base font-bold uppercase tracking-[0.12em] text-musgo-900 transition-colors hover:bg-musgo-800 hover:text-papel"
            >
              CONTINUAR PARA PAGAMENTO
            </button>
            <p className="mt-4 text-center text-sm text-musgo-600">
              Pix ou cartão · pagamento processado pela Stripe
            </p>
          </div>
        ) : (
          <div className="mt-6">
            <StripeEmbeddedCheckout {...(email ? { customerEmail: email } : {})} />
          </div>
        )}

        <p className="mt-8 text-center text-sm text-musgo-600">
          <Link to="/" className="underline underline-offset-4 hover:text-tinta">
            Voltar para a página inicial
          </Link>
        </p>
      </main>
    </div>
  );
}
