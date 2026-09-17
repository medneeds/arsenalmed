import { sendDeliveryEmail } from "@/lib/delivery-email.server";
import { ARSENAL_PRODUCT } from "@/lib/product";

export type ArsenalCheckoutSession = {
  id: string;
  payment_status: string;
  payment_intent?: string | { id: string } | null;
  amount_total?: number | null;
  customer_details?: { email?: string | null } | null;
  customer_email?: string | null;
  metadata?: Record<string, string> | null;
};

export function isArsenalSession(session: ArsenalCheckoutSession): boolean {
  return session.metadata?.["product"] === "arsenal_med_3";
}

export function sessionEmail(session: ArsenalCheckoutSession): string | null {
  return session.customer_details?.email ?? session.customer_email ?? null;
}

function sessionPaymentIntent(session: ArsenalCheckoutSession): string | null {
  const pi = session.payment_intent;
  if (!pi) return null;
  return typeof pi === "string" ? pi : pi.id;
}

/**
 * Grava a compra do Arsenal Med, gera os PDFs personalizados e envia o e-mail
 * de entrega. Idempotente por stripe_session_id: pode ser chamada tanto pelo
 * webhook quanto pela página /obrigado sem duplicar compra ou e-mail.
 * Retorna o token de download.
 */
export async function fulfillArsenalSession(
  session: ArsenalCheckoutSession,
): Promise<string | null> {
  const email = sessionEmail(session);
  if (!email) {
    console.error("checkout session sem e-mail do comprador:", session.id);
    return null;
  }
  const cpf = session.metadata?.["cpf"] ?? null;

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data, error } = await supabaseAdmin
    .from("compras")
    .upsert(
      {
        email,
        cpf,
        stripe_session_id: session.id,
        stripe_payment_intent: sessionPaymentIntent(session),
        valor_centavos: session.amount_total ?? ARSENAL_PRODUCT.priceCents,
        produto: "arsenal_med_3",
        status: "pago",
      },
      { onConflict: "stripe_session_id", ignoreDuplicates: true },
    )
    .select("id, token_download, arquivo_path, catalogo_path, email_enviado_em")
    .maybeSingle();

  if (error) {
    console.error("falha ao gravar compra:", error);
    throw error;
  }

  let compra = data;
  let novaCompra = Boolean(data);
  if (!compra) {
    const { data: existing, error: existingError } = await supabaseAdmin
      .from("compras")
      .select("id, token_download, arquivo_path, catalogo_path, email_enviado_em")
      .eq("stripe_session_id", session.id)
      .maybeSingle();
    if (existingError) throw existingError;
    compra = existing;
    novaCompra = false;
  }

  if (!compra?.id || !compra.token_download) {
    throw new Error(`Compra paga sem token/id disponível: ${session.id}`);
  }

  const { generatePersonalizedPdf } = await import("@/lib/pdf-personalize.server");

  let manualPath = compra.arquivo_path as string | null;
  let catalogPath = compra.catalogo_path as string | null;

  if (!manualPath) {
    manualPath = await generatePersonalizedPdf({ compraId: compra.id, email, cpf, kind: "manual" });
  }
  if (!catalogPath) {
    catalogPath = await generatePersonalizedPdf({ compraId: compra.id, email, cpf, kind: "catalogo" });
  }

  const updatePayload: { arquivo_path?: string; catalogo_path?: string } = {};
  if (manualPath) updatePayload["arquivo_path"] = manualPath;
  if (catalogPath) updatePayload["catalogo_path"] = catalogPath;
  if (Object.keys(updatePayload).length > 0) {
    const { error: updateError } = await supabaseAdmin
      .from("compras")
      .update(updatePayload)
      .eq("id", compra.id);
    if (updateError) console.error("falha ao salvar caminhos personalizados:", updateError);
  }

  const jaEnviado = Boolean((compra as { email_enviado_em?: string | null }).email_enviado_em);
  if (novaCompra || !jaEnviado) {
    await sendDeliveryEmail(email, compra.token_download);
    const { error: marcaError } = await supabaseAdmin
      .from("compras")
      .update({ email_enviado_em: new Date().toISOString() })
      .eq("id", compra.id);
    if (marcaError) console.error("falha ao marcar e-mail enviado:", marcaError);
  }

  return compra.token_download;
}
