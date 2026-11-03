import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { DashboardData } from "@/lib/admin.functions";
import type { PainelDados } from "@/lib/painel.server";
import { variacao, type Resumo } from "@/lib/painel-metricas";
import { Bloco, Kpi, Variacao, brl, dataCurta, num, roasTxt, tooltipEstilo } from "./painel-ui";

function Cartoes({ r, anterior }: { r: Resumo; anterior?: Resumo }) {
  const v = (a: number | null, b: number | null) => (anterior ? <Variacao valor={variacao(a, b)} /> : undefined);
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <Kpi titulo="Leads" valor={num(r.leads)} nota={v(r.leads, anterior?.leads ?? null)} />
      <Kpi
        titulo="Custo por lead"
        valor={brl(r.cplCentavos)}
        nota={anterior ? <Variacao valor={variacao(r.cplCentavos, anterior.cplCentavos)} inverso /> : undefined}
      />
      <Kpi titulo="Compras" valor={num(r.compras)} nota={v(r.compras, anterior?.compras ?? null)} />
      <Kpi titulo="Receita" valor={brl(r.receitaCentavos)} nota={v(r.receitaCentavos, anterior?.receitaCentavos ?? null)} />
      <Kpi titulo="Investimento" valor={brl(r.investimentoCentavos)} nota={v(r.investimentoCentavos, anterior?.investimentoCentavos ?? null)} />
      <Kpi titulo="ROAS" valor={roasTxt(r.roas)} nota={v(r.roas, anterior?.roas ?? null)} />
    </div>
  );
}

function Grafico({ serie, chave, cor, moeda = false }: { serie: DashboardData["serie"]; chave: "leads" | "compras" | "receitaCentavos"; cor: string; moeda?: boolean }) {
  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={serie} margin={{ top: 4, right: 4, bottom: 0, left: -18 }}>
          <CartesianGrid stroke="#3B4A2C" vertical={false} />
          <XAxis dataKey="dia" tickFormatter={dataCurta} tick={{ fill: "#A8B78C", fontSize: 11 }} interval="preserveStartEnd" minTickGap={16} axisLine={{ stroke: "#3B4A2C" }} tickLine={false} />
          <YAxis tick={{ fill: "#A8B78C", fontSize: 11 }} tickFormatter={(v: number) => (moeda ? String(Math.round(v / 100)) : String(v))} allowDecimals={false} axisLine={false} tickLine={false} />
          <Tooltip
            cursor={{ fill: "rgba(176,138,62,0.12)" }}
            contentStyle={tooltipEstilo}
            labelFormatter={(l: string) => dataCurta(l)}
            formatter={(value: number) => [moeda ? brl(value) : String(value), moeda ? "Faturamento" : chave === "leads" ? "Leads" : "Compras"]}
          />
          <Bar dataKey={chave} radius={[2, 2, 0, 0]}>
            {serie.map((d) => (
              <Cell key={d.dia} fill={cor} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SecaoVisaoGeral({ painel, dashboard }: { painel: PainelDados | undefined; dashboard: DashboardData | undefined }) {
  return (
    <>
      {painel ? (
        <>
          <Bloco titulo="Hoje">
            <Cartoes r={painel.visao.hoje} />
          </Bloco>
          <Bloco titulo={`Período · comparado a ${dataCurta(painel.anterior.desde)}–${dataCurta(painel.anterior.ate)}`}>
            <Cartoes r={painel.visao.periodo} anterior={painel.visao.anterior} />
            <p className="mt-4 font-mono text-[11px] text-musgo-500">Bônus MedStation não entram em compras, receita nem ROAS.</p>
          </Bloco>
        </>
      ) : (
        <p className="mt-6 font-mono text-sm text-musgo-300">Carregando campanhas…</p>
      )}

      {dashboard ? (
        <>
          <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Kpi titulo="Faturamento total" valor={brl(dashboard.receita.totalCentavos)} />
            <Kpi titulo="Ticket médio" valor={brl(dashboard.receita.ticketMedioCentavos)} />
            <Kpi titulo="Leads que compraram" valor={`${dashboard.funil.leadsQueCompraram} · ${dashboard.funil.taxaLeadParaCompra}%`} />
            <Kpi titulo="Checkout → pago" valor={`${dashboard.funil.taxaCheckoutParaPago}%`} />
          </section>
          <Bloco titulo="Faturamento por dia">
            <Grafico serie={dashboard.serie} chave="receitaCentavos" cor="var(--ocre)" moeda />
          </Bloco>
          <Bloco titulo="Leads captados por dia">
            <Grafico serie={dashboard.serie} chave="leads" cor="var(--musgo-300)" />
          </Bloco>
          <Bloco titulo="Compras pagas por dia">
            <Grafico serie={dashboard.serie} chave="compras" cor="var(--ferrugem)" />
          </Bloco>
        </>
      ) : null}
    </>
  );
}
