import type { ReactNode } from "react";
import { formatBrl } from "@/lib/product";

export const CORES_SERIES = ["var(--ocre)", "var(--musgo-300)", "var(--ferrugem)", "var(--musgo-150)", "var(--alerta-claro)", "var(--musgo-500)", "var(--papel-2)"];

export function brl(c: number | null | undefined): string {
  return c === null || c === undefined ? "—" : formatBrl(c);
}
export function pct(v: number | null | undefined): string {
  return v === null || v === undefined ? "—" : `${v.toLocaleString("pt-BR")}%`;
}
export function num(v: number | null | undefined): string {
  return v === null || v === undefined ? "—" : v.toLocaleString("pt-BR");
}
export function roasTxt(v: number | null | undefined): string {
  return v === null || v === undefined ? "—" : `${v.toLocaleString("pt-BR")}×`;
}

export function dataHora(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    timeZone: "America/Fortaleza",
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function dataCurta(dia: string) {
  const [, m, d] = dia.split("-");
  return `${d}/${m}`;
}

export function Kpi({ titulo, valor, nota }: { titulo: string; valor: string; nota?: ReactNode }) {
  return (
    <div className="border-2 border-musgo-700 bg-musgo-800 p-4">
      <p className="font-heading text-[11px] font-bold uppercase tracking-[0.12em] text-musgo-300">{titulo}</p>
      <p className="mt-2 font-mono text-2xl text-papel">{valor}</p>
      {nota ? <div className="mt-1 font-mono text-[11px]">{nota}</div> : null}
    </div>
  );
}

/** Variação contra o período anterior. `inverso` = cair é bom (ex.: custo por lead). */
export function Variacao({ valor, inverso = false }: { valor: number | null; inverso?: boolean }) {
  if (valor === null) return <span className="text-musgo-500">sem base no período anterior</span>;
  const bom = inverso ? valor < 0 : valor > 0;
  const cor = valor === 0 ? "text-musgo-300" : bom ? "text-ocre" : "text-alerta-claro";
  const sinal = valor > 0 ? "+" : "";
  return <span className={cor}>{`${sinal}${valor.toLocaleString("pt-BR")}% vs. anterior`}</span>;
}

export function Bloco({ titulo, children, acoes }: { titulo: string; children: ReactNode; acoes?: ReactNode }) {
  return (
    <section className="mt-6 border-2 border-musgo-700 bg-musgo-800 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-heading text-sm font-bold uppercase tracking-[0.12em] text-papel">{titulo}</h2>
        {acoes}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function Th({ children, direita = false }: { children: ReactNode; direita?: boolean }) {
  return (
    <th
      className={`whitespace-nowrap py-3 pr-4 font-heading text-[11px] font-bold uppercase tracking-[0.12em] text-musgo-300 ${direita ? "text-right" : "text-left"}`}
    >
      {children}
    </th>
  );
}

export function Td({ children, direita = false, className = "" }: { children: ReactNode; direita?: boolean; className?: string }) {
  return (
    <td className={`whitespace-nowrap py-2.5 pr-4 font-mono text-xs text-musgo-150 ${direita ? "text-right" : ""} ${className}`}>
      {children}
    </td>
  );
}

export function TabelaRolavel({ children, min = 720 }: { children: ReactNode; min?: number }) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
      <table className="w-full border-collapse text-left" style={{ minWidth: min }}>
        {children}
      </table>
    </div>
  );
}

export function Chips<T extends string>({
  opcoes,
  valor,
  onChange,
  rotulo,
}: {
  opcoes: { id: T; label: string }[];
  valor: T;
  onChange: (v: T) => void;
  rotulo: string;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label={rotulo}>
      {opcoes.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          aria-pressed={valor === o.id}
          className={`h-9 rounded-[2px] border-2 px-3 font-heading text-[11px] font-bold uppercase tracking-[0.12em] ${
            valor === o.id ? "border-ocre bg-ocre text-musgo-900" : "border-musgo-600 text-musgo-150 hover:border-ocre"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export const inputPainel =
  "h-10 w-full rounded-[2px] border-2 border-musgo-600 bg-musgo-900 px-3 font-mono text-sm text-papel placeholder:text-musgo-500 focus:border-ocre focus:outline-none";

export const labelPainel = "font-heading text-[11px] font-bold uppercase tracking-[0.12em] text-musgo-300";

export const botaoContorno =
  "h-10 rounded-[2px] border-2 border-ocre px-4 font-heading text-xs font-bold uppercase tracking-[0.12em] text-ocre transition-colors hover:bg-ocre hover:text-musgo-900 disabled:opacity-60";

export const tooltipEstilo = {
  background: "#1B2418",
  border: "2px solid #3B4A2C",
  borderRadius: 2,
  color: "#F5F2E6",
  fontSize: 12,
};
