import { TopoLines } from "./TopoLines";

const CARDS = [
  {
    titulo: "33 CASOS",
    corpo: "Via aérea e ventilação mecânica · parada cardiorrespiratória · choque e arritmias · AVC · delirium e abstinência · distúrbios eletrolíticos e ácido-base · sepse por foco · hemorragia digestiva · lesão renal aguda · intoxicações · anafilaxia · transfusão maciça · cuidados de conforto e fim de vida.",
  },
  {
    titulo: "CATÁLOGO DE FÁRMACOS",
    corpo: "Volume separado incluído como bônus. Apresentação, diluição com concentração final explícita, dose por quilo quando aplicável, ajuste renal, cuidados e tipo de receituário em formato fixo.",
  },
  {
    titulo: "DEZ TABELAS",
    corpo: "Conversões de vazão · vasoativos por peso · ajuste por função renal · compatibilidade e diluição · antídotos · escores de bolso · Portaria 344 · sedação e analgesia · parâmetros ventilatórios · situações específicas na gestação.",
  },
];

export function Conteudo() {
  return (
    <section id="conteudo" className="relative overflow-hidden scroll-mt-20 bg-papel-2 px-4 py-20 md:px-6 md:py-28">
      <TopoLines />
      <div className="relative mx-auto max-w-5xl">
        <p className="label text-ocre">O QUE VOCÊ RECEBE</p>
        <h2 className="mt-5 max-w-[680px] text-papel">Manual completo com 33 cenários + catálogo de fármacos e dez tabelas em um segundo volume</h2>

        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
          {CARDS.map((c) => (
            <div key={c.titulo} className="border border-musgo-300 p-6 md:p-8">
              <h3 className="text-papel">{c.titulo}</h3>
              <p className="mt-4 text-[15px] leading-relaxed text-musgo-700">{c.corpo}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 border-b-2 border-t-2 border-ocre py-8 text-center md:py-10">
          <h3 className="text-ocre">VAZÕES SEM ESCONDER A CONCENTRAÇÃO</h3>
          <p className="mx-auto mt-4 max-w-[600px] text-musgo-700">
            Tabelas de vasoativos por peso sempre ligadas à concentração que gerou a vazão, além da fórmula universal para quando a padronização do seu serviço for diferente.
          </p>
        </div>
      </div>
    </section>
  );
}
