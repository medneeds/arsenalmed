import { describe, expect, it } from "vitest";
import { avaliarSenha } from "./senha";

describe("avaliarSenha", () => {
  it("aceita 8 caracteres como mínimo, mas só marca o tamanho recomendado a partir de 12", () => {
    expect(avaliarSenha("abcd1234").minimo).toBe(true);
    expect(avaliarSenha("abcd1234").tamanho).toBe(false);
    expect(avaliarSenha("abcdef123456").tamanho).toBe(true);
  });

  it("abaixo de 8 caracteres não atinge o mínimo", () => {
    expect(avaliarSenha("abc1234").minimo).toBe(false);
  });

  it("exige letra e número juntos", () => {
    expect(avaliarSenha("somenteletras").letrasENumeros).toBe(false);
    expect(avaliarSenha("12345678").letrasENumeros).toBe(false);
    expect(avaliarSenha("plantão24").letrasENumeros).toBe(true);
  });

  it("reconhece símbolo e ignora espaço", () => {
    expect(avaliarSenha("plantao 24").simbolo).toBe(false);
    expect(avaliarSenha("plantao#24").simbolo).toBe(true);
  });
});
