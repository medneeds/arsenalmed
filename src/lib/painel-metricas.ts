// Regras de cálculo do painel de campanhas. Puro (sem I/O) — testado em
// painel-metricas.test.ts. Bônus MedStation nunca conta como venda.
import { ETAPAS } from "./sequencia-compacto";
import { dentro, diaLocal, diasDoPeriodo, horaLocal, type Periodo } from "./periodo";

export const SEM_UTM_LABEL = "Sem UTM / orgânico";
const PAGOS = new Set(["pago", "paid", "completed", "succeeded"]);

// ---------- Tipos das linhas lidas do banco ----------

export type EventoRow = {
  session_id: string;
  evento: string;
  pagina: string | null;
  props: Record<string, unknown> | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  dispositivo: string | null;
  criado_em: string;
};

export type LeadRow = {
  email: string;
  nome: string;
  perfil: string;
  criado_em: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  dispositivo: string | null;
  origem_formulario: string | null;
  session_id: string | null;
  descadastrado_em: string | null;
};

export type CompraRow = {
  email: string;
  valor_centavos: number | null;
  criado_em: string;
  status: string;
  origem: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
};

export type InvestimentoRow = { dia: string; utm_campaign: string; valor_centavos: number };
export type EnvioRow = { email: string; etapa: string; enviado_em: string };

// ---------- Contas básicas ----------

/** Custo por resultado em centavos. Sem investimento ou sem resultado: null. */
export function custoPor(investimentoCentavos: number, resultados: number): number | null {
  if (!(investimentoCentavos > 0) || !(resultados > 0)) return null;
  return Math.round(investimentoCentavos / resultados);
}

/** ROAS = receita ÷ investimento, 2 casas. Sem investimento: null. */
export function roas(receitaCentavos: number, investimentoCentavos: number): number | null {
  if (!(investimentoCentavos > 0)) return null;
  return Math.round((receitaCentavos / investimentoCentavos) * 100) / 100;
}

/** Percentual com 1 casa. Total zero: null. */
export function taxa(parte: number, total: number): number | null {
  if (!(total > 0)) return null;
  return Math.round((parte / total) * 1000) / 10;
}

/** Variação percentual contra o período anterior. Anterior zero: null. */
export function variacao(atual: number | null, anterior: number | null): number | null {
  if (atual === null || anterior === null || !(anterior > 0)) return null;
  return Math.round(((atual - anterior) / anterior) * 1000) / 10;
}

export function ehVendaPaga(c: Pick<CompraRow, "status" | "origem">): boolean {
  return PAGOS.has(String(c.status).toLowerCase()) && c.origem !== "medstation_bonus";
}

export function mascararEmail(email: string): string {
  const [usuario, dominio] = String(email).trim().toLowerCase().split("@");
  if (!usuario || !dominio) return "***";
  return `${usuario[0]}***@${dominio}`;
}

export function primeiroNome(nome: string): string {
  return String(nome).trim().split(/\s+/)[0] ?? "";
}

function chave(v: string | null | undefined): string | null {
  const t = (v ?? "").trim().toLowerCase();
  return t ? t : null;
}

// ---------- Sessões (comportamento) ----------

export type SessaoInfo = {
  session_id: string;
  campanha: string | null;
  criativo: string | null;
  dispositivo: string | null;
  hora: number;
  inicio: string;
  pageviews: number;
  viuVendas: boolean;
  play: boolean;
  vslMax: number | null;
  clicouComprar: boolean;
  checkout: boolean;
  pagou: boolean;
  viuCompacto: boolean;
  enviouCompacto: boolean;
};

const ehVisita = (e: EventoRow) => e.evento === "page_view" || e.evento === "view_landing";

/**
 * Agrupa eventos por session_id. A campanha, o criativo, o dispositivo e a
 * hora da sessão vêm do primeiro evento dela (último toque naquele momento).
 */
export function resumirSessoes(eventos: EventoRow[]): Map<string, SessaoInfo> {
  const ordenados = [...eventos].sort((a, b) => (a.criado_em < b.criado_em ? -1 : 1));
  const mapa = new Map<string, SessaoInfo>();
  for (const e of ordenados) {
    let s = mapa.get(e.session_id);
    if (!s) {
      s = {
        session_id: e.session_id,
        campanha: chave(e.utm_campaign),
        criativo: chave(e.utm_content),
        dispositivo: e.dispositivo,
        hora: horaLocal(e.criado_em),
        inicio: e.criado_em,
        pageviews: 0,
        viuVendas: false,
        play: false,
        vslMax: null,
        clicouComprar: false,
        checkout: false,
        pagou: false,
        viuCompacto: false,
        enviouCompacto: false,
      };
      mapa.set(e.session_id, s);
    }
    if (e.evento === "page_view") s.pageviews += 1;
    if (ehVisita(e) && e.pagina === "/") s.viuVendas = true;
    if (ehVisita(e) && e.pagina === "/compacto") s.viuCompacto = true;
    if (e.evento === "submit_compacto" && e.pagina === "/compacto") s.enviouCompacto = true;
    if (e.evento === "vsl_play") {
      s.play = true;
      s.vslMax = Math.max(s.vslMax ?? 0, 0);
    }
    if (e.evento === "vsl_progress") {
      const pct = Number(e.props?.["pct"]);
      if (Number.isFinite(pct)) s.vslMax = Math.max(s.vslMax ?? 0, Math.min(100, pct));
    }
    if (e.evento === "click_buy") s.clicouComprar = true;
    if (e.evento === "checkout_started") s.checkout = true;
    if (e.evento === "payment_confirmed") s.pagou = true;
  }
  return mapa;
}

// ---------- Funis ----------

export type EtapaFunil = { etapa: string; total: number; pct: number | null };

const ETAPAS_VENDAS: [string, (s: SessaoInfo) => boolean][] = [
  ["Visitou", (s) => s.viuVendas],
  ["Deu play na VSL", (s) => s.play],
  ["VSL 25%", (s) => (s.vslMax ?? -1) >= 25],
  ["VSL 50%", (s) => (s.vslMax ?? -1) >= 50],
  ["VSL 75%", (s) => (s.vslMax ?? -1) >= 75],
  ["VSL 95%", (s) => (s.vslMax ?? -1) >= 95],
  ["Clicou em comprar", (s) => s.clicouComprar],
  ["Iniciou checkout", (s) => s.checkout],
  ["Pagou", (s) => s.pagou],
];

const ETAPAS_COMPACTO: [string, (s: SessaoInfo) => boolean][] = [
  ["Visitou /compacto", (s) => s.viuCompacto],
  ["Enviou o formulário", (s) => s.enviouCompacto],
];

function montarFunil(sessoes: Iterable<SessaoInfo>, etapas: [string, (s: SessaoInfo) => boolean][]): EtapaFunil[] {
  const lista = [...sessoes];
  const totais = etapas.map(([, f]) => lista.filter(f).length);
  const topo = totais[0] ?? 0;
  return etapas.map(([etapa], i) => ({ etapa, total: totais[i]!, pct: i === 0 ? (topo > 0 ? 100 : null) : taxa(totais[i]!, topo) }));
}

/** Sessões únicas em cada etapa; % sempre sobre quem visitou. */
export function funilVendas(sessoes: Iterable<SessaoInfo>): EtapaFunil[] {
  return montarFunil(sessoes, ETAPAS_VENDAS);
}

export function funilCompacto(sessoes: Iterable<SessaoInfo>): EtapaFunil[] {
  return montarFunil(sessoes, ETAPAS_COMPACTO);
}

export type Segmento = "dispositivo" | "campanha" | "hora";

export function funilPorSegmento(
  sessoes: Iterable<SessaoInfo>,
  segmento: Segmento,
  tipo: "vendas" | "compacto",
): { segmento: string; etapas: EtapaFunil[] }[] {
  const grupos = new Map<string, SessaoInfo[]>();
  for (const s of sessoes) {
    const k =
      segmento === "dispositivo"
        ? (s.dispositivo ?? "desconhecido")
        : segmento === "campanha"
          ? (s.campanha ?? SEM_UTM_LABEL)
          : `${String(s.hora).padStart(2, "0")}h`;
    if (!grupos.has(k)) grupos.set(k, []);
    grupos.get(k)!.push(s);
  }
  const fn = tipo === "vendas" ? funilVendas : funilCompacto;
  return [...grupos.entries()]
    .map(([k, lista]) => ({ segmento: k, etapas: fn(lista) }))
    .filter((g) => (g.etapas[0]?.total ?? 0) > 0)
    .sort((a, b) => (segmento === "hora" ? a.segmento.localeCompare(b.segmento) : b.etapas[0]!.total - a.etapas[0]!.total));
}

// ---------- Campanhas ----------

export type LinhaCampanha = {
  campanha: string | null;
  criativo: string | null;
  visitas: number;
  pageviews: number;
  plays: number;
  leads: number;
  checkouts: number;
  compras: number;
  receitaCentavos: number;
  investimentoCentavos: number | null;
  cplCentavos: number | null;
  cpvCentavos: number | null;
  taxaVisitaLead: number | null;
  taxaLeadCompra: number | null;
  roas: number | null;
  criativos: LinhaCampanha[];
};

type Acumulado = Omit<LinhaCampanha, "cplCentavos" | "cpvCentavos" | "taxaVisitaLead" | "taxaLeadCompra" | "roas" | "criativos" | "investimentoCentavos"> & {
  investimentoCentavos: number;
};

function vazio(campanha: string | null, criativo: string | null): Acumulado {
  return { campanha, criativo, visitas: 0, pageviews: 0, plays: 0, leads: 0, checkouts: 0, compras: 0, receitaCentavos: 0, investimentoCentavos: 0 };
}

function fechar(a: Acumulado, comInvestimento: boolean, criativos: LinhaCampanha[] = []): LinhaCampanha {
  const inv = comInvestimento ? a.investimentoCentavos : null;
  return {
    ...a,
    investimentoCentavos: inv,
    cplCentavos: inv === null ? null : custoPor(inv, a.leads),
    cpvCentavos: inv === null ? null : custoPor(inv, a.compras),
    taxaVisitaLead: taxa(a.leads, a.visitas),
    taxaLeadCompra: taxa(a.compras, a.leads),
    roas: inv === null ? null : roas(a.receitaCentavos, inv),
    criativos,
  };
}

/**
 * Tabela por utm_campaign (último toque), expansível por utm_content.
 * Visitas, visualizações, plays e checkouts vêm das sessões; leads e compras,
 * das próprias linhas (que guardam a origem). O investimento só existe no
 * nível da campanha. Linha null = "Sem UTM / orgânico", sempre por último.
 */
export function tabelaCampanhas(entrada: {
  sessoes: Iterable<SessaoInfo>;
  leads: LeadRow[];
  compras: CompraRow[];
  investimentos: InvestimentoRow[];
  periodo: Periodo;
}): LinhaCampanha[] {
  const camp = new Map<string | null, Acumulado>();
  const cri = new Map<string | null, Map<string | null, Acumulado>>();
  const pegar = (c: string | null, k: string | null) => {
    if (!camp.has(c)) camp.set(c, vazio(c, null));
    if (!cri.has(c)) cri.set(c, new Map());
    const m = cri.get(c)!;
    if (!m.has(k)) m.set(k, vazio(c, k));
    return [camp.get(c)!, m.get(k)!] as const;
  };

  for (const s of entrada.sessoes) {
    for (const a of pegar(s.campanha, s.criativo)) {
      a.visitas += 1;
      a.pageviews += s.pageviews;
      if (s.play) a.plays += 1;
      if (s.checkout) a.checkouts += 1;
    }
  }
  for (const l of entrada.leads) {
    if (!dentro(entrada.periodo, l.criado_em)) continue;
    for (const a of pegar(chave(l.utm_campaign), chave(l.utm_content))) a.leads += 1;
  }
  for (const c of entrada.compras) {
    if (!ehVendaPaga(c) || !dentro(entrada.periodo, c.criado_em)) continue;
    for (const a of pegar(chave(c.utm_campaign), chave(c.utm_content))) {
      a.compras += 1;
      a.receitaCentavos += c.valor_centavos ?? 0;
    }
  }
  for (const i of entrada.investimentos) {
    if (i.dia < entrada.periodo.desde || i.dia > entrada.periodo.ate) continue;
    const c = chave(i.utm_campaign);
    if (!camp.has(c)) camp.set(c, vazio(c, null));
    camp.get(c)!.investimentoCentavos += i.valor_centavos;
  }

  const linhas = [...camp.values()].map((a) => {
    const criativos = [...(cri.get(a.campanha)?.values() ?? [])]
      .map((x) => fechar(x, false))
      .sort((x, y) => y.leads - x.leads || y.visitas - x.visitas);
    return fechar(a, true, criativos);
  });
  return linhas.sort((x, y) => {
    if (x.campanha === null) return 1;
    if (y.campanha === null) return -1;
    return y.leads - x.leads || y.compras - x.compras || y.visitas - x.visitas;
  });
}

export type DiaCampanhas = { dia: string; leads: Record<string, number>; compras: Record<string, number> };

export function serieCampanhas(leads: LeadRow[], compras: CompraRow[], periodo: Periodo): { campanhas: string[]; dias: DiaCampanhas[] } {
  const dias = new Map(diasDoPeriodo(periodo).map((d) => [d, { dia: d, leads: {}, compras: {} } as DiaCampanhas]));
  const nomes = new Set<string>();
  for (const l of leads) {
    const d = dias.get(diaLocal(l.criado_em));
    if (!d) continue;
    const k = chave(l.utm_campaign) ?? SEM_UTM_LABEL;
    nomes.add(k);
    d.leads[k] = (d.leads[k] ?? 0) + 1;
  }
  for (const c of compras) {
    if (!ehVendaPaga(c)) continue;
    const d = dias.get(diaLocal(c.criado_em));
    if (!d) continue;
    const k = chave(c.utm_campaign) ?? SEM_UTM_LABEL;
    nomes.add(k);
    d.compras[k] = (d.compras[k] ?? 0) + 1;
  }
  return { campanhas: [...nomes].sort(), dias: [...dias.values()] };
}

// ---------- Visão geral ----------

export type Resumo = {
  leads: number;
  compras: number;
  receitaCentavos: number;
  investimentoCentavos: number;
  cplCentavos: number | null;
  roas: number | null;
};

export function resumoPeriodo(entrada: { leads: LeadRow[]; compras: CompraRow[]; investimentos: InvestimentoRow[]; periodo: Periodo }): Resumo {
  const p = entrada.periodo;
  const leads = entrada.leads.filter((l) => dentro(p, l.criado_em)).length;
  const pagas = entrada.compras.filter((c) => ehVendaPaga(c) && dentro(p, c.criado_em));
  const receitaCentavos = pagas.reduce((s, c) => s + (c.valor_centavos ?? 0), 0);
  const investimentoCentavos = entrada.investimentos
    .filter((i) => i.dia >= p.desde && i.dia <= p.ate)
    .reduce((s, i) => s + i.valor_centavos, 0);
  return {
    leads,
    compras: pagas.length,
    receitaCentavos,
    investimentoCentavos,
    cplCentavos: custoPor(investimentoCentavos, leads),
    roas: roas(receitaCentavos, investimentoCentavos),
  };
}

// ---------- Sequência de e-mails ----------

const ORDEM = new Map<string, number>(ETAPAS.map((e, i) => [e.etapa, i]));

/** Etapa mais avançada já enviada ao lead (d1 < d3 < d5 < d7). */
export function etapaAtual(etapas: Iterable<string>): string | null {
  let melhor: string | null = null;
  for (const e of etapas) {
    if (!ORDEM.has(e)) continue;
    if (melhor === null || ORDEM.get(e)! > ORDEM.get(melhor)!) melhor = e;
  }
  return melhor;
}

/** Última etapa enviada antes de um instante (para atribuir compra/descadastro). */
export function etapaAntesDe(envios: EnvioRow[], instante: string): string | null {
  let melhor: EnvioRow | null = null;
  for (const e of envios) {
    if (e.enviado_em >= instante) continue;
    if (!melhor || e.enviado_em > melhor.enviado_em) melhor = e;
  }
  return melhor?.etapa ?? null;
}

/** Clique de e-mail: chegada ao site com utm_medium=sequencia na URL. */
export function ehCliqueEmail(e: EventoRow): boolean {
  return e.evento === "page_view" && e.utm_medium === "sequencia" && e.props?.["chegada_utm"] === true;
}

export type MetricaEtapa = { etapa: string; enviados: number; cliques: number; comprasAtribuidas: number; descadastros: number };

/**
 * Por etapa: envios no período; cliques (chegadas com utm da etapa, sessões
 * únicas); compras do período atribuídas à última etapa recebida antes da
 * compra; descadastros do período atribuídos à última etapa antes do pedido.
 */
export function metricasSequencia(entrada: {
  envios: EnvioRow[];
  leads: LeadRow[];
  compras: CompraRow[];
  eventos: EventoRow[];
  periodo: Periodo;
}): MetricaEtapa[] {
  const p = entrada.periodo;
  const porEmail = new Map<string, EnvioRow[]>();
  for (const e of entrada.envios) {
    const k = e.email.toLowerCase();
    if (!porEmail.has(k)) porEmail.set(k, []);
    porEmail.get(k)!.push(e);
  }
  const res = new Map<string, MetricaEtapa>(
    ETAPAS.map((e) => [e.etapa, { etapa: e.etapa, enviados: 0, cliques: 0, comprasAtribuidas: 0, descadastros: 0 }]),
  );
  for (const e of entrada.envios) if (dentro(p, e.enviado_em)) { const m = res.get(e.etapa); if (m) m.enviados += 1; }

  const cliques = new Map<string, Set<string>>();
  for (const e of entrada.eventos) {
    if (!ehCliqueEmail(e) || !dentro(p, e.criado_em) || !e.utm_content) continue;
    if (!cliques.has(e.utm_content)) cliques.set(e.utm_content, new Set());
    cliques.get(e.utm_content)!.add(e.session_id);
  }
  for (const [etapa, s] of cliques) { const m = res.get(etapa); if (m) m.cliques = s.size; }

  for (const c of entrada.compras) {
    if (!ehVendaPaga(c) || !dentro(p, c.criado_em)) continue;
    const etapa = etapaAntesDe(porEmail.get(c.email.toLowerCase()) ?? [], c.criado_em);
    const m = etapa ? res.get(etapa) : undefined;
    if (m) m.comprasAtribuidas += 1;
  }
  for (const l of entrada.leads) {
    if (!l.descadastrado_em || !dentro(p, l.descadastrado_em)) continue;
    const etapa = etapaAntesDe(porEmail.get(l.email.toLowerCase()) ?? [], l.descadastrado_em);
    const m = etapa ? res.get(etapa) : undefined;
    if (m) m.descadastros += 1;
  }
  return [...res.values()];
}
