const ITENS = [
  "33 casos no formato completo",
  "Catálogo de fármacos com dose por quilo e ajuste renal",
  "Dez tabelas de referência",
  "PDF navegável e off-line, com sumário clicável e marcadores — retaguarda sem internet",
  "Atualizações da versão 3.x sem custo adicional",
];

export function Preco() {
  return (
    <section id="preco" className="bg-musgo-800 px-4 py-20 md:px-6 md:py-28">
      <div className="mx-auto max-w-[520px] border-2 border-ocre bg-musgo-900 p-6 md:p-10">
        <p className="label text-ocre">EDIÇÃO COMPLETA</p>
        <h2 className="mt-4 text-papel">Arsenal Med 3.0</h2>
        <p className="mt-6 font-mono text-5xl font-semibold text-papel md:text-6xl">R$ 69,90</p>
        <p className="mt-3 text-sm text-musgo-300">pagamento único · acesso vitalício ao arquivo</p>

        <ul className="mt-8 space-y-3">
          {ITENS.map((item) => (
            <li key={item} className="flex gap-3">
              <span className="mt-2 inline-block h-2.5 w-2.5 shrink-0 bg-ocre" aria-hidden="true" />
              <span className="text-[16px] leading-relaxed text-musgo-100">{item}</span>
            </li>
          ))}
        </ul>

        <div className="mt-7 border-t border-musgo-600 pt-5">
          <p className="label text-ocre">BÔNUS INCLUSO</p>
          <p className="mt-2 text-[15px] leading-relaxed text-musgo-100">
            Guia de Bolso com as principais cenas do paciente grave — retaguarda off-line para o momento em
            que a internet falta.
          </p>
        </div>

        <a
          href="/comprar"
          className="mt-8 block bg-ocre px-5 py-4 text-center font-heading text-base font-bold uppercase tracking-[0.12em] text-musgo-900 transition-colors hover:bg-musgo-100"
        >
          COMPRAR AGORA
        </a>

        <p className="mt-5 text-center text-sm leading-relaxed text-musgo-300">
          Pix ou cartão · pagamento processado pela Stripe
          <br />
          Garantia de 7 dias: reembolso integral, sem perguntas
        </p>
      </div>
    </section>
  );
}
