import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Header } from "../components/Header";
import { Logo } from "../components/Logo";
import { confirmPurchase } from "@/utils/payments.functions";
import { getStripeEnvironment } from "@/lib/stripe";
import { track } from "@/lib/analytics";

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
      { title: "Compra — Arsenal Med 3.0" },
      { name: "description", content: "Confirmação e entrega da compra do Arsenal Med 3.0." },
      { name: "robots", content: "noindex,nofollow" },
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

    track("payment_return");
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
          track("payment_confirmed");
          return;
        }
        if (result.status === "erro") {
          setState({ kind: "erro", message: result.message });
          return;
        }
        if (Date.now() - startRef.current < POLL_TIMEOUT_MS) {
          setState({ kind: "pendente" });
          timer = setTimeout(check, POLL_INTERVAL_MS);
        } else {
          setState({
            kind: "erro",
            message:
              "Ainda não recebemos a confirmação. Pode levar alguns instantes. Assim que o pagamento for compensado, o acesso é liberado e o e-mail de entrega é enviado.",
          });
        }
      } catch {
        if (!cancelled) setState({ kind: "erro", message: "Falha ao consultar o pagamento. Tente atualizar esta página." });
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
      <main className="mx-auto max-w-[600px] px-4 pb-20 pt-24 md:px-6">
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
                Um instante. Estamos consultando a confirmação da Stripe.
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
                Esta página verifica automaticamente a confirmação a cada 10 segundos.
              </p>
              <p className="mt-4 text-[15px] leading-relaxed text-musgo-600">
                Você não perdeu a compra. Pode manter esta página aberta, atualizá-la ou fechá-la: assim que o
                pagamento é compensado, o acesso é liberado e o e-mail de entrega é enviado automaticamente para o
                endereço informado no checkout.
              </p>
            </>
          )}

          {state.kind === "pago" && (
            <>
              <p className="label mt-6 text-ocre">PAGAMENTO CONFIRMADO</p>
              <h1 className="mt-4 font-heading text-2xl font-bold uppercase tracking-wide">
                Seu Arsenal está liberado
              </h1>
              <p className="mt-3 text-[16px] leading-relaxed text-musgo-600">
                Você recebe dois volumes: o Manual Completo (33 cenários) e o Catálogo de Fármacos e Tabelas, em
                bônus. O mesmo acesso foi enviado para o seu e-mail. Ele fica ativo por 7 dias, com até 5 downloads
                por volume — guarde os PDFs no aparelho para consulta off-line.
              </p>
              <Link
                to="/download"
                search={{ token: state.token }}
                className="mt-8 flex min-h-14 items-center justify-center bg-ocre px-5 py-4 text-center font-heading text-base font-bold uppercase tracking-[0.12em] text-musgo-900 transition-colors hover:bg-musgo-800 hover:text-papel"
              >
                ACESSAR MEUS DOIS ARQUIVOS
              </Link>
            </>
          )}

          {state.kind === "erro" && (
            <>
              <h1 className="mt-6 font-heading text-2xl font-bold uppercase tracking-wide">
                Não foi possível confirmar agora
              </h1>
              <p className="mt-3 text-[16px] leading-relaxed text-musgo-600">{state.message}</p>
              <p className="mt-4 text-[15px] leading-relaxed text-musgo-600">
                Se o valor foi debitado, a compra está registrada: o e-mail de entrega é enviado assim que a Stripe
                confirmar. Não pague de novo — atualize esta página em alguns minutos ou responda ao e-mail da
                Stripe ou escreva para{" "}
                <a href="mailto:suporte@arsenalmed.com.br" className="font-semibold underline underline-offset-2">
                  suporte@arsenalmed.com.br
                </a>{" "}
                para falar com o suporte.
              </p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-6 inline-flex min-h-12 items-center justify-center border border-musgo-600 px-5 py-3 font-heading text-sm font-bold uppercase tracking-[0.12em] text-musgo-800 transition-colors hover:bg-musgo-800 hover:text-papel"
              >
                Verificar novamente
              </button>
            </>
          )}

          {state.kind === "invalido" && (
            <>
              <h1 className="mt-6 font-heading text-2xl font-bold uppercase tracking-wide">
                Link inválido
              </h1>
              <p className="mt-3 text-[16px] leading-relaxed text-musgo-600">
                Não encontramos uma sessão de compra neste endereço. Se você acabou de pagar, abra o link do
                e-mail de entrega — ele libera os dois arquivos. Nenhuma compra é perdida por atualizar ou fechar
                a página.
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
