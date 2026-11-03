import { describe, expect, it } from "vitest";
import { relatorioJson, relatorioMarkdown, type DadosRelatorio } from "./relatorio";

const dados: DadosRelatorio = {
  periodo: { desde: "2026-11-01", ate: "2026-11-03" },
  geradoEm: "2026-11-03T12:00:00Z",
  resumo: { leads: 1, compras: 0, receitaCentavos: 0, investimentoCentavos: 2000, cplCentavos: 2000, roas: 0 },
  campanhas: [],
  funilVendas: [],
  funilCompacto: [],
  sequencia: [],
  leads: [
    {
      email: "joana.lima@gmail.com",
      nome: "Joana Lima Prado",
      perfil: "Interno",
      criadoEm: "2026-11-02T12:00:00Z",
      campanha: "captacao_compacto",
      criativo: "video_33s",
      fonte: "meta",
      dispositivo: "mobile",
      formulario: "pagina_compacto",
      sessionId: "3f1c2a8e-0000-4000-8000-000000000000",
      vslMax: null,
      clicouComprar: false,
      iniciouCheckout: false,
      compra: null,
      etapa: "d1",
      descadastradoEm: null,
    },
  ],
};

describe("relatório externo", () => {
  it("markdown traz e-mail mascarado e só o primeiro nome", () => {
    const md = relatorioMarkdown(dados);
    expect(md).toContain("j***@gmail.com");
    expect(md).not.toContain("joana.lima@gmail.com");
    expect(md).not.toContain("Lima Prado");
  });
  it("JSON nunca leva e-mail completo nem session_id", () => {
    const json = JSON.stringify(relatorioJson(dados));
    expect(json).toContain("j***@gmail.com");
    expect(json).not.toContain("joana.lima@gmail.com");
    expect(json).not.toContain("3f1c2a8e");
  });
});
