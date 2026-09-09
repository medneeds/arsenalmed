import { TopoLines } from "./TopoLines";
import { Stamp } from "./Stamp";

const ARMADILHAS = [
  "Parar no shift e não tirar o potássio do corpo. Em duas a quatro horas ele rebate.",
  "Gluconato de cálcio em infusão lenta. A indicação é de minutos, não de horas.",
  "Confiar no laboratório sem eletrocardiograma. O ECG define a gravidade, não o número.",
];

export function Amostra() {
  return (
    <section id="amostra" className="relative overflow-hidden bg-papel px-4 py-20 md:px-6 md:py-28">
      <TopoLines />
      <div className="relative mx-auto max-w-3xl">
        <div className="flex items-start justify-between gap-4">
          <p className="fieldtag">AMOSTRA · CASO 05</p>
          <Stamp top="AMOSTRA" main="GRÁTIS" className="shrink-0" />
        </div>

        <article className="mt-6 border border-musgo-300 bg-papel-2 p-5 md:p-10">
          <span className="inline-block bg-musgo-700 px-3 py-1 font-heading text-xs font-bold uppercase tracking-[0.16em] text-papel">
            CASO 05
          </span>
          <h2 className="mt-5 text-tinta">HIPERCALEMIA GRAVE</h2>
          <p className="mt-2 font-heading text-sm font-semibold uppercase tracking-[0.16em] text-alerta">
            JANELA DE MINUTOS
          </p>

          <div className="mt-7 border-l-4 border-musgo-600 bg-musgo-100 p-5">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.08em] text-musgo-700">
              23h50 · sala de emergência
            </p>
            <p className="mt-3 text-tinta">
              Homem de 61 anos, doença renal crônica em hemodiálise, faltou às duas últimas sessões porque
              "estava se sentindo bem". Potássio 7,4. Onda T alta e simétrica. QRS de 130 milissegundos.
              Ele está consciente, orientado e conversando com você. E está{" "}
              <span className="font-semibold text-alerta">a poucos minutos de uma arritmia fatal</span>.
            </p>
          </div>

          <h3 className="mt-8 text-tinta">ARMADILHAS</h3>
          <ul className="mt-4 space-y-4">
            {ARMADILHAS.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center bg-alerta font-heading text-xs font-bold text-papel">
                  ×
                </span>
                <span className="text-[16px] leading-relaxed text-tinta">{item}</span>
              </li>
            ))}
          </ul>
        </article>

        <p className="mt-5 max-w-[560px] font-heading text-[13px] leading-relaxed text-musgo-500">
          Este é um dos cinco cenários do Arsenal Compacto, gratuito. As outras 28 estão na edição completa.
        </p>
      </div>
    </section>
  );
}
