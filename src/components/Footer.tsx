import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { track } from "@/lib/analytics";
import { ARSENAL_PRICE } from "@/lib/product";

export function Footer() {
  const ano = new Date().getFullYear();

  return (
    <footer className="border-t border-musgo-300 bg-papel-2 px-4 py-12 md:px-6 md:py-16">
      <div className="mx-auto max-w-[680px]">
        <Logo size={34} />

        <p className="mt-5 text-sm leading-relaxed text-musgo-700">
          Arsenal Med 3.0 — Manual Completo com 33 cenários e o Catálogo de Fármacos e Tabelas em bônus.
          Pagamento único de {ARSENAL_PRICE}, com garantia de 7 dias.
        </p>

        <p className="mt-4 text-sm leading-relaxed text-musgo-600">
          Material de consulta rápida destinado a médicos. Traz doses de referência e não substitui bula,
          julgamento clínico à beira do leito nem a padronização do seu serviço.
        </p>

        <p className="mt-4 font-mono text-xs uppercase tracking-widest text-musgo-500">
          Artur Batista · CRM/MA 11788
        </p>

        <nav aria-label="Rodapé" className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
          <Link
            to="/comprar"
            onClick={() => track("click_buy", { origem: "rodape" })}
            className="inline-flex min-h-11 items-center font-heading font-bold uppercase tracking-[0.1em] text-musgo-800 underline underline-offset-4 hover:text-tinta"
          >
            Comprar — {ARSENAL_PRICE}
          </Link>
          <Link
            to="/privacidade"
            className="inline-flex min-h-11 items-center text-musgo-700 underline underline-offset-4 hover:text-tinta"
          >
            Política de Privacidade
          </Link>
        </nav>

        <p className="mt-6 border-t border-musgo-300 pt-5 font-mono text-xs text-musgo-500">
          © {ano} Arsenal Med
        </p>
      </div>
    </footer>
  );
}
