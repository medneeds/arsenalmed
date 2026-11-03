import type { DashboardData } from "@/lib/admin.functions";
import { Bloco, TabelaRolavel, Th, brl, dataHora } from "./painel-ui";

export function SecaoCompras({ compras }: { compras: DashboardData["compras"] }) {
  return (
    <Bloco titulo="Compras e downloads">
      <TabelaRolavel min={720}>
        <thead>
          <tr className="border-b-2 border-musgo-700">
            {["Data", "E-mail", "Valor", "Status", "Manual", "Catálogo", "Acesso até"].map((h) => (
              <Th key={h}>{h}</Th>
            ))}
          </tr>
        </thead>
        <tbody>
          {compras.length === 0 ? (
            <tr>
              <td colSpan={7} className="py-6 font-mono text-sm text-musgo-300">
                Nenhuma compra registrada ainda.
              </td>
            </tr>
          ) : (
            compras.map((c) => (
              <tr key={c.id} className="border-b border-musgo-700/60">
                <td className="py-3 pr-4 font-mono text-xs text-musgo-150">{dataHora(c.criadoEm)}</td>
                <td className="py-3 pr-4 text-sm text-papel">{c.email}</td>
                <td className="py-3 pr-4 font-mono text-sm text-papel">{brl(c.valorCentavos)}</td>
                <td className="py-3 pr-4">
                  <span className="font-heading text-[11px] font-bold uppercase tracking-[0.12em] text-ocre">{c.status}</span>
                  {c.bonusMedstation ? (
                    <span className="mt-1 block w-fit border border-ocre/60 px-1.5 py-0.5 font-heading text-[10px] font-bold uppercase tracking-[0.12em] text-papel">
                      Bônus MedStation
                    </span>
                  ) : null}
                </td>
                <td className="py-3 pr-4 font-mono text-xs text-musgo-150">{c.downloadsManual}/5</td>
                <td className="py-3 pr-4 font-mono text-xs text-musgo-150">{c.temCatalogo ? `${c.downloadsCatalogo}/5` : "pendente"}</td>
                <td className="py-3 pr-4 font-mono text-xs text-musgo-300">{dataHora(c.expiraEm)}</td>
              </tr>
            ))
          )}
        </tbody>
      </TabelaRolavel>
    </Bloco>
  );
}
