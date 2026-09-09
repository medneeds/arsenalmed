import { TopoLines } from "./TopoLines";

const COLUNAS = [
  {
    titulo: "É PARA VOCÊ SE",
    marcador: "bg-musgo-600",
    itens: [
      "Você faz plantão em emergência, UTI, sala vermelha ou enfermaria de retaguarda",
      "Você é R1, R2 ou recém-formado e ainda monta a conduta em partes",
      "Você é experiente e quer parar de refazer a mesma conta de vazão toda noite",
      "Você prefere um material que assume que você sabe medicina e só organiza a execução",
    ],
  },
  {
    titulo: "NÃO É PARA VOCÊ SE",
    marcador: "bg-ferrugem",
    itens: [
      "Você procura um livro-texto de fisiopatologia",
      "Você quer conteúdo de pediatria, obstetrícia ou ambulatório",
      "Você não é médico — o material é de uso clínico exclusivo",
    ],
  },
];

export function ParaQuem() {
  return (
    <section className="relative overflow-hidden bg-papel px-4 py-20 md:px-6 md:py-28">
      <TopoLines />
      <div className="relative mx-auto grid max-w-4xl grid-cols-1 gap-12 md:grid-cols-2 md:gap-16">
        {COLUNAS.map((c) => (
          <div key={c.titulo}>
            <h3 className="fieldtag">{c.titulo}</h3>
            <ul className="mt-6 space-y-4">
              {c.itens.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className={`mt-2 inline-block h-3 w-3 shrink-0 ${c.marcador}`} aria-hidden="true" />
                  <span className="text-[16px] leading-relaxed text-tinta">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
