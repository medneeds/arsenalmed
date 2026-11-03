// Regras puras de origem da visita (primeiro e último toque). Sem acesso a
// window/localStorage — testadas em atribuicao.test.ts. A gravação no
// navegador fica em visita.ts.

export const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;
export type UtmKey = (typeof UTM_KEYS)[number];

export const VALIDADE_DIAS = 30;
const DIA_MS = 24 * 60 * 60 * 1000;

export type Toque = Record<UtmKey, string | null> & {
  referrer: string | null; // só o host
  pagina_entrada: string;
  fbclid: boolean;
  em: string; // ISO
};

export type Toques = { primeiro: Toque | null; ultimo: Toque | null };

export type Dispositivo = "mobile" | "tablet" | "desktop";

/** Valor de UTM limpo: sem espaços nas pontas, até 100 caracteres, vazio vira null. */
export function limparUtm(v: string | null | undefined): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim().slice(0, 100);
  return t ? t : null;
}

export function hostDoReferrer(referrer: string, hostAtual: string): string | null {
  if (!referrer) return null;
  try {
    const h = new URL(referrer).hostname.replace(/^www\./, "");
    const atual = hostAtual.replace(/^www\./, "");
    return h && h !== atual ? h.slice(0, 120) : null;
  } catch {
    return null;
  }
}

export function toqueDaUrl(url: string, referrer: string, agora: Date): Toque {
  const u = new URL(url);
  const p = u.searchParams;
  const toque = {
    referrer: hostDoReferrer(referrer, u.hostname),
    pagina_entrada: u.pathname.slice(0, 200) || "/",
    fbclid: p.has("fbclid"),
    em: agora.toISOString(),
  } as Toque;
  for (const k of UTM_KEYS) toque[k] = limparUtm(p.get(k));
  return toque;
}

export function temUtm(t: Pick<Toque, UtmKey> | null | undefined): boolean {
  return !!t && UTM_KEYS.some((k) => !!t[k]);
}

function valido(t: Toque | null | undefined, agora: Date): Toque | null {
  if (!t) return null;
  const idade = agora.getTime() - new Date(t.em).getTime();
  return Number.isFinite(idade) && idade <= VALIDADE_DIAS * DIA_MS ? t : null;
}

/**
 * Primeiro toque: nunca é sobrescrito enquanto válido (30 dias).
 * Último toque: substituído quando a URL traz UTM; sem UTM, mantém o anterior
 * (ou usa a visita atual se não houver nenhum válido).
 */
export function atualizarToques(estado: Toques | null, novo: Toque, agora: Date): Toques {
  const primeiro = valido(estado?.primeiro, agora);
  const ultimo = valido(estado?.ultimo, agora);
  return {
    primeiro: primeiro ?? novo,
    ultimo: temUtm(novo) || !ultimo ? novo : ultimo,
  };
}

export function detectarDispositivo(ua: string, larguraTela?: number): Dispositivo {
  if (/iPad|Tablet|PlayBook|Silk|Kindle/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua))) return "tablet";
  if (/Mobi|iPhone|iPod|Android|Windows Phone/i.test(ua)) return "mobile";
  // iPadOS se apresenta como Mac; telas de toque estreitas viram tablet.
  if (typeof larguraTela === "number" && larguraTela > 0 && larguraTela < 768) return "mobile";
  return "desktop";
}

export type OrigemFormulario = "pagina_compacto" | "hero" | "modal";

export function origemFormulario(origem: string | undefined): OrigemFormulario {
  if (origem === "pagina_compacto") return "pagina_compacto";
  if (origem === "hero") return "hero";
  return "modal";
}

/** Versão compacta do toque para gravar (jsonb) ou mandar ao Stripe. */
export function resumoToque(t: Toque | null): Record<string, string | boolean> | null {
  if (!t) return null;
  const out: Record<string, string | boolean> = { em: t.em, pagina_entrada: t.pagina_entrada };
  for (const k of UTM_KEYS) if (t[k]) out[k] = t[k]!;
  if (t.referrer) out["referrer"] = t.referrer;
  if (t.fbclid) out["fbclid"] = true;
  return out;
}
