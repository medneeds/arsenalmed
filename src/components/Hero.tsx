import { LeadCaptureModal } from "./LeadCaptureModal";
import { track } from "@/lib/analytics";
import { ARSENAL_PRICE } from "@/lib/product";
import { TopoLines } from "./TopoLines";
import { Vsl } from "./Vsl";

// Seção principal: título curto, a VSL em destaque e, logo abaixo, as duas
// portas de entrada — comprar o Arsenal ou testar 5 casos grátis.
export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-papel px-4 pb-12 pt-6 md:px-6 md:pb-20 md:pt-8">
      <TopoLines className="z-0" />
      <div className="relative z-10 mx-auto max-w-4xl">
        <div className="flex items-center justify-center gap-2.5">
          <span className="inline-block h-2.5 w-2.5 shrink-0 bg-alerta" aria-hidden="true" />
          <p className="label text-ocre">EMERGÊNCIA E TERAPIA INTENSIVA</p>
        </div>
        <h1 className="mx-auto mt-4 max-w-[24ch] text-center text-[26px] leading-[1.15] tracking-[0.02em] text-tinta sm:text-[32px] md:text-[42px] md:tracking-[0.03em]">
          O guia de plantão por <span className="text-ocre">cenário clínico</span>
        </h1>
        <p className="mx-auto mt-3 max-w-[46ch] text-center md:max-w-[64ch] text-[15px] leading-relaxed text-musgo-700 md:text-[17px]">
          Para o paciente grave — ou potencialmente grave. <strong className="text-tinta">Aperte o play</strong> e
          veja em 2 minutos e meio como ele funciona.
        </p>

        <div className="mx-auto mt-6 max-w-[800px] md:mt-6">
          <Vsl />
        </div>

        <div className="mx-auto mt-6 flex max-w-[800px] flex-col gap-3 sm:flex-row md:mt-6">
          <a
            href="#preco"
            onClick={() => track("explore_product", { origem: "hero_vsl" })}
            className="flex min-h-14 flex-1 items-center justify-center bg-ocre px-5 py-3 text-center font-heading text-sm font-bold uppercase tracking-[0.12em] text-musgo-900 transition-colors hover:bg-musgo-800 hover:text-papel md:text-base"
          >
            QUERO O ARSENAL · {ARSENAL_PRICE}
          </a>
          <LeadCaptureModal origem="hero">
            <button
              type="button"
              className="flex min-h-14 flex-1 items-center justify-center border-2 border-musgo-700 px-5 py-3 text-center font-heading text-sm font-bold uppercase tracking-[0.12em] text-musgo-800 transition-colors hover:bg-musgo-800 hover:text-papel md:text-base"
            >
              TESTAR 5 CASOS GRÁTIS
            </button>
          </LeadCaptureModal>
        </div>
        <p className="mt-4 text-center font-heading text-[11px] font-semibold uppercase tracking-[0.1em] text-musgo-600 md:text-xs">
          Pagamento único · 7 dias de garantia · Consulta off-line
        </p>
        <p className="mt-2 text-center font-heading text-[11px] font-semibold uppercase tracking-[0.1em] text-ocre md:text-xs">
          2 volumes · 33 cenários · manual completo + catálogo de fármacos e 10 tabelas em bônus
        </p>
      </div>
    </section>
  );
}
