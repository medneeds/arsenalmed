import { ARSENAL_PRODUCT } from "@/lib/product";
import type { StripeResumoResult } from "@/lib/admin-stripe.functions";
import { Kpi, TabelaRolavel, Th, brl, dataHora } from "./painel-ui";

export function SecaoStripe({ carregando, resultado, falhou }: { carregando: boolean; resultado: StripeResumoResult | undefined; falhou: boolean }) {
  const ok = resultado && resultado.ok ? resultado : null;
  return (
    <section className="mt-6 border-2 border-ocre/70 bg-musgo-800 p-4 md:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b-2 border-musgo-700 pb-4">
        <h2 className="font-heading text-sm font-bold uppercase tracking-[0.12em] text-papel">{ARSENAL_PRODUCT.name} — dados da Stripe</h2>
        <p className="font-mono text-[11px] text-musgo-300">Somente vendas deste produto · período selecionado</p>
      </div>

      {carregando ? <p className="mt-5 font-mono text-sm text-musgo-300">Consultando a Stripe…</p> : null}

      {falhou || (resultado && !resultado.ok) ? (
        <p role="alert" className="mt-5 border-2 border-alerta/60 bg-musgo-900 p-4 font-mono text-xs text-papel">
          {resultado && !resultado.ok ? resultado.error : "Não foi possível consultar a Stripe agora."}
        </p>
      ) : null}

      {ok ? (
        <>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Kpi titulo="Faturamento Stripe (período)" valor={brl(ok.periodoCentavos)} />
            <Kpi titulo="Faturamento Stripe (total)" valor={brl(ok.totalCentavos)} />
            <Kpi titulo="Vendas no período" valor={String(ok.vendasPeriodo)} />
            <Kpi titulo="Ticket médio Stripe" valor={brl(ok.ticketMedioCentavos)} />
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="border-2 border-musgo-700 bg-musgo-900 p-4">
              <p className="font-heading text-[11px] font-bold uppercase tracking-[0.12em] text-musgo-300">Por forma de pagamento (período)</p>
              <ul className="mt-3 space-y-2">
                {ok.porMetodo.length === 0 ? (
                  <li className="font-mono text-xs text-musgo-300">Nenhuma venda no período.</li>
                ) : (
                  ok.porMetodo.map((m) => (
                    <li key={m.metodo} className="flex justify-between gap-3 font-mono text-xs">
                      <span className="uppercase text-musgo-150">{m.metodo}</span>
                      <span className="text-papel">
                        {m.quantidade} · {brl(m.totalCentavos)}
                      </span>
                    </li>
                  ))
                )}
              </ul>
            </div>
            <div className="border-2 border-musgo-700 bg-musgo-900 p-4">
              <p className="font-heading text-[11px] font-bold uppercase tracking-[0.12em] text-musgo-300">Conferência</p>
              <p className="mt-3 font-mono text-xs text-musgo-150">
                Preço ativo na Stripe: <span className="text-papel">{ok.precoAtualCentavos !== null ? brl(ok.precoAtualCentavos) : "—"}</span>
              </p>
              <p className="mt-2 font-mono text-xs text-musgo-150">
                Preço do site: <span className="text-papel">{brl(ARSENAL_PRODUCT.priceCents)}</span>
              </p>
              <p className="mt-2 font-mono text-xs text-musgo-150">
                Vendas registradas na Stripe: <span className="text-papel">{ok.vendasTotal}</span>
              </p>
              <p className="mt-2 font-mono text-xs text-musgo-150">
                Pix na conta Stripe:{" "}
                <span className={ok.pixStatus === "active" ? "text-ocre" : ok.pixStatus === "pending" ? "text-papel" : "text-alerta-claro"}>
                  {ok.pixStatus === "active"
                    ? "ATIVO — aparece no checkout"
                    : ok.pixStatus === "pending"
                      ? "PENDENTE — aguardando a Stripe"
                      : ok.pixStatus === "inactive"
                        ? "INATIVO — ative em Métodos de pagamento"
                        : "não verificado"}
                </span>
              </p>
            </div>
          </div>

          <div className="mt-6">
            <TabelaRolavel min={560}>
              <thead>
                <tr className="border-b-2 border-musgo-700">
                  {["Data", "Valor", "Pagamento", "Status"].map((h) => (
                    <Th key={h}>{h}</Th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ok.vendas.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 font-mono text-sm text-musgo-300">
                      Nenhuma venda deste produto na Stripe ainda.
                    </td>
                  </tr>
                ) : (
                  ok.vendas.map((v) => (
                    <tr key={v.id} className="border-b border-musgo-700/60">
                      <td className="py-3 pr-4 font-mono text-xs text-musgo-150">{dataHora(v.criadoEm)}</td>
                      <td className="py-3 pr-4 font-mono text-sm text-papel">{brl(v.valorCentavos)}</td>
                      <td className="py-3 pr-4 font-mono text-xs uppercase text-musgo-150">{v.metodo}</td>
                      <td className="py-3 pr-4 font-heading text-[11px] font-bold uppercase tracking-[0.12em] text-ocre">{v.status}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </TabelaRolavel>
          </div>
        </>
      ) : null}
    </section>
  );
}
