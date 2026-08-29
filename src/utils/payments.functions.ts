import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { type StripeEnv, createStripeClient, getStripeErrorMessage } from "@/lib/stripe.server";

type CheckoutSessionResult =
  | { clientSecret: string }
  | { error: string };

export const createCheckoutSession = createServerFn({ method: "POST" })
  .inputValidator((data: { customerEmail?: string; returnUrl: string; environment: StripeEnv }) =>
    z
      .object({
        customerEmail: z.string().email().optional().or(z.literal("").transform(() => undefined)),
        returnUrl: z.string().url(),
        environment: z.enum(["sandbox", "live"]),
      })
      .parse(data),
  )
  .handler(async ({ data }): Promise<CheckoutSessionResult> => {
    // O produto e o valor são fixos no servidor. Nada de preço vindo do cliente.
    const PRICE_ID = "arsenal_med_3_onetime";
    try {
      const stripe = createStripeClient(data.environment);

      const prices = await stripe.prices.list({ lookup_keys: [PRICE_ID] });
      const stripePrice = prices.data[0];
      if (!stripePrice) throw new Error("Price not found");

      const productId =
        typeof stripePrice.product === "string" ? stripePrice.product : stripePrice.product.id;
      const product = await stripe.products.retrieve(productId);

      const base = {
        line_items: [{ price: stripePrice.id, quantity: 1 }],
        mode: "payment" as const,
        ui_mode: "embedded_page" as const,
        return_url: data.returnUrl,
        payment_intent_data: { description: product.name },
        ...(data.customerEmail && { customer_email: data.customerEmail }),
      };

      // Pix exige conta com Pix habilitado; automatic_tax exige endereço fiscal.
      // Tenta o máximo de recursos e recua com segurança se a conta ainda não suporta.
      let session;
      try {
        session = await stripe.checkout.sessions.create({
          ...base,
          payment_method_types: ["card", "pix"],
          automatic_tax: { enabled: true },
        });
      } catch (firstError) {
        console.warn("checkout retry without pix:", getStripeErrorMessage(firstError));
        try {
          session = await stripe.checkout.sessions.create({
            ...base,
            payment_method_types: ["card"],
            automatic_tax: { enabled: true },
          });
        } catch (secondError) {
          console.warn("checkout retry without automatic_tax:", getStripeErrorMessage(secondError));
          session = await stripe.checkout.sessions.create({
            ...base,
            payment_method_types: ["card"],
          });
        }
      }

      return { clientSecret: session.client_secret ?? "" };
    } catch (error) {
      return { error: getStripeErrorMessage(error) };
    }
  });

type ConfirmResult =
  | { status: "pago"; token: string }
  | { status: "pendente" }
  | { status: "erro"; message: string };

export const confirmPurchase = createServerFn({ method: "POST" })
  .inputValidator((data: { sessionId: string; environment: StripeEnv }) => {
    if (!/^cs_(test|live)_[a-zA-Z0-9]+$/.test(data.sessionId)) throw new Error("Invalid sessionId");
    if (data.environment !== "sandbox" && data.environment !== "live") throw new Error("Invalid environment");
    return data;
  })
  .handler(async ({ data }): Promise<ConfirmResult> => {
    try {
      const stripe = createStripeClient(data.environment);
      const session = await stripe.checkout.sessions.retrieve(data.sessionId);

      const paid = session.payment_status === "paid" || session.payment_status === "no_payment_required";
      if (!paid) return { status: "pendente" };

      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: compra } = await supabaseAdmin
        .from("compras")
        .select("token_download")
        .eq("stripe_session_id", data.sessionId)
        .maybeSingle();

      if (compra?.token_download) return { status: "pago", token: compra.token_download };
      // Pagamento confirmado, mas o webhook ainda não gravou a compra.
      return { status: "pendente" };
    } catch (error) {
      return { status: "erro", message: getStripeErrorMessage(error) };
    }
  });
