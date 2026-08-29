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

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  // Idempotente: stripe_session_id é único; conflito = já processado.
  const { data, error } = await supabaseAdmin
    .from("compras")
    .upsert(
      {
        email,
        stripe_session_id: session.id,
        stripe_payment_intent: sessionPaymentIntent(session),
        valor_centavos: session.amount_total ?? 6990,
        status: "pago",
      },
      { onConflict: "stripe_session_id", ignoreDuplicates: true },
    )
    .select("token_download")
    .maybeSingle();

  if (error) {
    console.error("falha ao gravar compra:", error);
    throw error;
  }

  let token = data?.token_download as string | undefined;
  if (!token) {
    // Já existia (evento duplicado ou async após completed) — só busca o token.
    const { data: existing } = await supabaseAdmin
      .from("compras")
      .select("token_download, criado_em")
      .eq("stripe_session_id", session.id)
      .maybeSingle();
    // Se foi criado há menos de 2 min, não reenvia e-mail (já enviado).
    if (existing?.criado_em && Date.now() - new Date(existing.criado_em).getTime() < 120_000) return;
    token = existing?.token_download ?? undefined;
  }

  if (token) {
    await sendDeliveryEmail(email, token);
  }
}

async function handleWebhook(req: Request, env: StripeEnv) {
  const event = await verifyWebhook(req, env);

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as CheckoutSession;
      // Pix: completed dispara quando o pagamento é SUBMETIDO, com
      // payment_status "unpaid". Nesse caso aguarda async_payment_succeeded.
      if (session.payment_status !== "unpaid") {
        await fulfill(session);
      } else {
        console.log("pagamento pendente (provável Pix):", session.id);
      }
      break;
    }
    case "checkout.session.async_payment_succeeded": {
      // Pix liquidado — entrega agora.
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
