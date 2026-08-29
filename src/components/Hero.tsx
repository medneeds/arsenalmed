import { CrateIllustration } from "./CrateIllustration";

export function Hero() {
  return (
    <section className="bg-musgo-800 px-4 py-20 md:px-6 md:py-28">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-12 md:flex-row md:gap-10">
        <div className="w-full md:w-[58%]">
          <p className="label text-ocre">EMERGÊNCIA E TERAPIA INTENSIVA</p>
          <h1 className="mt-5 text-papel">
            São 3h40. A pressão é 88 por 54.
            <br />
            <span className="text-ocre">E você precisa intubar.</span>
          </h1>
          <p className="mt-6 max-w-[52ch] text-musgo-100">
            O Arsenal Med é um manual de plantão organizado por cena, não por classe farmacológica. Você
            não procura a diluição da fenitoína. Você abre a crise convulsiva e lê, na ordem, o que fazer.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#comprar"
              className="bg-ocre px-5 py-3 text-center font-heading text-sm font-bold uppercase tracking-[0.12em] text-musgo-900 transition-colors hover:bg-musgo-100"
            >
              QUERO O ARSENAL MED 3.0 — R$ 69,90
            </a>
            <a
              href="#amostra"
              className="border border-musgo-500 px-5 py-3 text-center font-heading text-sm font-bold uppercase tracking-[0.12em] text-musgo-100 transition-colors hover:border-musgo-300"
            >
              BAIXAR 5 CASOS DE GRAÇA
            </a>
          </div>
          <p className="mt-6 font-heading text-[11px] font-semibold uppercase tracking-[0.1em] text-musgo-500 md:text-xs">
            33 CASOS · CATÁLOGO DE FÁRMACOS · 10 TABELAS · PDF NAVEGÁVEL
          </p>
        </div>
        <div className="w-full md:w-[42%]">
          <CrateIllustration className="h-auto w-full" />
        </div>
      </div>
    </section>
  );
}
