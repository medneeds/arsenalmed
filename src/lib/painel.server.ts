// Carrega e calcula os dados do painel de campanhas. Só servidor: usa o
// cliente privilegiado. Chame somente depois de verificar o administrador
// (server fn) ou o token do relatório (rota).
import { normalizarPeriodo, limitesUtc, periodoAnterior, resolverPeriodo, type Periodo } from "@/lib/periodo";
import {
  ehVendaPaga,
  etapaAtual,
  funilCompacto,
  funilPorSegmento,
  funilVendas,
  metricasSequencia,
  resumirSessoes,
  resumoPeriodo,
  serieCampanhas,
  tabelaCampanhas,
  type CompraRow,
  type EnvioRow,
  type EventoRow,
  type InvestimentoRow,
  type LeadRow,
  type Resumo,
} from "@/lib/painel-metricas";
import type { DadosRelatorio, LeadPainel } from "@/lib/relatorio";

type Admin = (typeof import("@/integrations/supabase/client.server"))["supabaseAdmin"];

const PAGINA = 1000;
const MAX_LINHAS = 100_000;

async function todas<T>(buscar: (de: number, ate: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>): Promise<T[]> {
  const out: T[] = [];
  for (let de = 0; de < MAX_LINHAS; de += PAGINA) {
    const { data, error } = await buscar(de, de + PAGINA - 1);
    if (error) throw new Error(error.message);
    out.push(...(data ?? []));
    if (!data || data.length < PAGINA) break;
  }
  return out;
}

const COL_EVENTO = "session_id,evento,pagina,props,utm_source,utm_medium,utm_campaign,utm_content,dispositivo,criado_em";
const COL_LEAD =
  "email,nome,perfil,criado_em,utm_source,utm_medium,utm_campaign,utm_content,dispositivo,origem_formulario,session_id,descadastrado_em";

function lote<T>(arr: T[], n: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}

export type PainelDados = DadosRelatorio & {
  anterior: Periodo;
  visao: { hoje: Resumo; periodo: Resumo; anterior: Resumo };
  serie: ReturnType<typeof serieCampanhas>;
  funis: {
    vendasPor: Record<"dispositivo" | "campanha" | "hora", ReturnType<typeof funilPorSegmento>>;
    compactoPor: Record<"dispositivo" | "campanha" | "hora", ReturnType<typeof funilPorSegmento>>;
  };
  investimentos: (InvestimentoRow & { observacao: string | null })[];
  campanhasConhecidas: string[];
};

export async function carregarPainel(db: Admin, entrada: { desde?: unknown; ate?: unknown } | undefined): Promise<PainelDados> {
  const agora = new Date();
  const periodo = normalizarPeriodo(entrada, agora);
  const anterior = periodoAnterior(periodo);
  const { inicio, fim } = limitesUtc(periodo);

  const [eventos, leads, compras, investimentos, envios] = await Promise.all([
    todas<EventoRow>((de, ate) =>
      db.from("eventos_funil").select(COL_EVENTO).gte("criado_em", inicio).lt("criado_em", fim).order("criado_em").range(de, ate) as never,
    ),
    todas<LeadRow>((de, ate) => db.from("leads").select(COL_LEAD).order("criado_em", { ascending: false }).range(de, ate) as never),
    todas<CompraRow>((de, ate) =>
      db
        .from("compras")
        .select("email,valor_centavos,criado_em,status,origem,utm_campaign,utm_content")
        .order("criado_em", { ascending: false })
        .range(de, ate) as never,
    ),
    todas<InvestimentoRow & { observacao: string | null }>((de, ate) =>
      db.from("investimento_campanhas").select("dia,utm_campaign,valor_centavos,observacao").order("dia", { ascending: false }).range(de, ate) as never,
    ),
    todas<EnvioRow>((de, ate) => db.from("lead_emails").select("email,etapa,enviado_em").range(de, ate) as never),
  ]);

  const sessoes = resumirSessoes(eventos);
  const leadsPeriodo = leads.filter((l) => {
    const d = l.criado_em;
    return d >= inicio && d < fim;
  });

  // Comportamento de cada lead: todos os eventos do session_id gravado nele.
  const sids = [...new Set(leadsPeriodo.map((l) => l.session_id).filter((s): s is string => !!s))];
  const eventosLeads: EventoRow[] = [];
  for (const grupo of lote(sids, 100)) {
    eventosLeads.push(
      ...(await todas<EventoRow>((de, ate) => db.from("eventos_funil").select(COL_EVENTO).in("session_id", grupo).range(de, ate) as never)),
    );
  }
  const sessoesLeads = resumirSessoes(eventosLeads);

  const enviosPorEmail = new Map<string, EnvioRow[]>();
  for (const e of envios) {
    const k = e.email.toLowerCase();
    if (!enviosPorEmail.has(k)) enviosPorEmail.set(k, []);
    enviosPorEmail.get(k)!.push(e);
  }
  const compraPorEmail = new Map<string, CompraRow>();
  for (const c of [...compras].reverse()) {
    if (ehVendaPaga(c)) compraPorEmail.set(c.email.toLowerCase(), c); // a mais recente fica
  }

  const listaLeads: LeadPainel[] = leadsPeriodo.map((l) => {
    const s = l.session_id ? sessoesLeads.get(l.session_id) : undefined;
    const compra = compraPorEmail.get(l.email.toLowerCase());
    return {
      email: l.email,
      nome: l.nome,
      perfil: l.perfil,
      criadoEm: l.criado_em,
      campanha: l.utm_campaign,
      criativo: l.utm_content,
      fonte: l.utm_source,
      dispositivo: l.dispositivo,
      formulario: l.origem_formulario,
      sessionId: l.session_id,
      vslMax: s?.vslMax ?? null,
      clicouComprar: !!s?.clicouComprar,
      iniciouCheckout: !!s?.checkout,
      compra: compra ? { valorCentavos: compra.valor_centavos ?? 0, em: compra.criado_em } : null,
      etapa: etapaAtual((enviosPorEmail.get(l.email.toLowerCase()) ?? []).map((e) => e.etapa)),
      descadastradoEm: l.descadastrado_em,
    };
  });

  const base = { leads, compras, investimentos };
  const lista = [...sessoes.values()];
  const segs = ["dispositivo", "campanha", "hora"] as const;

  return {
    periodo,
    anterior,
    geradoEm: agora.toISOString(),
    resumo: resumoPeriodo({ ...base, periodo }),
    visao: {
      hoje: resumoPeriodo({ ...base, periodo: resolverPeriodo("hoje", agora) }),
      periodo: resumoPeriodo({ ...base, periodo }),
      anterior: resumoPeriodo({ ...base, periodo: anterior }),
    },
    campanhas: tabelaCampanhas({ sessoes: lista, leads, compras, investimentos, periodo }),
    serie: serieCampanhas(leads, compras, periodo),
    funilVendas: funilVendas(lista),
    funilCompacto: funilCompacto(lista),
    funis: {
      vendasPor: Object.fromEntries(segs.map((s) => [s, funilPorSegmento(lista, s, "vendas")])) as PainelDados["funis"]["vendasPor"],
      compactoPor: Object.fromEntries(segs.map((s) => [s, funilPorSegmento(lista, s, "compacto")])) as PainelDados["funis"]["compactoPor"],
    },
    sequencia: metricasSequencia({ envios, leads, compras, eventos, periodo }),
    leads: listaLeads,
    investimentos: investimentos.filter((i) => i.dia >= periodo.desde && i.dia <= periodo.ate),
    campanhasConhecidas: [
      ...new Set(
        [...leads.map((l) => l.utm_campaign), ...investimentos.map((i) => i.utm_campaign), ...eventos.map((e) => e.utm_campaign)]
          .map((c) => (c ?? "").trim().toLowerCase())
          .filter(Boolean),
      ),
    ].sort(),
  };
}

export type TimelineItem =
  | { tipo: "evento"; em: string; evento: string; pagina: string | null; detalhe: string | null; email: boolean }
  | { tipo: "email"; em: string; etapa: string }
  | { tipo: "cadastro"; em: string; detalhe: string }
  | { tipo: "compra"; em: string; valorCentavos: number; status: string; bonus: boolean };

export async function carregarTimeline(db: Admin, email: string) {
  const alvo = email.trim().toLowerCase();
  const { data: lead, error } = await db.from("leads").select(COL_LEAD).eq("email", alvo).maybeSingle();
  if (error) throw new Error(error.message);
  if (!lead) return null;

  const [eventosRes, enviosRes, comprasRes] = await Promise.all([
    lead.session_id
      ? db.from("eventos_funil").select(COL_EVENTO).eq("session_id", lead.session_id).order("criado_em").limit(1000)
      : Promise.resolve({ data: [] as EventoRow[], error: null }),
    db.from("lead_emails").select("email,etapa,enviado_em").eq("email", alvo),
    db.from("compras").select("criado_em,valor_centavos,status,origem").eq("email", alvo),
  ]);
  if (eventosRes.error) throw new Error(eventosRes.error.message);
  if (enviosRes.error) throw new Error(enviosRes.error.message);
  if (comprasRes.error) throw new Error(comprasRes.error.message);

  const itens: TimelineItem[] = [];
  for (const e of (eventosRes.data ?? []) as EventoRow[]) {
    const props = (e.props ?? {}) as Record<string, unknown>;
    let detalhe: string | null = null;
    if (e.evento === "vsl_progress") detalhe = `${props["pct"]}%`;
    else if (props["origem"]) detalhe = String(props["origem"]);
    else if (e.evento === "page_view" && e.utm_campaign && props["chegada_utm"]) {
      detalhe = [e.utm_source, e.utm_campaign, e.utm_content].filter(Boolean).join(" · ");
    }
    itens.push({
      tipo: "evento",
      em: e.criado_em,
      evento: e.evento,
      pagina: e.pagina,
      detalhe,
      email: e.evento === "page_view" && e.utm_medium === "sequencia" && props["chegada_utm"] === true,
    });
  }
  for (const e of enviosRes.data ?? []) itens.push({ tipo: "email", em: e.enviado_em, etapa: e.etapa });
  itens.push({ tipo: "cadastro", em: lead.criado_em, detalhe: lead.origem_formulario ?? "formulário" });
  for (const c of comprasRes.data ?? []) {
    itens.push({
      tipo: "compra",
      em: c.criado_em,
      valorCentavos: c.valor_centavos ?? 0,
      status: c.status,
      bonus: c.origem === "medstation_bonus",
    });
  }
  itens.sort((a, b) => (a.em < b.em ? -1 : 1));

  return {
    lead: {
      email: lead.email,
      nome: lead.nome,
      perfil: lead.perfil,
      criadoEm: lead.criado_em,
      campanha: lead.utm_campaign,
      criativo: lead.utm_content,
      fonte: lead.utm_source,
      dispositivo: lead.dispositivo,
      formulario: lead.origem_formulario,
      descadastradoEm: lead.descadastrado_em,
      temSessao: !!lead.session_id,
    },
    itens,
  };
}
