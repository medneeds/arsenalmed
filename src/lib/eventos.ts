// Lista fixa de eventos do funil e validação das propriedades. Puro.
import { z } from "zod";

export const EVENTOS = [
  "page_view",
  "view_landing",
  "vsl_play",
  "vsl_progress",
  "explore_product",
  "click_buy",
  "open_compacto",
  "submit_compacto",
  "checkout_started",
  "payment_return",
  "payment_confirmed",
  "download_manual",
  "download_catalogo",
  "click_buyer_area",
] as const;

export type EventoFunil = (typeof EVENTOS)[number];

/** Limite simples por navegador: eventos aceitos numa janela de 10 minutos. */
export const LIMITE_EVENTOS_JANELA = 300;
export const JANELA_LIMITE_MS = 10 * 60 * 1000;

const PII = /(email|mail|cpf|nome|name|token|phone|telefone|senha|password)/i;

const props = z
  .record(z.union([z.string().max(64), z.number().finite(), z.boolean()]))
  .optional()
  .transform((o) => {
    const out: Record<string, string | number | boolean> = {};
    if (!o) return out;
    for (const [k, v] of Object.entries(o).slice(0, 8)) {
      if (!/^[a-z_]{1,32}$/.test(k) || PII.test(k)) continue;
      if (typeof v === "string" && v.includes("@")) continue;
      out[k] = v;
    }
    return out;
  });

const utm = z.string().max(200).nullable().optional().transform((v) => (v ? v.trim().slice(0, 100) || null : null));

export const eventoSchema = z.object({
  evento: z.enum(EVENTOS),
  session_id: z.string().uuid(),
  pagina: z
    .string()
    .max(300)
    .transform((v) => (v.startsWith("/") ? v.slice(0, 200) : "/"))
    .nullable()
    .optional()
    .transform((v) => v ?? null),
  props,
  utm_source: utm,
  utm_medium: utm,
  utm_campaign: utm,
  utm_content: utm,
  dispositivo: z.enum(["mobile", "tablet", "desktop"]).nullable().optional().transform((v) => v ?? null),
});

export type EventoEntrada = z.input<typeof eventoSchema>;
