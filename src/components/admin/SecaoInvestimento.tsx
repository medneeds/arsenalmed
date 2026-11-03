import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Trash2 } from "lucide-react";
import { removerInvestimento, salvarInvestimento } from "@/lib/painel.functions";
import { diaLocal } from "@/lib/periodo";
import type { PainelDados } from "@/lib/painel.server";
import { Bloco, TabelaRolavel, Td, Th, brl, dataCurta, inputPainel, labelPainel } from "./painel-ui";

function paraCentavos(txt: string): number | null {
  const limpo = txt.replace(/[^\d,.-]/g, "").replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", ".");
  const n = Number(limpo);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100);
}

export function SecaoInvestimento({ dados, onSalvo }: { dados: PainelDados; onSalvo: () => void }) {
  const salvar = useServerFn(salvarInvestimento);
  const remover = useServerFn(removerInvestimento);
  const [dia, setDia] = useState(() => diaLocal(new Date()));
  const [campanha, setCampanha] = useState("");
  const [valor, setValor] = useState("");
  const [obs, setObs] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; texto: string } | null>(null);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const centavos = paraCentavos(valor);
    if (centavos === null) {
      setMsg({ ok: false, texto: "Valor inválido. Use, por exemplo, 20 ou 20,50." });
      return;
    }
    setEnviando(true);
    try {
      const res = await salvar({ data: { dia, utm_campaign: campanha, valor_centavos: centavos, observacao: obs } });
      if (res.ok) {
        setMsg({ ok: true, texto: `Lançado: ${brl(centavos)} em ${campanha.trim().toLowerCase()} no dia ${dataCurta(dia)}.` });
        setValor("");
        setObs("");
        onSalvo();
      } else setMsg({ ok: false, texto: res.error });
    } catch (err) {
      const texto = err instanceof Error ? err.message : "Não foi possível salvar.";
      setMsg({ ok: false, texto: /utm_campaign|campanha/i.test(texto) ? "Use o mesmo nome do utm_campaign (letras, números, _ e -)." : "Não foi possível salvar." });
    } finally {
      setEnviando(false);
    }
  }

  async function apagar(d: string, c: string) {
    if (!window.confirm(`Apagar o investimento de ${c} em ${dataCurta(d)}?`)) return;
    const res = await remover({ data: { dia: d, utm_campaign: c } });
    if (res.ok) onSalvo();
  }

  return (
    <>
      <Bloco titulo="Lançar investimento do dia">
        <p className="mb-4 text-sm text-musgo-300">
          Copie o gasto de cada campanha no Gerenciador de Anúncios. Lançar de novo o mesmo dia e campanha substitui o valor.
        </p>
        <form onSubmit={enviar} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[150px_minmax(0,1fr)_140px_minmax(0,1fr)_auto] lg:items-end">
          <label className="block" htmlFor="inv-dia">
            <span className={labelPainel}>Dia</span>
            <input id="inv-dia" type="date" required value={dia} max={diaLocal(new Date())} onChange={(e) => setDia(e.target.value)} className={`${inputPainel} mt-1.5`} />
          </label>
          <label className="block" htmlFor="inv-camp">
            <span className={labelPainel}>Campanha (utm_campaign)</span>
            <input id="inv-camp" list="inv-campanhas" required value={campanha} onChange={(e) => setCampanha(e.target.value)} placeholder="captacao_compacto" className={`${inputPainel} mt-1.5`} />
            <datalist id="inv-campanhas">
              {[...new Set(["captacao_compacto", "trafego_quente", ...dados.campanhasConhecidas])].map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </label>
          <label className="block" htmlFor="inv-valor">
            <span className={labelPainel}>Valor (R$)</span>
            <input id="inv-valor" inputMode="decimal" required value={valor} onChange={(e) => setValor(e.target.value)} placeholder="20,00" className={`${inputPainel} mt-1.5`} />
          </label>
          <label className="block" htmlFor="inv-obs">
            <span className={labelPainel}>Observação (opcional)</span>
            <input id="inv-obs" value={obs} maxLength={300} onChange={(e) => setObs(e.target.value)} className={`${inputPainel} mt-1.5`} />
          </label>
          <button type="submit" disabled={enviando} className="h-10 rounded-[2px] bg-ocre px-5 font-heading text-xs font-bold uppercase tracking-[0.12em] text-musgo-900 disabled:opacity-60">
            {enviando ? "Salvando…" : "Lançar"}
          </button>
        </form>
        {msg ? (
          <p role={msg.ok ? "status" : "alert"} className={`mt-3 font-mono text-xs ${msg.ok ? "text-ocre" : "text-alerta-claro"}`}>
            {msg.texto}
          </p>
        ) : null}
      </Bloco>

      <Bloco titulo="Investimentos lançados no período">
        <TabelaRolavel min={520}>
          <thead>
            <tr className="border-b-2 border-musgo-700">
              <Th>Dia</Th>
              <Th>Campanha</Th>
              <Th direita>Valor</Th>
              <Th>Observação</Th>
              <Th>{""}</Th>
            </tr>
          </thead>
          <tbody>
            {dados.investimentos.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 font-mono text-sm text-musgo-300">
                  Nada lançado no período.
                </td>
              </tr>
            ) : (
              dados.investimentos.map((i) => (
                <tr key={`${i.dia}:${i.utm_campaign}`} className="border-b border-musgo-700/60">
                  <Td>{dataCurta(i.dia)}</Td>
                  <Td className="text-papel">{i.utm_campaign}</Td>
                  <Td direita>{brl(i.valor_centavos)}</Td>
                  <Td>{i.observacao ?? "—"}</Td>
                  <Td>
                    <button type="button" onClick={() => apagar(i.dia, i.utm_campaign)} aria-label={`Apagar ${i.utm_campaign} em ${dataCurta(i.dia)}`} className="text-musgo-500 hover:text-alerta-claro">
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </button>
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </TabelaRolavel>
      </Bloco>
    </>
  );
}
