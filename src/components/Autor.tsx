export function Autor() {
  return (
    <section className="bg-papel-2 px-4 py-20 md:px-6 md:py-28">
      <div className="mx-auto max-w-[640px] text-center">
        <p className="label text-musgo-500">AUTOR</p>
        <h2 className="mt-5 text-tinta">Artur Batista</h2>
        <p className="mt-3 font-mono text-sm text-musgo-600">CRM/MA 11788</p>

        <div
          className="mx-auto mt-8 flex h-[120px] w-[120px] items-center justify-center border border-musgo-300 font-heading text-xs uppercase tracking-[0.26em] text-musgo-300"
          aria-hidden="true"
        >
          foto
        </div>

        <p className="mt-8 text-tinta">
          Médico, autor do Arsenal Med e responsável pela plataforma Arsen, usada na gestão assistencial de
          instituições de saúde. O manual nasceu do mesmo lugar que a plataforma: a constatação de que a
          maior parte do tempo do plantonista não é gasta decidindo, e sim organizando o que já foi
          decidido.
        </p>
      </div>
    </section>
  );
}
