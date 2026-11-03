// Relatório para análise externa (markdown e JSON). Puro. Nunca leva e-mail
// completo, nome completo ou CPF: os leads saem com primeiro nome e e-mail
// mascarado.
import type { Periodo } from "@/lib/periodo";
import {
  SEM_UTM_LABEL,
  mascararEmail,
  primeiroNome,
  type EtapaFunil,
  type LinhaCampanha,
  type MetricaEtapa,
  type Resumo,
} from "@/lib/painel-metricas";

export type LeadPainel = {
  email: string;
  nome: string;
  perfil: string;
  criadoEm: string;
  campanha: string | null;
  criativo: string | null;
  fonte: string | null;
  dispositivo: string | null;
  formulario: string | null;
  sessionId: string | null;
  vslMax: number | null;
  clicouComprar: boolean;
  iniciouCheckout: boolean;
  compra: { valorCentavos: number; em: string } | null;
  etapa: string | null;
  descadastradoEm: string | null;
};

export type DadosRelatorio = {
  periodo: Periodo;
  geradoEm: string;
  resumo: Resumo;
  campanhas: LinhaCampanha[];
  funilVendas: EtapaFunil[];
  funilCompacto: EtapaFunil[];
  sequencia: MetricaEtapa[];
  leads: LeadPainel[];
};

export type LeadMascarado = Omit<LeadPainel, "email" | "nome" | "sessionId"> & { nome: string; email: string };

export function mascararLead(l: LeadPainel): LeadMascarado {
  const { sessionId: _s, email, nome, ...resto } = l;
  return { ...resto, nome: primeiroNome(nome), email: mascararEmail(email) };
}

export function relatorioJson(d: DadosRelatorio, limiteLeads = 50) {
  return {
    periodo: d.periodo,
    gerado_em: d.geradoEm,
    fuso: "America/Fortaleza",
    resumo: d.resumo,
    campanhas: d.campanhas.map((c) => ({ ...c, campanha: c.campanha ?? SEM_UTM_LABEL })),
    funil_vendas: d.funilVendas,
    funil_compacto: d.funilCompacto,
    sequencia: d.sequencia,
    leads: d.leads.slice(0, limiteLeads).map(mascararLead),
  };
}

const brl = (c: number | null) =>
  c === null ? "—" : new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(c / 100);
const pct = (v: number | null) => (v === null ? "—" : `${v.toLocaleString("pt-BR")}%`);
const num = (v: number | null) => (v === null ? "—" : v.toLocaleString("pt-BR"));
const cel = (v: string | null | undefined) => String(v ?? "—").replace(/\|/g, "/");

function dataHora(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    timeZone: "America/Fortaleza",
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function tabela(cab: string[], linhas: (string | null | undefined)[][]): string {
  return [`| ${cab.join(" | ")} |`, `| ${cab.map(() => "---").join(" | ")} |`, ...linhas.map((l) => `| ${l.map(cel).join(" | ")} |`)].join("\n");
}

function funilMd(f: EtapaFunil[]) {
  return tabela(["Etapa", "Sessões", "%"], f.map((e) => [e.etapa, num(e.total), pct(e.pct)]));
}

export function relatorioMarkdown(d: DadosRelatorio, limiteLeads = 50): string {
  const r = d.resumo;
  const linhasCamp: string[][] = [];
  for (const c of d.campanhas) {
    const nome = c.campanha ?? SEM_UTM_LABEL;
    const linha = (rot: string, x: LinhaCampanha) => [
      rot,
      num(x.visitas),
      num(x.pageviews),
      num(x.plays),
      num(x.leads),
      num(x.checkouts),
      num(x.compras),
      brl(x.receitaCentavos),
      brl(x.investimentoCentavos),
      brl(x.cplCentavos),
      brl(x.cpvCentavos),
      pct(x.taxaVisitaLead),
      pct(x.taxaLeadCompra),
      x.roas === null ? "—" : x.roas.toLocaleString("pt-BR"),
    ];
    linhasCamp.push(linha(`**${nome}**`, c));
    for (const k of c.criativos) linhasCamp.push(linha(`↳ ${k.criativo ?? "(sem criativo)"}`, k));
  }

  const leads = d.leads.slice(0, limiteLeads).map(mascararLead);

  return [
    `# Arsenal Med — relatório de campanhas`,
    ``,
    `Período: ${d.periodo.desde} a ${d.periodo.ate} (America/Fortaleza) · gerado em ${dataHora(d.geradoEm)}`,
    ``,
    `## Resumo do período`,
    ``,
    tabela(
      ["Leads", "Compras", "Receita", "Investimento", "Custo por lead", "ROAS"],
      [[num(r.leads), num(r.compras), brl(r.receitaCentavos), brl(r.investimentoCentavos), brl(r.cplCentavos), r.roas === null ? "—" : r.roas.toLocaleString("pt-BR")]],
    ),
    ``,
    `## Campanhas (último toque)`,
    ``,
    tabela(
      ["Campanha / criativo", "Visitas", "Visualizações", "Plays VSL", "Leads", "Checkouts", "Compras", "Receita", "Investimento", "Custo/lead", "Custo/venda", "Visita→lead", "Lead→compra", "ROAS"],
      linhasCamp,
    ),
    ``,
    `## Funil da página de vendas`,
    ``,
    funilMd(d.funilVendas),
    ``,
    `## Funil da página /compacto`,
    ``,
    funilMd(d.funilCompacto),
    ``,
    `## Sequência de e-mails`,
    ``,
    tabela(
      ["Etapa", "Enviados", "Cliques", "Compras atribuídas", "Descadastros"],
      d.sequencia.map((s) => [s.etapa, num(s.enviados), num(s.cliques), num(s.comprasAtribuidas), num(s.descadastros)]),
    ),
    ``,
    `## ${leads.length} leads mais recentes`,
    ``,
    tabela(
      ["Cadastro", "Nome", "E-mail", "Perfil", "Campanha", "Criativo", "Dispositivo", "Formulário", "VSL máx.", "Clicou comprar", "Checkout", "Comprou", "Etapa", "Descadastrado"],
      leads.map((l) => [
        dataHora(l.criadoEm),
        l.nome,
        l.email,
        l.perfil,
        l.campanha ?? SEM_UTM_LABEL,
        l.criativo,
        l.dispositivo,
        l.formulario,
        l.vslMax === null ? "—" : `${l.vslMax}%`,
        l.clicouComprar ? "sim" : "não",
        l.iniciouCheckout ? "sim" : "não",
        l.compra ? `${brl(l.compra.valorCentavos)} em ${dataHora(l.compra.em)}` : "não",
        l.etapa,
        l.descadastradoEm ? "sim" : "não",
      ]),
    ),
    ``,
  ].join("\n");
}
