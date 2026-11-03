// Regras puras da sequência de e-mails pós-Compacto. Sem I/O — testadas em
// sequencia-compacto.test.ts.

export const ETAPAS = [
  { etapa: "d1", template: "sequencia-d1", dias: 1 },
  { etapa: "d3", template: "sequencia-d3", dias: 3 },
  { etapa: "d5", template: "sequencia-d5", dias: 5 },
  { etapa: "d7", template: "sequencia-d7", dias: 7 },
] as const;

export type Etapa = (typeof ETAPAS)[number]["etapa"];

const DIA_MS = 24 * 60 * 60 * 1000;

// Janela de tolerância: se o agendador parar por um tempo, a etapa ainda sai
// até 2 dias depois do vencimento; passado isso, é pulada (não faz sentido
// mandar o D+1 no dia 6).
export const TOLERANCIA_DIAS = 2;

export interface LeadParaSequencia {
  email: string;
  criado_em: string;
  descadastrado_em?: string | null;
}

/**
 * Devolve a etapa que deve ser enviada agora para o lead, ou null.
 * Regras: descadastrado ou comprador não recebe; só a etapa mais recente
 * vencida e ainda dentro da tolerância; nunca uma etapa já enviada; nunca uma
 * etapa anterior a outra já enviada.
 */
export function etapaDevida(
  lead: LeadParaSequencia,
  enviadas: ReadonlySet<string>,
  comprou: boolean,
  agora: Date,
): (typeof ETAPAS)[number] | null {
  if (lead.descadastrado_em || comprou) return null;
  const idadeDias = (agora.getTime() - new Date(lead.criado_em).getTime()) / DIA_MS;
  if (!Number.isFinite(idadeDias) || idadeDias < ETAPAS[0].dias) return null;

  const ultimaEnviada = ETAPAS.reduce((acc, e, i) => (enviadas.has(e.etapa) ? i : acc), -1);
  for (let i = ETAPAS.length - 1; i > ultimaEnviada; i--) {
    const e = ETAPAS[i]!;
    if (idadeDias >= e.dias && idadeDias < e.dias + TOLERANCIA_DIAS) return e;
  }
  return null;
}

/** Leads que podem ter alguma etapa vencida agora (para a consulta ao banco). */
export function janelaDeBusca(agora: Date): { desde: string; ate: string } {
  const ultima = ETAPAS[ETAPAS.length - 1]!.dias + TOLERANCIA_DIAS;
  return {
    desde: new Date(agora.getTime() - ultima * DIA_MS).toISOString(),
    ate: new Date(agora.getTime() - ETAPAS[0].dias * DIA_MS).toISOString(),
  };
}
