/** Regras de orientação de senha exibidas ao comprador. */

export const SENHA_MINIMO = 8;
export const SENHA_RECOMENDADO = 12;

export type AvaliacaoSenha = {
  /** Atinge o tamanho recomendado (12+). */
  tamanho: boolean;
  /** Tem ao menos uma letra e um número. */
  letrasENumeros: boolean;
  /** Tem ao menos um símbolo (qualquer caractere que não seja letra, número ou espaço). */
  simbolo: boolean;
  /** Atinge o mínimo aceito pelo site (8). */
  minimo: boolean;
};

export function avaliarSenha(senha: string): AvaliacaoSenha {
  const s = senha ?? "";
  return {
    tamanho: s.length >= SENHA_RECOMENDADO,
    letrasENumeros: /\p{L}/u.test(s) && /\p{N}/u.test(s),
    simbolo: /[^\p{L}\p{N}\s]/u.test(s),
    minimo: s.length >= SENHA_MINIMO,
  };
}
