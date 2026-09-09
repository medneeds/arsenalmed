import { LeadCaptureModal } from "./LeadCaptureModal";
import { track } from "@/lib/analytics";
import { ARSENAL_PRICE } from "@/lib/product";
import { TopoLines } from "./TopoLines";
import { Stamp } from "./Stamp";

export function Compacto() {
  return (
    <section id="compacto" className="relative overflow-hidden bg-papel-2 px-4 py-14 md:px-6 md:py-28">
      <TopoLines />
      <div className="relative mx-auto max-w-[680px]">
        <div className="flex items-start justify-between gap-4">
          <p className="fieldtag">GRATUITO</p>
          <Stamp top="5 CASOS" main="GRÁTIS" className="shrink-0" />
        </div>
        <h2 className="mt-5 text-tinta">Antes de comprar, use cinco casos hoje</h2>
        <p className="mt-6 text-tinta">
          O Arsenal Compacto traz cinco cenários na íntegra — intubação, choque séptico, estado de mal
          epiléptico, cetoacidose e hipercalemia — mais as 11 armadilhas que mais custam caro no
          plantão. É o mesmo formato da edição completa, sem versão reduzida.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <LeadCaptureModal origem="secao_compacto">
            <button
              type="button"
              className="flex min-h-12 items-center justify-center border border-musgo-600 px-5 py-3 text-center font-heading text-sm font-bold uppercase tracking-[0.12em] text-musgo-800 transition-colors hover:bg-musgo-800 hover:text-papel"
            >
              RECEBER O ARSENAL COMPACTO
            </button>
          </LeadCaptureModal>
          <a
            href="/comprar"
            onClick={() => track("click_buy", { origem: "secao_compacto" })}
            className="flex min-h-12 items-center justify-center bg-ocre px-5 py-3 text-center font-heading text-sm font-bold uppercase tracking-[0.12em] text-musgo-900 transition-colors hover:bg-musgo-800 hover:text-papel"
          >
            IR DIRETO PARA OS 33 CENÁRIOS — {ARSENAL_PRICE}
          </a>
        </div>
        <p className="mt-4 text-sm text-musgo-600">
          O Compacto é um recorte do mesmo material. A edição completa entrega 2 volumes: Manual Completo com
          33 cenários e o Catálogo de Fármacos e Tabelas em bônus.
        </p>
      </div>
    </section>
  );
}
