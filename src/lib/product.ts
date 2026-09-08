export const ARSENAL_PRODUCT = {
  name: "Arsenal Med 3.0",
  lookupKey: "arsenal_med_3_onetime",
  currency: "brl",
  priceCents: 9990,
  compareAtCents: 19990,
  version: "3.0",
  manualLabel: "Arsenal Med 3.0 — Manual Completo",
  catalogLabel: "Catálogo de Fármacos e Tabelas",
} as const;

export function formatBrl(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

export const ARSENAL_PRICE = formatBrl(ARSENAL_PRODUCT.priceCents);
export const ARSENAL_COMPARE_AT_PRICE = formatBrl(ARSENAL_PRODUCT.compareAtCents);
export const ARSENAL_DISCOUNT_PERCENT = Math.round(
  (1 - ARSENAL_PRODUCT.priceCents / ARSENAL_PRODUCT.compareAtCents) * 100,
);
export const ARSENAL_SAVINGS = formatBrl(
  ARSENAL_PRODUCT.compareAtCents - ARSENAL_PRODUCT.priceCents,
);
