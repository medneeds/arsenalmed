import { Logo } from "./Logo";
import { ARSENAL_COMPARE_AT_PRICE, ARSENAL_PRICE } from "@/lib/product";
import { track } from "@/lib/analytics";

export function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 h-16 border-b border-musgo-300 bg-papel/92 backdrop-blur-sm">
      <div className="mx-auto grid h-full max-w-5xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 md:px-6">
        <a href="/" aria-label="Arsenal Med — início" className="min-w-0 justify-self-start">
          <Logo size={30} />
        </a>
        <a
          href="/comprar"
          onClick={() => track("click_buy", { origem: "header" })}
          className="hidden min-h-11 shrink-0 items-center bg-ocre px-4 py-2 font-heading text-sm font-bold uppercase tracking-[0.14em] text-musgo-900 transition-colors hover:bg-musgo-800 hover:text-papel sm:inline-flex"
        >
          <span className="line-through decoration-alerta/60 opacity-70">{ARSENAL_COMPARE_AT_PRICE}</span>
          <span className="ml-1.5">{ARSENAL_PRICE} — Comprar</span>
        </a>
        <a
          href="/comprar"
          onClick={() => track("click_buy", { origem: "header_mobile" })}
          className="inline-flex min-h-11 shrink-0 items-center whitespace-nowrap bg-ocre px-3 py-2 font-heading text-xs font-bold uppercase tracking-[0.1em] text-musgo-900 transition-colors hover:bg-musgo-800 hover:text-papel sm:hidden"
        >
          Comprar {ARSENAL_PRICE}
        </a>
      </div>
    </header>
  );
}
