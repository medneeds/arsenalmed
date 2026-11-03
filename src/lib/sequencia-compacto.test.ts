import { describe, expect, it } from "vitest";
import { etapaDevida, janelaDeBusca } from "./sequencia-compacto";

const agora = new Date("2026-11-10T12:00:00Z");
const criadoHa = (dias: number) => new Date(agora.getTime() - dias * 86400000).toISOString();
const lead = (dias: number, extra = {}) => ({ email: "a@b.com", criado_em: criadoHa(dias), ...extra });

describe("etapaDevida", () => {
  it("não envia antes de 1 dia", () => {
    expect(etapaDevida(lead(0.5), new Set(), false, agora)).toBeNull();
  });
  it("envia D+1 no dia 1", () => {
    expect(etapaDevida(lead(1.1), new Set(), false, agora)?.etapa).toBe("d1");
  });
  it("não repete etapa enviada", () => {
    expect(etapaDevida(lead(1.5), new Set(["d1"]), false, agora)).toBeNull();
  });
  it("envia D+3 depois do D+1", () => {
    expect(etapaDevida(lead(3.2), new Set(["d1"]), false, agora)?.etapa).toBe("d3");
  });
  it("pula etapa atrasada demais e manda a mais recente", () => {
    expect(etapaDevida(lead(5.5), new Set(), false, agora)?.etapa).toBe("d5");
  });
  it("nunca volta para etapa anterior à última enviada", () => {
    expect(etapaDevida(lead(5.5), new Set(["d7"]), false, agora)).toBeNull();
  });
  it("encerra depois do D+7 e da tolerância", () => {
    expect(etapaDevida(lead(9.5), new Set(["d1", "d3", "d5"]), false, agora)).toBeNull();
  });
  it("respeita descadastro e compra", () => {
    expect(etapaDevida(lead(1.1, { descadastrado_em: agora.toISOString() }), new Set(), false, agora)).toBeNull();
    expect(etapaDevida(lead(1.1), new Set(), true, agora)).toBeNull();
  });
});

describe("janelaDeBusca", () => {
  it("cobre de 9 dias até 1 dia atrás", () => {
    const j = janelaDeBusca(agora);
    expect(j.desde).toBe(criadoHa(9));
    expect(j.ate).toBe(criadoHa(1));
  });
});
