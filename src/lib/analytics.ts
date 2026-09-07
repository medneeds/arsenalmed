// Tracking de funil — leve, sem dependências e sem dados pessoais.
// Nunca envie e-mail, CPF, nome ou token: apenas o nome do evento e
// propriedades categóricas (ex.: origem do clique, tipo de arquivo).

export type FunnelEvent =
  | "view_landing"
  | "click_buy"
  | "open_compacto"
  | "submit_compacto"
  | "checkout_started"
  | "payment_return"
  | "payment_confirmed"
  | "download_manual"
  | "download_catalogo";

type Props = Record<string, string | number | boolean>;

const PII_KEYS = /(email|mail|cpf|nome|name|token|phone|telefone|session)/i;

function sanitize(props?: Props): Props {
  if (!props) return {};
  const out: Props = {};
  for (const [key, value] of Object.entries(props)) {
    if (PII_KEYS.test(key)) continue;
    if (typeof value === "string" && (value.includes("@") || value.length > 64)) continue;
    out[key] = value;
  }
  return out;
}

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

export function track(event: FunnelEvent, props?: Props): void {
  if (typeof window === "undefined") return;
  const payload = { event, ...sanitize(props) };
  try {
    window.dataLayer = window.dataLayer ?? [];
    window.dataLayer.push(payload);
    window.dispatchEvent(new CustomEvent("arsenal:funnel", { detail: payload }));
  } catch {
    // Analytics nunca pode quebrar a experiência de compra.
  }
}
