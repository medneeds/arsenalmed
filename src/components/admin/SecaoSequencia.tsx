import type { PainelDados } from "@/lib/painel.server";
import { Bloco, TabelaRolavel, Td, Th, dataHora, num, pct } from "./painel-ui";
import { taxa } from "@/lib/painel-metricas";

export function SecaoSequencia({ dados, onAbrirLead }: { dados: PainelDados; onAbrirLead: (email: string) => void }) {
  return (
    <div className="grid gap-0 xl:grid-cols-[minmax(0,1fr)_340px] xl:gap-6">
      <Bloco titulo="Sequência pós-Compacto por etapa">
        <TabelaRolavel min={560}>
          <thead>
            <tr className="border-b-2 border-musgo-700">
              <Th>Etapa</Th>
              <Th direita>Enviados</Th>
              <Th direita>Cliques</Th>
              <Th direita>Taxa de clique</Th>
              <Th direita>Compras atribuídas</Th>
              <Th direita>Descadastros</Th>
            </tr>
          </thead>
          <tbody>
            {dados.sequencia.map((s) => (
              <tr key={s.etapa} className="border-b border-musgo-700/60">
                <Td className="font-heading font-bold uppercase text-papel">{s.etapa}</Td>
                <Td direita>{num(s.enviados)}</Td>
                <Td direita>{num(s.cliques)}</Td>
                <Td direita>{pct(taxa(s.cliques, s.enviados))}</Td>
                <Td direita className="text-ocre">{num(s.comprasAtribuidas)}</Td>
                <Td direita>{num(s.descadastros)}</Td>
              </tr>
            ))}
          </tbody>
        </TabelaRolavel>
        <p className="mt-4 font-mono text-[11px] leading-relaxed text-musgo-500">
          Cliques = chegadas ao site pelo link da etapa (navegadores únicos). Compra e descadastro contam para a última etapa recebida antes deles.
        </p>
      </Bloco>

      <Bloco titulo="Leads e etapa atual">
        <ul className="max-h-[520px] divide-y divide-musgo-700/60 overflow-y-auto">
          {dados.leads.length === 0 ? (
            <li className="py-3 font-mono text-sm text-musgo-300">Nenhum lead no período.</li>
          ) : (
            dados.leads.map((l) => (
              <li key={l.email}>
                <button
                  type="button"
                  onClick={() => onAbrirLead(l.email)}
                  className="flex w-full items-center justify-between gap-3 py-2.5 text-left hover:bg-musgo-900/60"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm text-papel">{l.nome}</span>
                    <span className="block font-mono text-[11px] text-musgo-500">{dataHora(l.criadoEm)}</span>
                  </span>
                  <span className="shrink-0 font-heading text-[11px] font-bold uppercase tracking-[0.12em]">
                    {l.descadastradoEm ? (
                      <span className="text-alerta-claro">descadastrado</span>
                    ) : l.compra ? (
                      <span className="text-ocre">comprou</span>
                    ) : (
                      <span className="text-musgo-150">{l.etapa ?? "aguardando d1"}</span>
                    )}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      </Bloco>
    </div>
  );
}
