import { CrateIllustration } from "./CrateIllustration";
import { LeadCaptureModal } from "./LeadCaptureModal";
import { track } from "@/lib/analytics";
import { TopoLines } from "./TopoLines";
import { Stamp } from "./Stamp";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-musgo-800 px-4 py-16 md:px-6 md:py-28">
      <TopoLines tone="escuro" />
      <div className="relative mx-auto flex max-w-5xl flex-col items-center gap-10 md:flex-row md:gap-10">
        <div className="w-full min-w-0 md:w-[58%]">
          <div className="flex items-center gap-2.5">
            <span className="inline-block h-2.5 w-2.5 shrink-0 bg-alerta" aria-hidden="true" />
            <p className="label text-ocre">EMERGÊNCIA E TERAPIA INTENSIVA</p>
          </div>
          <h1 className="mt-6 text-[30px] leading-[1.14] tracking-[0.02em] text-papel sm:text-[34px] md:text-[46px] md:tracking-[0.03em]">
            O guia de bolso do plantão
            <br />
            organizado por{" "}
            <span className="text-ocre">cenário clínico</span>
          </h1>
          <p className="mt-6 inline-block bg-alerta px-3 py-1.5 font-heading text-[12px] font-semibold uppercase tracking-[0.1em] text-papel sm:text-[13px] sm:tracking-[0.12em]">
            Para o paciente grave — ou potencialmente grave.
          </p>

          <p className="mt-4 max-w-[52ch] text-musgo-100">
            <em className="italic">
              Você não procura a diluição da fenitoína. Abre o cenário da crise convulsiva e lê, na ordem, o que
              fazer.
            </em>
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#preco"
              onClick={() => track("explore_product", { origem: "hero" })}
              className="flex min-h-12 items-center justify-center bg-ocre px-5 py-3 text-center font-heading text-sm font-bold uppercase tracking-[0.12em] text-musgo-900 transition-colors hover:bg-musgo-100"
            >
              QUERO O ARSENAL
            </a>
            <LeadCaptureModal origem="hero">
              <button
                type="button"
                className="flex min-h-12 items-center justify-center border border-musgo-500 px-5 py-3 text-center font-heading text-sm font-bold uppercase tracking-[0.12em] text-musgo-100 transition-colors hover:border-musgo-300"
              >
                TESTAR 5 CASOS GRÁTIS
              </button>
            </LeadCaptureModal>
          </div>
          <p className="mt-6 font-heading text-[11px] font-semibold uppercase tracking-[0.1em] text-musgo-500 md:text-xs">
            2 VOLUMES · 33 CENÁRIOS · MANUAL COMPLETO + CATÁLOGO DE FÁRMACOS E 10 TABELAS EM BÔNUS
          </p>
          <p className="mt-3 font-heading text-[11px] font-semibold uppercase tracking-[0.1em] text-ocre md:text-xs">
            CONSULTA OFF-LINE — ABRE SEM INTERNET
          </p>
        </div>
        <div className="relative w-full min-w-0 md:w-[42%]">
          <CrateIllustration className="h-auto w-full" />
          <Stamp
            tone="escuro"
            top="EMERGÊNCIA"
            main="UTI"
            className="absolute -top-2 right-0 md:-right-4 md:top-2"
          />
        </div>
      </div>
    </section>
  );
}
