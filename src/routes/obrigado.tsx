import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Header } from "../components/Header";
import { Logo } from "../components/Logo";
import { confirmPurchase } from "@/utils/payments.functions";
import { getStripeEnvironment } from "@/lib/stripe";

const POLL_INTERVAL_MS = 10_000;
const POLL_TIMEOUT_MS = 5 * 60_000;

type State =
  | { kind: "verificando" }
  | { kind: "pendente" }
  | { kind: "pago"; token: string }
  | { kind: "erro"; message: string }
  | { kind: "invalido" };

export const Route = createFileRoute("/obrigado")({
  validateSearch: (search: Record<string, unknown>): { session_id: string | undefined } => ({
    session_id: typeof search["session_id"] === "string" ? (search["session_id"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Obrigado — Arsenal Med 3.0" },
      { name: "description", content: "Confirmação da sua compra do Arsenal Med 3.0." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ObrigadoPage,
});

function ObrigadoPage() {
  const sessionId = Route.useSearch()["session_id"];
  const [state, setState] = useState<State>({ kind: "verificando" });
  const startRef = useRef(Date.now());

  useEffect(() => {
    if (!sessionId || !/^cs_(test|live)_/.test(sessionId)) {
      setState({ kind: "invalido" });
      return;
    }

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    async function check() {
      try {
        const result = await confirmPurchase({
          data: { sessionId: sessionId!, environment: getStripeEnvironment() },
        });
        if (cancelled) return;
        if (result.status === "pago") {
          setState({ kind: "pago", token: result.token });
          return;
        }
        if (result.status === "erro") {
          setState({ kind: "erro", message: result.message });
          return;
        }
        // pendente (comum no Pix) — continua verificando por até 5 minutos
        if (Date.now() - startRef.current < POLL_TIMEOUT_MS) {
          setState({ kind: "pendente" });
          timer = setTimeout(check, POLL_INTERVAL_MS);
        } else {
          setState({
            kind: "erro",
            message:
              "Ainda não recebemos a confirmação. Assim que o pagamento for compensado, o link chega no seu e-mail.",
          });
        }
      } catch {
        if (!cancelled) setState({ kind: "erro", message: "Falha ao consultar o pagamento." });
      }
    }

    check();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-papel text-tinta">
      <Header />
      <main className="mx-auto max-w-[560px] px-4 pb-20 pt-24 md:px-6">
        <div className="border border-musgo-300 p-6 text-center md:p-10">
          <div className="flex justify-center">
            <Logo size={56} />
          </div>

          {state.kind === "verificando" && (
            <>
              <h1 className="mt-6 font-heading text-2xl font-bold uppercase tracking-wide">
                Confirmando pagamento
              </h1>
              <p className="mt-3 text-[16px] leading-relaxed text-musgo-600">
                Um instante, estamos verificando com a Stripe.
              </p>
            </>
          )}

          {state.kind === "pendente" && (
            <>
              <p className="label mt-6 text-ocre">PAGAMENTO EM PROCESSAMENTO</p>
              <h1 className="mt-4 font-heading text-2xl font-bold uppercase tracking-wide">
                Quase lá
              </h1>
              <p className="mt-3 text-[16px] leading-relaxed text-musgo-600">
                Pagamento em processamento — normal no Pix. O link de download chega no seu e-mail
                em alguns minutos. Esta página atualiza sozinha.
              </p>
              <p className="mt-6 font-mono text-xs uppercase tracking-widest text-musgo-300">
                verificando a cada 10 segundos
              </p>
            </>
          )}

          {state.kind === "pago" && (
            <>
              <p className="label mt-6 text-ocre">PAGAMENTO CONFIRMADO</p>
              <h1 className="mt-4 font-heading text-2xl font-bold uppercase tracking-wide">
                Arsenal à disposição
              </h1>
              <p className="mt-3 text-[16px] leading-relaxed text-musgo-600">
                Obrigado pela compra. O link também foi enviado para o seu e-mail e fica válido por
                7 dias, com até 5 downloads.
              </p>
              <Link
                to="/download"
                search={{ token: state.token }}
                className="mt-8 block bg-ocre px-5 py-4 text-center font-heading text-base font-bold uppercase tracking-[0.12em] text-musgo-900 transition-colors hover:bg-musgo-800 hover:text-papel"
              >
                BAIXAR O MANUAL AGORA
              </Link>
            </>
          )}

          {state.kind === "erro" && (
            <>
              <h1 className="mt-6 font-heading text-2xl font-bold uppercase tracking-wide">
                Não foi possível confirmar agora
              </h1>
              <p className="mt-3 text-[16px] leading-relaxed text-musgo-600">{state.message}</p>
            </>
          )}

          {state.kind === "invalido" && (
            <>
              <h1 className="mt-6 font-heading text-2xl font-bold uppercase tracking-wide">
                Link inválido
              </h1>
              <p className="mt-3 text-[16px] leading-relaxed text-musgo-600">
                Não encontramos uma compra neste endereço. Se você acabou de pagar, o link chega no
                seu e-mail.
              </p>
            </>
          )}

          <p className="mt-8 text-sm text-musgo-600">
            <Link to="/" className="underline underline-offset-4 hover:text-tinta">
              Voltar para a página inicial
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
