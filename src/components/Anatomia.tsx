const BLOCOS = [
  { n: "01", titulo: "O CASO", desc: "O cenário real, com o ponto exato em que a decisão trava", alerta: false },
  {
    n: "02",
    titulo: "O QUE ESTÁ EM JOGO",
    desc: "A fisiopatologia que explica por que a ordem importa",
    alerta: false,
  },
  { n: "03", titulo: "RECONHECER", desc: "O que define o cenário e o que o diferencia das parecidas", alerta: false },
  { n: "04", titulo: "PRIMEIROS MINUTOS", desc: "As ações numeradas, na ordem de execução", alerta: false },
  { n: "05", titulo: "PRESCRIÇÃO", desc: "Bloco pronto para transcrever", alerta: false },
  { n: "06", titulo: "ARMADILHAS", desc: "Os erros que mais acontecem neste cenário", alerta: true },
  { n: "07", titulo: "ESCALAR QUANDO", desc: "Critério objetivo para chamar ajuda", alerta: true },
];

export function Anatomia() {
  return (
    <section className="bg-papel-2 px-4 py-20 md:px-6 md:py-32">
      <div className="mx-auto max-w-5xl">
        <p className="label text-musgo-500">COMO É POR DENTRO</p>
        <h2 className="mt-5 max-w-[680px] text-tinta">Todos os 33 casos têm a mesma anatomia</h2>
        <p className="mt-6 max-w-[680px] text-tinta">
          Depois do primeiro, você já sabe onde olhar sem precisar ler a página inteira. Previsibilidade de
          layout é o que permite consultar com uma mão só.
        </p>

        <ol className="mt-12 grid grid-cols-1 gap-px border-t border-musgo-300 md:grid-cols-4">
          {BLOCOS.map((b) => (
            <li
              key={b.n}
              className="border-b border-musgo-300 py-6 md:border-r md:px-5 md:last:border-r-0"
            >
              <span
                className={`inline-flex h-9 w-9 items-center justify-center font-heading text-sm font-bold text-papel ${
                  b.alerta ? "bg-alerta" : "bg-musgo-600"
                }`}
              >
                {b.n}
              </span>
              <h3 className="mt-4 text-tinta">{b.titulo}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-musgo-600">{b.desc}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
