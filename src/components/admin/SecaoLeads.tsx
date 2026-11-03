import { useMemo, useState } from "react";
import { Download, Search } from "lucide-react";
import { SEM_UTM_LABEL } from "@/lib/painel-metricas";
import type { LeadPainel } from "@/lib/relatorio";
import { Bloco, TabelaRolavel, Td, Th, botaoContorno, brl, dataHora, inputPainel, labelPainel } from "./painel-ui";

type FiltroCompra = "todos" | "comprou" | "nao";
type FiltroDescad = "todos" | "sim" | "nao";

function csvCelula(v: unknown): string {
  const s = v === null || v === undefined ? "" : String(v);
  return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function baixarCsv(leads: LeadPainel[]) {
  const cab = [
    "nome", "email", "perfil", "cadastro", "campanha", "criativo", "fonte", "dispositivo", "formulario",
    "vsl_max_pct", "clicou_comprar", "iniciou_checkout", "comprou_valor", "comprou_em", "etapa_sequencia", "descadastrado_em",
  ];
  const linhas = leads.map((l) =>
    [
      l.nome, l.email, l.perfil, dataHora(l.criadoEm), l.campanha ?? "", l.criativo ?? "", l.fonte ?? "", l.dispositivo ?? "",
      l.formulario ?? "", l.vslMax ?? "", l.clicouComprar ? "sim" : "não", l.iniciouCheckout ? "sim" : "não",
      l.compra ? (l.compra.valorCentavos / 100).toFixed(2).replace(".", ",") : "", l.compra ? dataHora(l.compra.em) : "",
      l.etapa ?? "", l.descadastradoEm ? dataHora(l.descadastradoEm) : "",
    ].map(csvCelula).join(";"),
  );
  const blob = new Blob(["\ufeff" + [cab.join(";"), ...linhas].join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `leads-arsenal-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function Select({ id, label, valor, onChange, opcoes }: { id: string; label: string; valor: string; onChange: (v: string) => void; opcoes: { v: string; l: string }[] }) {
  return (
    <label htmlFor={id} className="block">
      <span className={labelPainel}>{label}</span>
      <select id={id} value={valor} onChange={(e) => onChange(e.target.value)} className={`${inputPainel} mt-1.5`}>
        {opcoes.map((o) => (
          <option key={o.v} value={o.v}>
            {o.l}
          </option>
        ))}
      </select>
    </label>
  );
}

const SIM = <span className="text-ocre">sim</span>;
const NAO = <span className="text-musgo-500">não</span>;

export function SecaoLeads({ leads, onAbrirLead }: { leads: LeadPainel[]; onAbrirLead: (email: string) => void }) {
  const [busca, setBusca] = useState("");
  const [campanha, setCampanha] = useState("");
  const [criativo, setCriativo] = useState("");
  const [perfil, setPerfil] = useState("");
  const [compra, setCompra] = useState<FiltroCompra>("todos");
  const [descad, setDescad] = useState<FiltroDescad>("todos");

  const opcoes = useMemo(() => {
    const u = (xs: (string | null)[]) => [...new Set(xs.map((x) => x ?? ""))].sort();
    return { campanhas: u(leads.map((l) => l.campanha)), criativos: u(leads.map((l) => l.criativo)), perfis: u(leads.map((l) => l.perfil)) };
  }, [leads]);

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return leads.filter((l) => {
      if (q && !l.nome.toLowerCase().includes(q) && !l.email.toLowerCase().includes(q)) return false;
      if (campanha && (l.campanha ?? "__sem__") !== campanha) return false;
      if (criativo && (l.criativo ?? "__sem__") !== criativo) return false;
      if (perfil && l.perfil !== perfil) return false;
      if (compra === "comprou" && !l.compra) return false;
      if (compra === "nao" && l.compra) return false;
      if (descad === "sim" && !l.descadastradoEm) return false;
      if (descad === "nao" && l.descadastradoEm) return false;
      return true;
    });
  }, [leads, busca, campanha, criativo, perfil, compra, descad]);

  const opt = (xs: string[], vazio: string) => [
    { v: "", l: "Todos" },
    ...xs.map((x) => ({ v: x || "__sem__", l: x || vazio })),
  ];

  return (
    <Bloco
      titulo={`Leads do período (${filtrados.length})`}
      acoes={
        <button type="button" onClick={() => baixarCsv(filtrados)} className={`${botaoContorno} flex items-center gap-2`} disabled={filtrados.length === 0}>
          <Download className="h-4 w-4" aria-hidden /> Exportar CSV
        </button>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <label htmlFor="busca-lead" className="block sm:col-span-2 lg:col-span-6">
          <span className={labelPainel}>Buscar por nome ou e-mail</span>
          <span className="relative mt-1.5 block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-musgo-500" aria-hidden />
            <input id="busca-lead" value={busca} onChange={(e) => setBusca(e.target.value)} className={`${inputPainel} pl-9`} placeholder="ex.: maria ou @gmail" />
          </span>
        </label>
        <Select id="f-camp" label="Campanha" valor={campanha} onChange={setCampanha} opcoes={opt(opcoes.campanhas, SEM_UTM_LABEL)} />
        <Select id="f-cri" label="Criativo" valor={criativo} onChange={setCriativo} opcoes={opt(opcoes.criativos, "(sem criativo)")} />
        <Select id="f-perfil" label="Perfil" valor={perfil} onChange={setPerfil} opcoes={[{ v: "", l: "Todos" }, ...opcoes.perfis.filter(Boolean).map((p) => ({ v: p, l: p }))]} />
        <Select id="f-compra" label="Compra" valor={compra} onChange={(v) => setCompra(v as FiltroCompra)} opcoes={[{ v: "todos", l: "Todos" }, { v: "comprou", l: "Comprou" }, { v: "nao", l: "Não comprou" }]} />
        <Select id="f-descad" label="Descadastro" valor={descad} onChange={(v) => setDescad(v as FiltroDescad)} opcoes={[{ v: "todos", l: "Todos" }, { v: "sim", l: "Descadastrados" }, { v: "nao", l: "Ativos" }]} />
      </div>

      <div className="mt-5">
        <TabelaRolavel min={1500}>
          <thead>
            <tr className="border-b-2 border-musgo-700">
              {["Nome", "E-mail", "Perfil", "Cadastro", "Campanha", "Criativo", "Dispositivo", "Formulário", "VSL máx.", "Clicou comprar", "Checkout", "Comprou", "Etapa", "Descadastro"].map((h) => (
                <Th key={h}>{h}</Th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtrados.length === 0 ? (
              <tr>
                <td colSpan={14} className="py-6 font-mono text-sm text-musgo-300">
                  Nenhum lead com esses filtros.
                </td>
              </tr>
            ) : (
              filtrados.map((l) => (
                <tr key={l.email} className="cursor-pointer border-b border-musgo-700/60 hover:bg-musgo-900/60" onClick={() => onAbrirLead(l.email)}>
                  <td className="py-2.5 pr-4">
                    <button type="button" className="text-left text-sm text-papel underline-offset-2 hover:text-ocre hover:underline" onClick={(e) => { e.stopPropagation(); onAbrirLead(l.email); }}>
                      {l.nome}
                    </button>
                  </td>
                  <Td>{l.email}</Td>
                  <Td>{l.perfil}</Td>
                  <Td>{dataHora(l.criadoEm)}</Td>
                  <Td className="text-papel">{l.campanha ?? <span className="text-musgo-500">{SEM_UTM_LABEL}</span>}</Td>
                  <Td>{l.criativo ?? "—"}</Td>
                  <Td>{l.dispositivo ?? "—"}</Td>
                  <Td>{l.formulario ?? "—"}</Td>
                  <Td direita>{l.vslMax === null ? "—" : `${l.vslMax}%`}</Td>
                  <Td>{l.clicouComprar ? SIM : NAO}</Td>
                  <Td>{l.iniciouCheckout ? SIM : NAO}</Td>
                  <Td>{l.compra ? <span className="text-ocre">{`${brl(l.compra.valorCentavos)} · ${dataHora(l.compra.em)}`}</span> : NAO}</Td>
                  <Td>{l.etapa ?? "—"}</Td>
                  <Td>{l.descadastradoEm ? <span className="text-alerta-claro">{dataHora(l.descadastradoEm)}</span> : "—"}</Td>
                </tr>
              ))
            )}
          </tbody>
        </TabelaRolavel>
      </div>
    </Bloco>
  );
}
