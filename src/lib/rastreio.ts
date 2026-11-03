// Dados de origem que acompanham cadastro e checkout. Validação compartilhada
// entre navegador e servidor. Nenhum dado pessoal aqui.
import { z } from "zod";

const utm = z
  .string()
  .max(200)
  .transform((v) => v.trim().slice(0, 100) || null)
  .nullable()
  .optional()
  .transform((v) => v ?? null);

const curto = (max: number) =>
  z
    .string()
    .max(500)
    .transform((v) => v.trim().slice(0, max) || null)
    .nullable()
    .optional()
    .transform((v) => v ?? null);

export const rastreioSchema = z
  .object({
    session_id: z.string().uuid().nullable().optional().transform((v) => v ?? null),
    utm_source: utm,
    utm_medium: utm,
    utm_campaign: utm,
    utm_content: utm,
    utm_term: utm,
    primeiro_utm: z
      .record(z.union([z.string().max(200), z.boolean()]))
      .refine((o) => Object.keys(o).length <= 12, "primeiro_utm grande demais")
      .nullable()
      .optional()
      .transform((v) => v ?? null),
    referrer: curto(120),
    pagina_entrada: curto(200),
    dispositivo: z.enum(["mobile", "tablet", "desktop"]).nullable().optional().transform((v) => v ?? null),
    origem_formulario: z
      .enum(["pagina_compacto", "hero", "modal"])
      .nullable()
      .optional()
      .transform((v) => v ?? null),
  })
  .partial();

export type RastreioInput = z.input<typeof rastreioSchema>;
export type Rastreio = z.output<typeof rastreioSchema>;

const UTM_CAMPOS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;

/** Metadata do Stripe: só texto, até 500 caracteres por valor, sem vazios. */
export function rastreioParaMetadata(r: Rastreio | null | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!r) return out;
  for (const k of UTM_CAMPOS) if (r[k]) out[k] = r[k]!;
  if (r.session_id) out["session_id"] = r.session_id;
  if (r.primeiro_utm) {
    const json = JSON.stringify(r.primeiro_utm);
    if (json.length <= 500) out["primeiro_utm"] = json;
  }
  return out;
}

/** Lê de volta o que foi gravado no metadata da sessão do Stripe. */
export function rastreioDoMetadata(meta: Record<string, string> | null | undefined) {
  const get = (k: string) => {
    const v = meta?.[k];
    return typeof v === "string" && v.trim() ? v.trim().slice(0, 100) : null;
  };
  let primeiro: Record<string, unknown> | null = null;
  try {
    const raw = meta?.["primeiro_utm"];
    if (raw) {
      const p = JSON.parse(raw);
      if (p && typeof p === "object" && !Array.isArray(p)) primeiro = p;
    }
  } catch {
    primeiro = null;
  }
  const sid = get("session_id");
  return {
    utm_source: get("utm_source"),
    utm_medium: get("utm_medium"),
    utm_campaign: get("utm_campaign"),
    utm_content: get("utm_content"),
    utm_term: get("utm_term"),
    primeiro_utm: primeiro,
    session_id: sid && /^[0-9a-f-]{36}$/i.test(sid) ? sid : null,
  };
}
