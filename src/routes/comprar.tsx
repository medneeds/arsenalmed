import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Header } from "../components/Header";
import { Logo } from "../components/Logo";
import { PaymentTestModeBanner } from "../components/PaymentTestModeBanner";
import { StripeEmbeddedCheckout } from "../components/StripeEmbeddedCheckout";
import { formatCpf, isValidCpf, onlyDigits } from "@/lib/cpf";
import {
  ARSENAL_COMPARE_AT_PRICE,
  ARSENAL_DISCOUNT_PERCENT,
  ARSENAL_PRICE,
  ARSENAL_SAVINGS,
} from "@/lib/product";
import { track } from "@/lib/analytics";

export const Route = createFileRoute("/comprar")({
  head: () => ({
    meta: [
      { title: "Comprar — Arsenal Med 3.0" },
      {
        name: "description",
        content: `${ARSENAL_PRICE}, pagamento único. Manual Completo + Catálogo de Fármacos e Tabelas em bônus. Cartão.`,
      },
      { property: "og:title", content: "Comprar — Arsenal Med 3.0" },
      {
        property: "og:description",
        content: `Manual Completo + Catálogo em bônus. ${ARSENAL_PRICE}, pagamento único. Cartão.`,
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://arsenalmed.com.br/comprar" },
      { property: "og:locale", content: "pt_BR" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://arsenalmed.com.br/comprar" }],
  }),
  component: ComprarPage,
});

function ComprarPage() {
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [started, setStarted] = useState(false);

  const avancar = () => {
    const emailTrim = email.trim();
    if (!emailTrim || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim)) {
      setErro("Informe um e-mail válido — é nele que você recebe a confirmação e os links de entrega.");
      return;
    }
    if (!isValidCpf(cpf)) {
      setErro("Informe um CPF válido — ele identifica a licença pessoal dos seus arquivos.");
      return;
    }
    setErro(null);
    setStarted(true);
    track("checkout_started");
  };

  return (
    <div className="min-h-screen bg-papel text-tinta">
      <Header />
      <main className="mx-auto max-w-[600px] px-4 pb-20 pt-24 md:px-6">
        <PaymentTestModeBanner />

        <div className="mt-8 flex flex-col gap-4 border border-musgo-300 bg-papel p-5 sm:grid sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center">
          <Logo size={44} />
          <div className="min-w-0">
            <p className="label text-ocre">PACOTE COMPLETO</p>
            <h1 className="font-heading text-xl font-bold uppercase tracking-wide text-tinta">
              Arsenal Med 3.0
            </h1>
            <p className="mt-1 flex flex-wrap items-baseline gap-x-2 font-mono text-lg font-semibold text-tinta">
              <span className="font-medium text-musgo-400 line-through decoration-alerta/60">{ARSENAL_COMPARE_AT_PRICE}</span>{" "}
              {ARSENAL_PRICE}
              <span className="ml-2 font-heading text-[12px] font-bold uppercase tracking-[0.12em] text-ocre">
                −{ARSENAL_DISCOUNT_PERCENT}% · economize {ARSENAL_SAVINGS}
              </span>
            </p>
          </div>
        </div>

        <div className="mt-4 border border-musgo-300 bg-papel-2 p-5 text-sm leading-relaxed text-musgo-700">
          <p className="font-heading font-bold uppercase tracking-[0.08em] text-tinta">Você recebe</p>
          <p className="mt-2">1. Arsenal Med 3.0 — Manual Completo com 33 cenários.</p>
          <p>2. Catálogo de Fármacos e Tabelas — segundo volume incluído como bônus, com 10 tabelas.</p>
          <p className="mt-2">
            Pagamento único, sem assinatura. Após a confirmação, os dois downloads ficam disponíveis na página de
            entrega e o mesmo acesso é enviado por e-mail. O acesso fica ativo por 7 dias, com até 5 downloads por
            volume.
          </p>
          <p className="mt-2">Garantia de 7 dias: reembolso integral, sem justificativa.</p>
        </div>

        <ul className="mt-4 grid gap-3 border border-musgo-300 bg-papel p-5 text-sm leading-relaxed text-musgo-700 sm:grid-cols-2">
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-[2px] font-mono text-ocre">
              ▮
            </span>
            <span>
              <span className="block font-heading font-bold uppercase tracking-[0.08em] text-tinta">
                Pagamento seguro via Stripe
              </span>
              Cobrança processada pela Stripe, em ambiente oficial. Os dados do cartão são digitados direto na
              Stripe e não passam por este site.
            </span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-[2px] font-mono text-ocre">
              ▮
            </span>
            <span>
              <span className="block font-heading font-bold uppercase tracking-[0.08em] text-tinta">
                Entrega imediata
              </span>
              Assim que o pagamento é confirmado, os dois volumes ficam disponíveis para download na hora e o mesmo
              acesso chega ao seu e-mail.
            </span>
          </li>
        </ul>

        {!started ? (
          <div className="mt-6 border border-musgo-300 p-5">
            <label htmlFor="email" className="label block text-musgo-600">
              E-mail para receber a compra
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErro(null);
              }}
              placeholder="voce@exemplo.com"
              autoComplete="email"
              className="mt-3 w-full border border-musgo-300 bg-papel px-4 py-3 font-mono text-sm text-tinta outline-none placeholder:text-musgo-300 focus:border-musgo-500"
            />
            <p className="mt-2 text-sm leading-relaxed text-musgo-600">
              Use um e-mail a que você tenha acesso. Ele será usado para confirmação, entrega e atualizações da versão 3.x.
            </p>

            <label htmlFor="cpf" className="label mt-6 block text-musgo-600">
              CPF
            </label>
            <input
              id="cpf"
              inputMode="numeric"
              autoComplete="off"
              value={cpf}
              onChange={(e) => {
                setCpf(formatCpf(e.target.value));
                setErro(null);
              }}
              placeholder="000.000.000-00"
              maxLength={14}
              aria-invalid={erro ? true : undefined}
              className={`mt-3 w-full border bg-papel px-4 py-3 font-mono text-sm text-tinta outline-none placeholder:text-musgo-300 focus:border-musgo-500 ${
                erro ? "border-alerta" : "border-musgo-300"
              }`}
            />
            <p className="mt-2 text-sm leading-relaxed text-musgo-600">
              O CPF e o e-mail identificam sua licença pessoal e intransferível nos arquivos entregues.
            </p>
            {erro ? <p className="mt-2 text-sm font-semibold text-alerta">{erro}</p> : null}

            <button
              onClick={avancar}
              className="mt-5 flex min-h-14 w-full items-center justify-center bg-ocre px-5 py-4 text-center font-heading text-base font-bold uppercase tracking-[0.12em] text-musgo-900 transition-colors hover:bg-musgo-800 hover:text-papel"
            >
              CONTINUAR PARA PAGAMENTO
            </button>
            <p className="mt-4 text-center text-sm text-musgo-600">
              Pagamento processado pela Stripe · seus dados de cartão não passam por este site
            </p>
            <p className="mt-3 text-center text-xs leading-relaxed text-musgo-500">
              Ao continuar, você concorda com a utilização dos dados necessária para processar a compra e entregar os arquivos. Veja a{" "}
              <Link to="/privacidade" className="underline underline-offset-2 hover:text-tinta">
                Política de Privacidade
              </Link>
              .
            </p>
          </div>
        ) : (
          <div className="mt-6">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-sm text-musgo-600">
              <span className="min-w-0 break-all font-mono text-xs">{email.trim().toLowerCase()}</span>
              <button
                type="button"
                onClick={() => setStarted(false)}
                className="underline underline-offset-4 hover:text-tinta"
              >
                Corrigir e-mail ou CPF
              </button>
            </div>
            <StripeEmbeddedCheckout
              {...(email ? { customerEmail: email.trim().toLowerCase() } : {})}
              cpf={onlyDigits(cpf)}
            />
            <p className="mt-4 text-center text-sm leading-relaxed text-musgo-600">
              Pagamento processado pela Stripe. Se você fechar esta janela por engano, volte por este mesmo
              endereço — nada é cobrado duas vezes.
            </p>
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
