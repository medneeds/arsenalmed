import { LeadCaptureModal } from "./LeadCaptureModal";

export function Compacto() {
  return (
    <section id="compacto" className="bg-papel-2 px-4 py-20 md:px-6 md:py-28">
      <div className="mx-auto max-w-[680px]">
        <p className="label text-musgo-500">GRATUITO</p>
        <h2 className="mt-5 text-tinta">Antes de comprar, use cinco casos hoje à noite</h2>
        <p className="mt-6 text-tinta">
          O Arsenal Compacto traz cinco cenários na íntegra — intubação, choque séptico, estado de mal
          epiléptico, cetoacidose e hipercalemia — mais as 11 armadilhas que mais custam caro no
          plantão. É o mesmo formato da edição completa, sem versão reduzida.
        </p>
        <div className="mt-8">
          <LeadCaptureModal>
            <button
              type="button"
              className="border border-musgo-600 px-5 py-3 font-heading text-sm font-bold uppercase tracking-[0.12em] text-musgo-800 transition-colors hover:bg-musgo-800 hover:text-papel"
            >
              RECEBER O ARSENAL COMPACTO
            </button>
          </LeadCaptureModal>
        </div>
      </div>
    </section>
  );
}
