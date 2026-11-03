import { describe, expect, it } from "vitest";
import {
  custoPor,
  etapaAtual,
  funilCompacto,
  funilVendas,
  mascararEmail,
  metricasSequencia,
  primeiroNome,
  resumirSessoes,
  resumoPeriodo,
  roas,
  tabelaCampanhas,
  taxa,
  variacao,
  type CompraRow,
  type EventoRow,
  type LeadRow,
} from "./painel-metricas";

const P = { desde: "2026-11-01", ate: "2026-11-03" };

function ev(session_id: string, evento: string, criado_em: string, extra: Partial<EventoRow> = {}): EventoRow {
  return {
    session_id,
    evento,
    pagina: "/",
    props: {},
    utm_source: null,
    utm_medium: null,
    utm_campaign: null,
    utm_content: null,
    dispositivo: "mobile",
    criado_em,
    ...extra,
  };
}

function lead(email: string, criado_em: string, extra: Partial<LeadRow> = {}): LeadRow {
  return {
    email,
    nome: "Maria Souza",
    perfil: "Residente",
    criado_em,
    utm_source: null,
    utm_medium: null,
    utm_campaign: null,
    utm_content: null,
    dispositivo: "mobile",
    origem_formulario: "pagina_compacto",
    session_id: null,
    descadastrado_em: null,
    ...extra,
  };
}

function compra(email: string, criado_em: string, extra: Partial<CompraRow> = {}): CompraRow {
  return { email, valor_centavos: 9990, criado_em, status: "pago", origem: "checkout", utm_campaign: null, utm_content: null, ...extra };
}

describe("custos e ROAS", () => {
  it("R$ 20 de investimento e 4 leads dão R$ 5 por lead", () => {
    expect(custoPor(2000, 4)).toBe(500);
  });
  it("sem lead ou sem investimento, o custo fica vazio", () => {
    expect(custoPor(2000, 0)).toBeNull();
    expect(custoPor(0, 3)).toBeNull();
  });
  it("custo por venda: R$ 100 e 2 vendas dão R$ 50", () => {
    expect(custoPor(10000, 2)).toBe(5000);
  });
  it("ROAS é receita dividida pelo investimento", () => {
    expect(roas(9990, 2000)).toBe(5);
    expect(roas(9990, 0)).toBeNull();
  });
  it("taxas e variação", () => {
    expect(taxa(1, 4)).toBe(25);
    expect(taxa(1, 0)).toBeNull();
    expect(variacao(15, 10)).toBe(50);
    expect(variacao(5, 0)).toBeNull();
  });
});

describe("mascaramento", () => {
  it("mostra só a primeira letra do e-mail", () => {
    expect(mascararEmail("ana.paula@gmail.com")).toBe("a***@gmail.com");
    expect(mascararEmail("sem-arroba")).toBe("***");
  });
  it("mostra só o primeiro nome", () => {
    expect(primeiroNome("  Maria Clara Souza ")).toBe("Maria");
  });
});

describe("funis", () => {
  const eventos = [
    ev("s1", "page_view", "2026-11-02T12:00:00Z"),
    ev("s1", "vsl_play", "2026-11-02T12:01:00Z"),
    ev("s1", "vsl_progress", "2026-11-02T12:02:00Z", { props: { pct: 25 } }),
    ev("s1", "vsl_progress", "2026-11-02T12:03:00Z", { props: { pct: 50 } }),
    ev("s2", "page_view", "2026-11-02T13:00:00Z"),
    ev("s3", "page_view", "2026-11-02T14:00:00Z", { pagina: "/compacto" }),
    ev("s3", "submit_compacto", "2026-11-02T14:02:00Z", { pagina: "/compacto" }),
    ev("s4", "page_view", "2026-11-02T15:00:00Z", { pagina: "/compacto" }),
  ];
  const sessoes = resumirSessoes(eventos).values();

  it("play e 50% da VSL aparecem no funil de vendas", () => {
    const f = funilVendas(resumirSessoes(eventos).values());
    const por = Object.fromEntries(f.map((e) => [e.etapa, e]));
    expect(por["Visitou"]!.total).toBe(2);
    expect(por["Deu play na VSL"]!.total).toBe(1);
    expect(por["VSL 50%"]!.total).toBe(1);
    expect(por["VSL 50%"]!.pct).toBe(50);
    expect(por["VSL 75%"]!.total).toBe(0);
  });

  it("conversão da página /compacto = envios ÷ visitas", () => {
    const f = funilCompacto(sessoes);
    expect(f[0]!.total).toBe(2);
    expect(f[1]!.total).toBe(1);
    expect(f[1]!.pct).toBe(50);
  });
});

describe("tabela de campanhas", () => {
  const utm = { utm_source: "meta", utm_medium: "paid", utm_campaign: "captacao_compacto", utm_content: "video_33s" };
  const eventos = [
    ev("a", "page_view", "2026-11-02T12:00:00Z", { ...utm, pagina: "/compacto" }),
    ev("a", "submit_compacto", "2026-11-02T12:01:00Z", { ...utm, pagina: "/compacto" }),
    ev("b", "page_view", "2026-11-02T12:00:00Z", { ...utm, pagina: "/compacto" }),
    ev("c", "page_view", "2026-11-02T12:00:00Z"),
  ];
  const leads = [lead("x@gmail.com", "2026-11-02T12:01:00Z", { ...utm, session_id: "a" })];

  it("cadastro com UTM entra em captacao_compacto → video_33s, com custo por lead do dia", () => {
    const linhas = tabelaCampanhas({
      sessoes: resumirSessoes(eventos).values(),
      leads,
      compras: [],
      investimentos: [{ dia: "2026-11-02", utm_campaign: "captacao_compacto", valor_centavos: 2000 }],
      periodo: { desde: "2026-11-02", ate: "2026-11-02" },
    });
    const camp = linhas.find((l) => l.campanha === "captacao_compacto")!;
    expect(camp.visitas).toBe(2);
    expect(camp.leads).toBe(1);
    expect(camp.investimentoCentavos).toBe(2000);
    expect(camp.cplCentavos).toBe(2000);
    expect(camp.taxaVisitaLead).toBe(50);
    expect(camp.criativos.find((c) => c.criativo === "video_33s")!.leads).toBe(1);
    // A linha sem UTM existe e fica por último.
    expect(linhas[linhas.length - 1]!.campanha).toBeNull();
    expect(linhas[linhas.length - 1]!.visitas).toBe(1);
  });

  it("bônus MedStation não conta como compra nem receita", () => {
    const linhas = tabelaCampanhas({
      sessoes: [],
      leads: [],
      compras: [compra("b@x.com", "2026-11-02T12:00:00Z", { origem: "medstation_bonus", valor_centavos: 0 })],
      investimentos: [],
      periodo: P,
    });
    expect(linhas).toHaveLength(0);
  });

  it("investimento fora do período não entra", () => {
    const r = resumoPeriodo({
      leads: [],
      compras: [],
      investimentos: [{ dia: "2026-10-20", utm_campaign: "x", valor_centavos: 5000 }],
      periodo: P,
    });
    expect(r.investimentoCentavos).toBe(0);
  });
});

describe("sequência de e-mails", () => {
  it("etapa atual é a mais avançada enviada", () => {
    expect(etapaAtual(["d1", "d5", "d3"])).toBe("d5");
    expect(etapaAtual([])).toBeNull();
  });

  it("compra é atribuída à última etapa recebida antes dela", () => {
    const m = metricasSequencia({
      envios: [
        { email: "a@x.com", etapa: "d1", enviado_em: "2026-11-01T12:00:00Z" },
        { email: "a@x.com", etapa: "d3", enviado_em: "2026-11-02T12:00:00Z" },
      ],
      leads: [],
      compras: [compra("a@x.com", "2026-11-02T18:00:00Z")],
      eventos: [
        ev("s", "page_view", "2026-11-02T17:00:00Z", { utm_medium: "sequencia", utm_content: "d3", props: { chegada_utm: true } }),
      ],
      periodo: P,
    });
    const d3 = m.find((e) => e.etapa === "d3")!;
    expect(d3.enviados).toBe(1);
    expect(d3.cliques).toBe(1);
    expect(d3.comprasAtribuidas).toBe(1);
    expect(m.find((e) => e.etapa === "d1")!.comprasAtribuidas).toBe(0);
  });
});
