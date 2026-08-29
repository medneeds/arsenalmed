const CARDS = [
  {
    titulo: "33 CASOS",
    corpo: "Via aérea e ventilação mecânica · parada cardiorrespiratória · choque e arritmias · AVC · delirium e abstinência · distúrbios eletrolíticos e ácido-base · sepse por foco · hemorragia digestiva · lesão renal aguda · intoxicações · anafilaxia · transfusão maciça · cuidados de conforto e fim de vida.",
  },
  {
    titulo: "VERBETE DE FÁRMACO",
    corpo: "Apresentação, diluição com concentração final explícita, dose por quilo, tabela de vazão por peso, ajuste renal, cuidados e tipo de receituário. Um formato fixo, sempre na mesma ordem.",
  },
  {
    titulo: "DEZ TABELAS",
    corpo: "Conversões de vazão · vasoativos por peso · ajuste por função renal · compatibilidade e diluição · antídotos · escores de bolso · Portaria 344 · sedação e analgesia · parâmetros ventilatórios · risco na gestante.",
  },
];

export function Conteudo() {
  return (
    <section className="bg-musgo-800 px-4 py-20 md:px-6 md:py-28">
      <div className="mx-auto max-w-5xl">
        <p className="label text-ocre">CONTEÚDO</p>
        <h2 className="mt-5 max-w-[680px] text-papel">33 casos, o catálogo de fármacos e dez tabelas</h2>

        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
          {CARDS.map((c) => (
            <div key={c.titulo} className="border border-musgo-600 p-6 md:p-8">
              <h3 className="text-papel">{c.titulo}</h3>
              <p className="mt-4 text-[15px] leading-relaxed text-musgo-100">{c.corpo}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 border-b-2 border-t-2 border-ocre py-8 text-center md:py-10">
          <h3 className="text-ocre">A TABELA QUE MAIS PEDIRAM</h3>
          <p className="mx-auto mt-4 max-w-[560px] text-musgo-100">
            Vasoativos convertidos de mcg/kg/min para mL/h, por peso, nas diluições padronizadas. Mais a
            fórmula universal, para quando a diluição do seu serviço for outra.
          </p>
        </div>
      </div>
    </section>
  );
}
