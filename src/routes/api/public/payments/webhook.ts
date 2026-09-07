import { createFileRoute } from "@tanstack/react-router";
import { type StripeEnv, verifyWebhook } from "@/lib/stripe.server";
import { sendDeliveryEmail } from "@/lib/delivery-email.server";


type CheckoutSession = {
  id: string;
  payment_status: string;
  payment_intent?: string | { id: string } | null;
  amount_total?: number | null;
  customer_details?: { email?: string | null } | null;
  customer_email?: string | null;
  metadata?: Record<string, string> | null;
};

function sessionEmail(session: CheckoutSession): string | null {
  return session.customer_details?.email ?? session.customer_email ?? null;
}

function sessionPaymentIntent(session: CheckoutSession): string | null {
  const pi = session.payment_intent;
  if (!pi) return null;
  return typeof pi === "string" ? pi : pi.id;
}

async function fulfill(session: CheckoutSession): Promise<void> {
  const email = sessionEmail(session);
  if (!email) {
    console.error("checkout session sem e-mail do comprador:", session.id);
    return;
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
        valor_centavos: session.amount_total ?? 9990,
        status: "pago",
      },
      { onConflict: "stripe_session_id", ignoreDuplicates: true },
    )
    .select("id, token_download, arquivo_path, catalogo_path")
    .maybeSingle();

  if (error) {
    console.error("falha ao gravar compra:", error);
    throw error;
  }

  let compra = data;
  if (!compra) {
    const { data: existing, error: existingError } = await supabaseAdmin
      .from("compras")
      .select("id, token_download, arquivo_path, catalogo_path")
      .eq("stripe_session_id", session.id)
      .maybeSingle();
    if (existingError) throw existingError;
    compra = existing;
  }

  if (!compra?.id || !compra.token_download) {
    throw new Error(`Compra paga sem token/id disponível: ${session.id}`);
  }

  const { generatePersonalizedPdf } = await import("@/lib/pdf-personalize.server");

  let manualPath = compra.arquivo_path as string | null;
  let catalogPath = compra.catalogo_path as string | null;

  if (!manualPath) {
    manualPath = await generatePersonalizedPdf({
      compraId: compra.id,
      email,
      cpf,
      kind: "manual",
    });
  }

  if (!catalogPath) {
    catalogPath = await generatePersonalizedPdf({
      compraId: compra.id,
      email,
      cpf,
      kind: "catalogo",
    });
  }

  const updatePayload: Record<string, string> = {};
  if (manualPath) updatePayload["arquivo_path"] = manualPath;
  if (catalogPath) updatePayload["catalogo_path"] = catalogPath;
  if (Object.keys(updatePayload).length > 0) {
    const { error: updateError } = await supabaseAdmin
      .from("compras")
      .update(updatePayload)
      .eq("id", compra.id);
    if (updateError) console.error("falha ao salvar caminhos personalizados:", updateError);
  }

  await sendDeliveryEmail(email, compra.token_download);
}

async function handleWebhook(req: Request, env: StripeEnv) {
  const event = await verifyWebhook(req, env);

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as CheckoutSession;
      if (session.payment_status !== "unpaid") {
        await fulfill(session);
      } else {
        console.log("pagamento pendente (provável Pix):", session.id);
      }
      break;
    }
    case "checkout.session.async_payment_succeeded": {
      await fulfill(event.data.object as CheckoutSession);
      break;
    }
    case "checkout.session.async_payment_failed": {
      const session = event.data.object as CheckoutSession;
      console.log("pagamento assíncrono falhou:", session.id);
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await supabaseAdmin
        .from("compras")
        .update({ status: "falhou" })
        .eq("stripe_session_id", session.id);
      break;
    }
    default:
      console.log("Unhandled event:", event.type);
  }
}

export const Route = createFileRoute("/api/public/payments/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawEnv = new URL(request.url).searchParams.get("env");
        if (rawEnv !== "sandbox" && rawEnv !== "live") {
          console.error("Webhook received with invalid or missing env query parameter:", rawEnv);
          return Response.json({ received: true, ignored: "invalid env" });
        }
        const env: StripeEnv = rawEnv;
        try {
          await handleWebhook(request, env);
          return Response.json({ received: true });
        } catch (e) {
          console.error("Webhook error:", e);
          return new Response("Webhook error", { status: 400 });
        }
      },
    },
  },
});
