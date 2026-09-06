import { autorFoto } from "@/assets/artur-batista.webp";

const PRODUCAO = [
  {
    nome: "Arsenal Med",
    desc: "Manual de plantão organizado por cenário — a obra desta página.",
  },
  {
    nome: "Arsen",
    desc: "Plataforma de gestão assistencial usada em instituições de saúde.",
  },
  {
    nome: "Med Needs",
    desc: "Aplicativo de gestão de plantões e finanças médicas.",
  },
  {
    nome: "Med Station",
    desc: "Copiloto médico de documentação e fluxo de trabalho com inteligência artificial.",
  },
];

export function Autor() {
  return (
    <section className="bg-papel-2 px-4 py-20 md:px-6 md:py-28">
      <div className="mx-auto grid max-w-[1040px] items-start gap-10 md:grid-cols-[minmax(0,360px)_1fr] md:gap-14">
        {/* Foto — corte vertical editorial */}
        <figure className="mx-auto w-full max-w-[360px]">
          <div className="overflow-hidden border border-musgo-300 bg-musgo-100">
            <img
              src={autorFoto.src}
              alt="Foto de Artur Batista, médico intensivista"
              width={1080}
              height={1350}
              loading="lazy"
              decoding="async"
              className="block aspect-[4/5] h-auto w-full object-cover"
            />
          </div>
          <figcaption className="mt-3 font-mono text-[11px] uppercase tracking-[0.14em] text-musgo-500">
            Artur Batista · CRM/MA 11788
          </figcaption>
        </figure>

        {/* Conteúdo */}
        <div className="min-w-0">
          <p className="label text-musgo-500">AUTOR</p>
          <h2 className="mt-5 text-tinta">Artur Batista</h2>
          <p className="mt-3 font-mono text-sm text-musgo-600">CRM/MA 11788</p>

          <p className="mt-8 text-tinta">
            Médico com atuação em medicina intensiva e UTI. Autor do Arsenal Med e responsável por um
            conjunto de plataformas e aplicativos médicos: gestão assistencial, gestão de plantões e
            finanças, e copiloto de documentação com inteligência artificial.
          </p>

          <dl className="mt-8 divide-y divide-musgo-300 border-y border-musgo-300">
            {PRODUCAO.map((p) => (
              <div key={p.nome} className="grid gap-1 py-4 md:grid-cols-[200px_1fr] md:gap-6">
                <dt className="font-heading text-[13px] font-semibold uppercase tracking-[0.12em] text-ocre">
                  {p.nome}
                </dt>
                <dd className="text-[15px] leading-relaxed text-tinta">{p.desc}</dd>
              </div>
            ))}
          </dl>

          <p className="mt-8 text-tinta">
            O manual nasceu do mesmo lugar que a plataforma: a constatação de que a maior parte do
            tempo do plantonista não é gasta decidindo, e sim organizando o que já foi decidido.
          </p>
        </div>
      </div>
    </section>
  );
}
