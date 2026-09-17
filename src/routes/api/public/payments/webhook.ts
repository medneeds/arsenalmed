import { createFileRoute } from "@tanstack/react-router";
import { type StripeEnv, verifyWebhook } from "@/lib/stripe.server";
import {
  type ArsenalCheckoutSession,
  fulfillArsenalSession,
  isArsenalSession,
} from "@/lib/fulfill.server";

function arsenal(session: ArsenalCheckoutSession): boolean {
  if (isArsenalSession(session)) return true;
  console.log("sessão ignorada (não é Arsenal Med):", session.id, session.metadata?.["product"] ?? "sem metadata");
  return false;
}

async function handleWebhook(req: Request, env: StripeEnv) {
  const event = await verifyWebhook(req, env);

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as ArsenalCheckoutSession;
      if (!arsenal(session)) break;
      if (session.payment_status !== "unpaid") {
        await fulfillArsenalSession(session);
      } else {
        console.log("pagamento pendente:", session.id);
      }
      break;
    }
    case "checkout.session.async_payment_succeeded": {
      const session = event.data.object as ArsenalCheckoutSession;
      if (!arsenal(session)) break;
      await fulfillArsenalSession(session);
      break;
    }
    case "checkout.session.async_payment_failed": {
      const session = event.data.object as ArsenalCheckoutSession;
      if (!arsenal(session)) break;
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
