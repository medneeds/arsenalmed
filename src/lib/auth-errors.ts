/** Regras puras para interpretar erros de cadastro do serviço de autenticação. */

export const MENSAGEM_SENHA_FRACA =
  "Essa senha é muito comum ou já apareceu em vazamentos. Escolha outra, com 12 caracteres ou mais, misturando letras, números e símbolos.";

export type AuthErrorLike = {
  message?: string | null | undefined;
  code?: string | null | undefined;
  status?: number | null | undefined;
  name?: string | null | undefined;
} | null | undefined;

/** Senha recusada por ser fraca, comum ou presente em vazamentos (HIBP). */
export function isWeakPasswordError(err: AuthErrorLike): boolean {
  if (!err) return false;
  if (err.code === "weak_password" || err.name === "AuthWeakPasswordError") return true;
  return /weak|easy to guess|pwned|leaked|breach/i.test(err.message ?? "");
}

/** E-mail já cadastrado no serviço de autenticação. */
export function isAlreadyRegisteredError(err: AuthErrorLike): boolean {
  if (!err) return false;
  if (err.code === "email_exists" || err.code === "user_already_exists") return true;
  return /already been registered|already exists/i.test(err.message ?? "");
}

/** Resumo estruturado para registro em log (sem senha nem dados pessoais). */
export function describeAuthError(err: AuthErrorLike) {
  return {
    code: err?.code ?? null,
    status: err?.status ?? null,
    name: err?.name ?? null,
    message: err?.message ?? null,
  };
}
