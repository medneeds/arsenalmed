import { useState } from "react";
import type { EtapaFunil } from "@/lib/painel-metricas";
import type { PainelDados } from "@/lib/painel.server";
import { Bloco, Chips, TabelaRolavel, Td, Th, num, pct } from "./painel-ui";

type Corte = "geral" | "dispositivo" | "campanha" | "hora";

const CORTES: { id: Corte; label: string }[] = [
  { id: "geral", label: "Geral" },
  { id: "dispositivo", label: "Dispositivo" },
  { id: "campanha", label: "Campanha" },
  { id: "hora", label: "Hora do dia" },
];

function Barras({ etapas }: { etapas: EtapaFunil[] }) {
  const topo = Math.max(1, ...etapas.map((e) => e.total));
  return (
    <ul className="space-y-3">
      {etapas.map((e) => (
        <li key={e.etapa}>
          <div className="flex items-baseline justify-between gap-3">
            <span className="font-heading text-xs font-bold uppercase tracking-[0.12em] text-musgo-150">{e.etapa}</span>
            <span className="font-mono text-sm text-papel">
              {num(e.total)} <span className="text-musgo-300">· {pct(e.pct)}</span>
            </span>
          </div>
          <div className="mt-1.5 h-2.5 w-full bg-musgo-900">
            <div className="h-2.5 bg-ocre" style={{ width: `${Math.round((e.total / topo) * 100)}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function Segmentado({ grupos }: { grupos: { segmento: string; etapas: EtapaFunil[] }[] }) {
  if (grupos.length === 0) return <p className="font-mono text-sm text-musgo-300">Sem visitas no período.</p>;
  const etapas = grupos[0]!.etapas.map((e) => e.etapa);
  return (
    <TabelaRolavel min={Math.max(560, 140 + etapas.length * 110)}>
      <thead>
        <tr className="border-b-2 border-musgo-700">
          <Th>Segmento</Th>
          {etapas.map((e) => (
            <Th key={e} direita>
              {e}
            </Th>
          ))}
        </tr>
      </thead>
      <tbody>
        {grupos.map((g) => (
          <tr key={g.segmento} className="border-b border-musgo-700/60">
            <Td className="text-papel">{g.segmento}</Td>
            {g.etapas.map((e) => (
              <Td key={e.etapa} direita>
                {num(e.total)}
                {e.pct !== null && e.etapa !== etapas[0] ? <span className="text-musgo-500"> · {pct(e.pct)}</span> : null}
              </Td>
            ))}
          </tr>
        ))}
      </tbody>
    </TabelaRolavel>
  );
}

export function SecaoComportamento({ dados }: { dados: PainelDados }) {
  const [corte, setCorte] = useState<Corte>("geral");
  const seletor = <Chips rotulo="Separar por" valor={corte} onChange={setCorte} opcoes={CORTES} />;

  return (
    <>
      <div className="mt-6">{seletor}</div>
      <Bloco titulo="Funil da página de vendas">
        {corte === "geral" ? <Barras etapas={dados.funilVendas} /> : <Segmentado grupos={dados.funis.vendasPor[corte]} />}
        <p className="mt-4 font-mono text-[11px] text-musgo-500">Navegadores únicos em cada etapa; % sobre quem visitou a página de vendas.</p>
      </Bloco>
      <Bloco titulo="Funil da página /compacto">
        {corte === "geral" ? <Barras etapas={dados.funilCompacto} /> : <Segmentado grupos={dados.funis.compactoPor[corte]} />}
        <p className="mt-4 font-mono text-[11px] text-musgo-500">Taxa de conversão = formulários enviados na página ÷ visitas à página.</p>
      </Bloco>
    </>
  );
}
