import { Fragment, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChevronDown, ChevronRight } from "lucide-react";
import { SEM_UTM_LABEL, type LinhaCampanha } from "@/lib/painel-metricas";
import type { PainelDados } from "@/lib/painel.server";
import { Bloco, CORES_SERIES, Chips, TabelaRolavel, Td, Th, brl, dataCurta, num, pct, roasTxt, tooltipEstilo } from "./painel-ui";

const COLUNAS = [
  "Visitas",
  "Visualizações",
  "Plays VSL",
  "Leads",
  "Checkouts",
  "Compras",
  "Receita",
  "Investimento",
  "Custo/lead",
  "Custo/venda",
  "Visita→lead",
  "Lead→compra",
  "ROAS",
];

function Celulas({ l }: { l: LinhaCampanha }) {
  return (
    <>
      <Td direita>{num(l.visitas)}</Td>
      <Td direita>{num(l.pageviews)}</Td>
      <Td direita>{num(l.plays)}</Td>
      <Td direita className="text-papel">{num(l.leads)}</Td>
      <Td direita>{num(l.checkouts)}</Td>
      <Td direita className="text-papel">{num(l.compras)}</Td>
      <Td direita>{brl(l.receitaCentavos)}</Td>
      <Td direita>{l.investimentoCentavos === null ? "—" : brl(l.investimentoCentavos)}</Td>
      <Td direita className="text-ocre">{brl(l.cplCentavos)}</Td>
      <Td direita>{brl(l.cpvCentavos)}</Td>
      <Td direita>{pct(l.taxaVisitaLead)}</Td>
      <Td direita>{pct(l.taxaLeadCompra)}</Td>
      <Td direita>{roasTxt(l.roas)}</Td>
    </>
  );
}

export function SecaoCampanhas({ dados }: { dados: PainelDados }) {
  const [abertas, setAbertas] = useState<Set<string>>(new Set());
  const [metrica, setMetrica] = useState<"leads" | "compras">("leads");

  const serie = useMemo(
    () =>
      dados.serie.dias.map((d) => ({
        dia: d.dia,
        ...(metrica === "leads" ? d.leads : d.compras),
      })),
    [dados.serie, metrica],
  );

  function alternar(k: string) {
    setAbertas((s) => {
      const n = new Set(s);
      if (n.has(k)) n.delete(k);
      else n.add(k);
      return n;
    });
  }

  return (
    <>
      <Bloco titulo="Campanhas (último toque)">
        <p className="mb-4 font-mono text-[11px] text-musgo-300">
          Clique numa campanha para ver os criativos (utm_content). Visitas = navegadores únicos. Investimento só existe por campanha.
        </p>
        <TabelaRolavel min={1280}>
          <thead>
            <tr className="border-b-2 border-musgo-700">
              <Th>Campanha / criativo</Th>
              {COLUNAS.map((c) => (
                <Th key={c} direita>
                  {c}
                </Th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dados.campanhas.length === 0 ? (
              <tr>
                <td colSpan={14} className="py-6 font-mono text-sm text-musgo-300">
                  Nenhuma visita, lead ou investimento no período.
                </td>
              </tr>
            ) : (
              dados.campanhas.map((c) => {
                const k = c.campanha ?? "__sem__";
                const aberta = abertas.has(k);
                return (
                  <Fragment key={k}>
                    <tr className="border-b border-musgo-700/60">
                      <td className="py-2.5 pr-4">
                        <button
                          type="button"
                          onClick={() => alternar(k)}
                          aria-expanded={aberta}
                          className="flex items-center gap-1.5 text-left font-heading text-xs font-bold uppercase tracking-[0.08em] text-papel hover:text-ocre"
                        >
                          {aberta ? <ChevronDown className="h-4 w-4 text-ocre" aria-hidden /> : <ChevronRight className="h-4 w-4 text-ocre" aria-hidden />}
                          {c.campanha ?? SEM_UTM_LABEL}
                        </button>
                      </td>
                      <Celulas l={c} />
                    </tr>
                    {aberta
                      ? c.criativos.map((cr) => (
                          <tr key={`${k}:${cr.criativo ?? ""}`} className="border-b border-musgo-700/40 bg-musgo-900/50">
                            <td className="py-2 pl-6 pr-4 font-mono text-xs text-musgo-150">↳ {cr.criativo ?? "(sem criativo)"}</td>
                            <Celulas l={cr} />
                          </tr>
                        ))
                      : null}
                  </Fragment>
                );
              })
            )}
          </tbody>
        </TabelaRolavel>
      </Bloco>

      <Bloco
        titulo="Dia a dia por campanha"
        acoes={
          <Chips
            rotulo="Métrica do gráfico"
            valor={metrica}
            onChange={setMetrica}
            opcoes={[
              { id: "leads", label: "Leads" },
              { id: "compras", label: "Compras" },
            ]}
          />
        }
      >
        {dados.serie.campanhas.length === 0 ? (
          <p className="font-mono text-sm text-musgo-300">Sem leads ou compras no período.</p>
        ) : (
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={serie} margin={{ top: 4, right: 4, bottom: 0, left: -18 }}>
                <CartesianGrid stroke="#3B4A2C" vertical={false} />
                <XAxis dataKey="dia" tickFormatter={dataCurta} tick={{ fill: "#A8B78C", fontSize: 11 }} axisLine={{ stroke: "#3B4A2C" }} tickLine={false} minTickGap={16} />
                <YAxis allowDecimals={false} tick={{ fill: "#A8B78C", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: "rgba(176,138,62,0.12)" }} contentStyle={tooltipEstilo} labelFormatter={(l: string) => dataCurta(l)} />
                <Legend wrapperStyle={{ fontSize: 11, color: "#A8B78C" }} />
                {dados.serie.campanhas.map((c, i) => (
                  <Bar key={c} dataKey={c} stackId="a" fill={CORES_SERIES[i % CORES_SERIES.length]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Bloco>
    </>
  );
}
