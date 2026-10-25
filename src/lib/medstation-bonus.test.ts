import { describe, expect, it } from "vitest";
import { isBonusReference, novoPrazoRenovacao, parseBonusEligibility } from "./medstation-bonus";
import { isValidCpf } from "./cpf";

const NOW = new Date("2026-10-25T12:00:00Z").getTime();

describe("referência do bônus MedStation", () => {
  it("aceita cs_live_, cs_test_ e sub_", () => {
    expect(isBonusReference("cs_live_a1B2c3D4e5F6")).toBe(true);
    expect(isBonusReference("cs_test_a1B2c3D4e5F6")).toBe(true);
    expect(isBonusReference("sub_1PqRsTuVwXyZ")).toBe(true);
  });

  it("recusa outros formatos", () => {
    expect(isBonusReference("pi_1PqRsTuVwXyZ")).toBe(false);
    expect(isBonusReference("cs_live_")).toBe(false);
    expect(isBonusReference("medstation:cs_live_a1B2c3D4e5F6")).toBe(false);
    expect(isBonusReference(123)).toBe(false);
  });
});

describe("resposta da MedStation", () => {
  it("só grava com eligible: true, e-mail e prazo futuro", () => {
    expect(
      parseBonusEligibility(
        { eligible: true, email: " Cliente@Exemplo.com ", access_until: "2027-10-25T12:00:00Z" },
        NOW,
      ),
    ).toEqual({ email: "cliente@exemplo.com", accessUntil: "2027-10-25T12:00:00.000Z" });
  });

  it("recusa eligible: false ou prazo vencido", () => {
    expect(parseBonusEligibility({ eligible: false }, NOW)).toBeNull();
    expect(
      parseBonusEligibility({ eligible: true, email: "a@b.com", access_until: "2026-01-01T00:00:00Z" }, NOW),
    ).toBeNull();
  });
});

describe("renovação do bônus", () => {
  it("estende quando o novo prazo é maior", () => {
    expect(novoPrazoRenovacao("2027-10-25T12:00:00Z", "2028-10-25T12:00:00Z")).toBe(
      "2028-10-25T12:00:00.000Z",
    );
  });

  it("nunca encurta o prazo", () => {
    expect(novoPrazoRenovacao("2028-10-25T12:00:00Z", "2027-10-25T12:00:00Z")).toBeNull();
  });
});

describe("CPF na criação de acesso", () => {
  it("aceita CPF com dígitos verificadores corretos", () => {
    expect(isValidCpf("529.982.247-25")).toBe(true);
  });

  it("recusa dígito verificador errado, menos de 11 dígitos e repetidos", () => {
    expect(isValidCpf("529.982.247-26")).toBe(false);
    expect(isValidCpf("5299822472")).toBe(false);
    expect(isValidCpf("111.111.111-11")).toBe(false);
  });
});
