// Token de descadastro: HMAC do e-mail com um segredo do servidor. Permite um
// link "não quero mais receber" sem login e sem expor a lista de leads.
import { createHmac, timingSafeEqual } from "node:crypto";

const SITE = "https://arsenalmed.com.br";

function segredo(): string {
  const s = process.env["SUPABASE_SERVICE_ROLE_KEY"];
  if (!s) throw new Error("SUPABASE_SERVICE_ROLE_KEY ausente");
  return `arsenal-descadastro:${s}`;
}

export function tokenDescadastro(email: string): string {
  return createHmac("sha256", segredo()).update(email.trim().toLowerCase()).digest("base64url").slice(0, 32);
}

export function tokenValido(email: string, token: string): boolean {
  const esperado = Buffer.from(tokenDescadastro(email));
  const recebido = Buffer.from(token);
  return esperado.length === recebido.length && timingSafeEqual(esperado, recebido);
}

export function urlDescadastro(email: string): string {
  const e = encodeURIComponent(email.trim().toLowerCase());
  return `${SITE}/api/public/descadastrar?e=${e}&t=${tokenDescadastro(email)}`;
}
