import { CrateIllustration } from "./CrateIllustration";
import { LeadCaptureModal } from "./LeadCaptureModal";

export function Hero() {
  return (
    <section className="bg-musgo-800 px-4 py-20 md:px-6 md:py-28">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-12 md:flex-row md:gap-10">
        <div className="w-full md:w-[58%]">
          <div className="flex items-center gap-2.5">
            <span className="inline-block h-2.5 w-2.5 bg-alerta" aria-hidden="true" />
            <p className="label text-ocre">EMERGÊNCIA E TERAPIA INTENSIVA</p>
          </div>
          <h1 className="mt-6 text-[34px] leading-[1.12] tracking-[0.03em] text-papel md:text-[46px]">
            O manual de plantão
            <br />
            organizado por cenário
            <span className="mt-2 block text-ocre">— não por classe farmacológica.</span>
          </h1>
          <p className="mt-6 font-heading text-[13px] font-semibold uppercase tracking-[0.12em] text-alerta-claro">
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
              href="#comprar"
              className="bg-ocre px-5 py-3 text-center font-heading text-sm font-bold uppercase tracking-[0.12em] text-musgo-900 transition-colors hover:bg-musgo-100"
            >
              QUERO O ARSENAL MED 3.0 — R$ 69,90
            </a>
            <LeadCaptureModal>
              <button
                type="button"
                className="border border-musgo-500 px-5 py-3 text-center font-heading text-sm font-bold uppercase tracking-[0.12em] text-musgo-100 transition-colors hover:border-musgo-300"
              >
                BAIXAR 5 CASOS DE GRAÇA
              </button>
            </LeadCaptureModal>
          </div>
          <p className="mt-6 font-heading text-[11px] font-semibold uppercase tracking-[0.1em] text-musgo-500 md:text-xs">
            33 CASOS · CATÁLOGO DE FÁRMACOS · 10 TABELAS · RETAGUARDA OFF-LINE
          </p>
          <p className="mt-3 font-heading text-[11px] font-semibold uppercase tracking-[0.1em] text-ocre md:text-xs">
            + GUIA DE BOLSO: OS PRINCIPAIS CENÁRIOS DO PACIENTE GRAVE
          </p>
        </div>
        <div className="w-full md:w-[42%]">
          <CrateIllustration className="h-auto w-full" />
        </div>
      </div>
    </section>
  );
}
