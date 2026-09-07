import { Logo } from "./Logo";
import { ARSENAL_COMPARE_AT_PRICE, ARSENAL_PRICE } from "@/lib/product";

export function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 h-16 border-b border-musgo-300 bg-papel/92 backdrop-blur-sm">
      <div className="mx-auto flex h-full max-w-5xl items-center justify-between px-4 md:px-6">
        <a href="/" aria-label="Arsenal Med — início">
          <Logo size={30} />
        </a>
        <a
          href="/comprar"
          className="hidden bg-ocre px-4 py-2 font-heading text-sm font-bold uppercase tracking-[0.14em] text-musgo-900 transition-colors hover:bg-musgo-800 hover:text-papel sm:inline-block"
        >
          <span className="line-through decoration-alerta/60 opacity-70">{ARSENAL_COMPARE_AT_PRICE}</span>{" "}
          {ARSENAL_PRICE} — Comprar
        </a>
        <a
          href="/comprar"
          className="bg-ocre px-3 py-2 font-heading text-xs font-bold uppercase tracking-[0.12em] text-musgo-900 transition-colors hover:bg-musgo-800 hover:text-papel sm:hidden"
        >
          Comprar {ARSENAL_PRICE}
        </a>
      </div>
    </header>
  );
}
