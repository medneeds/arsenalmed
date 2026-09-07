import {
  ARSENAL_COMPARE_AT_PRICE,
  ARSENAL_DISCOUNT_PERCENT,
  ARSENAL_PRICE,
  ARSENAL_SAVINGS,
} from "@/lib/product";
import { track } from "@/lib/analytics";

const ITENS = [
  "Manual Completo com 33 cenários do paciente grave",
  "Catálogo de Fármacos e Tabelas em um segundo PDF, incluído como bônus",
  "Sumário inteligente, links internos e marcadores para consulta rápida",
  "Arquivos para consulta off-line no celular, tablet ou computador",
  "Correções e atualizações da versão 3.x sem custo adicional",
  "Acesso de entrega ativo por 7 dias, com até 5 downloads por volume",
];

export function Preco() {
  return (
    <section id="preco" className="bg-musgo-800 px-4 py-20 md:px-6 md:py-28">
      <div className="mx-auto max-w-[560px] border-2 border-ocre bg-musgo-900 p-6 md:p-10">
        <p className="label text-ocre">PACOTE COMPLETO</p>
        <h2 className="mt-4 text-papel">Arsenal Med 3.0</h2>

        <div className="mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-2">
          <span className="font-mono text-2xl font-medium text-musgo-400 line-through decoration-alerta/60">
            {ARSENAL_COMPARE_AT_PRICE}
          </span>
          <span className="font-mono text-5xl font-semibold text-papel md:text-6xl">{ARSENAL_PRICE}</span>
          <span className="font-heading text-[12px] font-bold uppercase tracking-[0.12em] text-ocre">
            −{ARSENAL_DISCOUNT_PERCENT}% · economize {ARSENAL_SAVINGS}
          </span>
        </div>
        <p className="mt-3 text-sm text-musgo-300">pagamento único · Pix ou cartão</p>

        <ul className="mt-8 space-y-3">
          {ITENS.map((item) => (
            <li key={item} className="flex gap-3">
              <span className="mt-2 inline-block h-2.5 w-2.5 shrink-0 bg-ocre" aria-hidden="true" />
              <span className="text-[16px] leading-relaxed text-musgo-100">{item}</span>
            </li>
          ))}
        </ul>

        <div className="mt-7 border-t border-musgo-600 pt-5">
          <p className="label text-ocre">VOCÊ RECEBE 2 ARQUIVOS</p>
          <p className="mt-2 text-[15px] leading-relaxed text-musgo-100">
            1. Arsenal Med 3.0 — Manual Completo. 2. Catálogo de Fármacos e Tabelas — bônus em volume separado.
          </p>
        </div>

        <div className="mt-7 border-t border-musgo-600 pt-5">
          <p className="label text-ocre">PARA USAR NO PLANTÃO</p>
          <p className="mt-2 text-[15px] leading-relaxed text-musgo-100">
            Material de consulta rápida para médicos, com doses de referência e organização por cenário. Não substitui bula, julgamento clínico ou protocolo institucional.
          </p>
        </div>

        <a
          href="/comprar"
          onClick={() => track("click_buy", { origem: "preco" })}
          className="mt-8 flex min-h-14 items-center justify-center bg-ocre px-5 py-4 text-center font-heading text-base font-bold uppercase tracking-[0.12em] text-musgo-900 transition-colors hover:bg-musgo-100"
        >
          COMPRAR O PACOTE COMPLETO
        </a>

        <p className="mt-5 text-center text-sm leading-relaxed text-musgo-300">
          Pagamento único · Pix ou cartão · processado pela Stripe
          <br />
          Garantia de 7 dias: reembolso integral, sem justificativa
        </p>
      </div>
    </section>
  );
}
