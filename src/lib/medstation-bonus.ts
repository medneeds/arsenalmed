/**
 * Bônus Arsenal Med do plano anual MedStation.
 *
 * A MedStation avisa este site com a referência do pagamento anual
 * (id da sessão de checkout ou da assinatura). Confirmamos a referência no
 * endereço público da MedStation antes de registrar o acesso.
 * POST { reference } -> { eligible: true, email, access_until } | { eligible: false }
 */

export const MEDSTATION_VERIFY_URL =
  "https://rwiovxyftfbkvzbepfqi.supabase.co/functions/v1/arsenal-bonus-verify";

export const MEDSTATION_BONUS_ORIGEM = "medstation_bonus";
export const MEDSTATION_SESSION_PREFIX = "medstation:";

const REFERENCE_RE = /^(cs_(live|test)_[A-Za-z0-9]{10,200}|sub_[A-Za-z0-9]{10,100})$/;

export function isBonusReference(value: unknown): value is string {
  return typeof value === "string" && REFERENCE_RE.test(value);
}

export type BonusConfirmado = { email: string; accessUntil: string };

/** Lê a resposta da MedStation. Devolve null quando não há direito ao bônus. */
export function parseBonusEligibility(body: unknown, now = Date.now()): BonusConfirmado | null {
  if (!body || typeof body !== "object") return null;
  const b = body as { eligible?: unknown; email?: unknown; access_until?: unknown };
  if (b.eligible !== true) return null;
  const email = typeof b.email === "string" ? b.email.trim().toLowerCase() : "";
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return null;
  const t = typeof b.access_until === "string" ? new Date(b.access_until).getTime() : NaN;
  if (!Number.isFinite(t) || t <= now) return null;
  return { email, accessUntil: new Date(t).toISOString() };
}

/**
 * Renovação: só estende o prazo. Devolve a nova data quando ela é posterior à
 * atual, ou null quando não há nada a mudar.
 */
export function novoPrazoRenovacao(atual: string, accessUntil: string): string | null {
  const a = new Date(atual).getTime();
  const n = new Date(accessUntil).getTime();
  if (!Number.isFinite(n)) return null;
  if (Number.isFinite(a) && n <= a) return null;
  return new Date(n).toISOString();
}
