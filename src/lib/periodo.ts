// Períodos do painel no fuso America/Fortaleza. Puro — testado em periodo.test.ts.
// Fortaleza não tem horário de verão: o deslocamento é sempre UTC-3.

export const FUSO = "America/Fortaleza";
const OFFSET_MS = -3 * 60 * 60 * 1000;
const DIA_MS = 24 * 60 * 60 * 1000;
const DIA_RE = /^\d{4}-\d{2}-\d{2}$/;

export type Periodo = { desde: string; ate: string }; // dias inclusivos, AAAA-MM-DD
export type PeriodoTipo = "hoje" | "7" | "30" | "90" | "custom";

export function ehDia(v: unknown): v is string {
  if (typeof v !== "string" || !DIA_RE.test(v)) return false;
  const d = new Date(`${v}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v;
}

/** Dia local (Fortaleza) de um instante. */
export function diaLocal(valor: string | Date | number): string {
  const ms = typeof valor === "number" ? valor : new Date(valor).getTime();
  return new Date(ms + OFFSET_MS).toISOString().slice(0, 10);
}

/** Hora local (0–23) de um instante. */
export function horaLocal(valor: string | Date): number {
  return new Date(new Date(valor).getTime() + OFFSET_MS).getUTCHours();
}

function somarDias(dia: string, n: number): string {
  return new Date(new Date(`${dia}T00:00:00Z`).getTime() + n * DIA_MS).toISOString().slice(0, 10);
}

/** Período a partir do tipo escolhido. "7 dias" = hoje e os 6 dias anteriores. */
export function resolverPeriodo(
  tipo: PeriodoTipo,
  agora: Date,
  custom?: { desde?: string; ate?: string },
): Periodo {
  const hoje = diaLocal(agora);
  if (tipo === "hoje") return { desde: hoje, ate: hoje };
  if (tipo === "custom") {
    const desde = ehDia(custom?.desde) ? custom!.desde! : hoje;
    let ate = ehDia(custom?.ate) ? custom!.ate! : hoje;
    if (ate > hoje) ate = hoje;
    return desde <= ate ? { desde, ate } : { desde: ate, ate: desde };
  }
  const n = Number(tipo);
  return { desde: somarDias(hoje, -(n - 1)), ate: hoje };
}

export function qtdDias(p: Periodo): number {
  return Math.round((new Date(`${p.ate}T00:00:00Z`).getTime() - new Date(`${p.desde}T00:00:00Z`).getTime()) / DIA_MS) + 1;
}

/** Período anterior de mesmo tamanho, imediatamente antes. */
export function periodoAnterior(p: Periodo): Periodo {
  const n = qtdDias(p);
  return { desde: somarDias(p.desde, -n), ate: somarDias(p.desde, -1) };
}

export function diasDoPeriodo(p: Periodo): string[] {
  const out: string[] = [];
  for (let d = p.desde; d <= p.ate; d = somarDias(d, 1)) out.push(d);
  return out;
}

/** Limites em UTC: início inclusivo, fim exclusivo. */
export function limitesUtc(p: Periodo): { inicio: string; fim: string } {
  const inicio = new Date(new Date(`${p.desde}T00:00:00Z`).getTime() - OFFSET_MS).toISOString();
  const fim = new Date(new Date(`${somarDias(p.ate, 1)}T00:00:00Z`).getTime() - OFFSET_MS).toISOString();
  return { inicio, fim };
}

export function dentro(p: Periodo, valor: string | Date): boolean {
  const d = diaLocal(valor);
  return d >= p.desde && d <= p.ate;
}

/** Normaliza um período vindo de fora (server fn / rota). Máximo de 366 dias. */
export function normalizarPeriodo(input: { desde?: unknown; ate?: unknown } | undefined, agora: Date): Periodo {
  const hoje = diaLocal(agora);
  const ate = ehDia(input?.ate) && input!.ate <= hoje ? (input!.ate as string) : hoje;
  let desde = ehDia(input?.desde) ? (input!.desde as string) : somarDias(ate, -29);
  if (desde > ate) desde = ate;
  if (qtdDias({ desde, ate }) > 366) desde = somarDias(ate, -365);
  return { desde, ate };
}

export { somarDias };
