import { describe, expect, it } from "vitest";
import { atualizarToques, detectarDispositivo, origemFormulario, toqueDaUrl } from "./atribuicao";
import { normalizarPeriodo, periodoAnterior, resolverPeriodo, limitesUtc, diaLocal } from "./periodo";

const AGORA = new Date("2026-11-03T12:00:00Z");
const URL_ANUNCIO =
  "https://arsenalmed.com.br/compacto?utm_source=meta&utm_medium=paid&utm_campaign=captacao_compacto&utm_content=video_33s&fbclid=abc";

describe("primeiro e último toque", () => {
  it("lê UTMs, página de entrada e fbclid da URL", () => {
    const t = toqueDaUrl(URL_ANUNCIO, "https://l.instagram.com/", AGORA);
    expect(t.utm_campaign).toBe("captacao_compacto");
    expect(t.utm_content).toBe("video_33s");
    expect(t.pagina_entrada).toBe("/compacto");
    expect(t.fbclid).toBe(true);
    expect(t.referrer).toBe("l.instagram.com");
  });

  it("primeiro toque não é sobrescrito; último toque troca com UTM nova", () => {
    const a = toqueDaUrl(URL_ANUNCIO, "", AGORA);
    const depois = new Date(AGORA.getTime() + 2 * 86400000);
    const b = toqueDaUrl("https://arsenalmed.com.br/?utm_source=email&utm_medium=sequencia&utm_campaign=compacto&utm_content=d3", "", depois);
    const s = atualizarToques(atualizarToques(null, a, AGORA), b, depois);
    expect(s.primeiro!.utm_campaign).toBe("captacao_compacto");
    expect(s.ultimo!.utm_campaign).toBe("compacto");
  });

  it("visita sem UTM mantém o último toque", () => {
    const a = toqueDaUrl(URL_ANUNCIO, "", AGORA);
    const sem = toqueDaUrl("https://arsenalmed.com.br/", "", AGORA);
    const s = atualizarToques(atualizarToques(null, a, AGORA), sem, AGORA);
    expect(s.ultimo!.utm_content).toBe("video_33s");
  });

  it("toques com mais de 30 dias expiram", () => {
    const a = toqueDaUrl(URL_ANUNCIO, "", AGORA);
    const depois = new Date(AGORA.getTime() + 31 * 86400000);
    const sem = toqueDaUrl("https://arsenalmed.com.br/", "", depois);
    const s = atualizarToques(atualizarToques(null, a, AGORA), sem, depois);
    expect(s.primeiro!.utm_campaign).toBeNull();
    expect(s.ultimo!.utm_campaign).toBeNull();
  });
});

describe("dispositivo e formulário", () => {
  it("classifica celular, tablet e computador", () => {
    expect(detectarDispositivo("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) Mobile")).toBe("mobile");
    expect(detectarDispositivo("Mozilla/5.0 (iPad; CPU OS 17_0)")).toBe("tablet");
    expect(detectarDispositivo("Mozilla/5.0 (Linux; Android 14; SM-X200)")).toBe("tablet");
    expect(detectarDispositivo("Mozilla/5.0 (Windows NT 10.0; Win64; x64)", 1920)).toBe("desktop");
  });
  it("origem do formulário: página, hero ou modal", () => {
    expect(origemFormulario("pagina_compacto")).toBe("pagina_compacto");
    expect(origemFormulario("hero")).toBe("hero");
    expect(origemFormulario("secao_compacto")).toBe("modal");
  });
});

describe("períodos em America/Fortaleza", () => {
  it("o dia vira às 03:00 UTC", () => {
    expect(diaLocal("2026-11-03T02:59:00Z")).toBe("2026-11-02");
    expect(diaLocal("2026-11-03T03:00:00Z")).toBe("2026-11-03");
  });
  it("7 dias = hoje e os 6 anteriores; período anterior do mesmo tamanho", () => {
    const p = resolverPeriodo("7", AGORA);
    expect(p).toEqual({ desde: "2026-10-28", ate: "2026-11-03" });
    expect(periodoAnterior(p)).toEqual({ desde: "2026-10-21", ate: "2026-10-27" });
  });
  it("limites UTC do dia local", () => {
    expect(limitesUtc({ desde: "2026-11-03", ate: "2026-11-03" })).toEqual({
      inicio: "2026-11-03T03:00:00.000Z",
      fim: "2026-11-04T03:00:00.000Z",
    });
  });
  it("datas inválidas viram os últimos 30 dias", () => {
    expect(normalizarPeriodo({ desde: "x", ate: "2026-13-01" }, AGORA)).toEqual({ desde: "2026-10-05", ate: "2026-11-03" });
  });
});
