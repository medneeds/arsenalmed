// Pixel da Meta (Facebook/Instagram Ads) — mede visitas, cadastros e compras
// vindos dos anúncios. Mesma regra do analytics.ts: nunca envie e-mail, CPF,
// nome ou token. Só o nome do evento e valores do produto.
import { ARSENAL_PRODUCT } from "@/lib/product";

// Pixel compartilhado com o MedStation: mesma persona, públicos somados.
export const META_PIXEL_ID = "1120398934987866";

type Fbq = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue?: unknown[];
  push?: unknown;
  loaded?: boolean;
  version?: string;
};

declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
  }
}

const PRODUCT_PARAMS = {
  content_name: ARSENAL_PRODUCT.name,
  content_type: "product",
  content_ids: [ARSENAL_PRODUCT.lookupKey],
  currency: "BRL",
  value: ARSENAL_PRODUCT.priceCents / 100,
};

/** Carrega o fbevents.js uma única vez (snippet oficial da Meta, sem dependências). */
export function initMetaPixel(): void {
  if (typeof window === "undefined" || window.fbq) return;
  try {
    const fbq: Fbq = function (...args: unknown[]) {
      if (fbq.callMethod) fbq.callMethod(...args);
      else fbq.queue!.push(args);
    } as Fbq;
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = "2.0";
    fbq.queue = [];
    window.fbq = fbq;
    window._fbq = fbq;
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(script);
    fbq("init", META_PIXEL_ID);
  } catch {
    // Rastreamento nunca pode quebrar a página.
  }
}

function send(event: string, params?: Record<string, unknown>, eventId?: string): void {
  if (typeof window === "undefined") return;
  // Efeitos de rotas filhas rodam antes do efeito do root: inicializa sob demanda.
  initMetaPixel();
  if (!window.fbq) return;
  try {
    if (eventId) window.fbq("track", event, params ?? {}, { eventID: eventId });
    else window.fbq("track", event, params ?? {});
  } catch {
    // idem
  }
}

export function metaPageView(): void {
  send("PageView");
}

export function metaViewContent(): void {
  send("ViewContent", PRODUCT_PARAMS);
}

export function metaLead(): void {
  send("Lead", { content_name: "Arsenal Compacto", currency: "BRL", value: 0 });
}

export function metaInitiateCheckout(): void {
  send("InitiateCheckout", { ...PRODUCT_PARAMS, num_items: 1 });
}

/**
 * Compra confirmada. O ID da sessão do Stripe vira o eventID (deduplica com a
 * API de Conversões no futuro) e a chave local impede contar de novo quando a
 * página de obrigado é recarregada.
 */
export function metaPurchase(stripeSessionId: string): void {
  const key = `arsenal_meta_purchase_${stripeSessionId}`;
  try {
    if (window.localStorage.getItem(key)) return;
    window.localStorage.setItem(key, "1");
  } catch {
    // Sem storage: segue e envia (o eventID ainda permite deduplicar na Meta).
  }
  send("Purchase", { ...PRODUCT_PARAMS, num_items: 1 }, stripeSessionId);
}
