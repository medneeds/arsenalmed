import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { type StripeEnv, createStripeClient, getStripeErrorMessage } from "@/lib/stripe.server";
import { ARSENAL_PRODUCT } from "@/lib/product";

type CheckoutSessionResult =
  | { clientSecret: string }
  | { error: string };

export const createCheckoutSession = createServerFn({ method: "POST" })
  .inputValidator((data: { customerEmail?: string; cpf?: string; returnUrl: string; environment: StripeEnv }) =>
    z
      .object({
        customerEmail: z.string().email().optional().or(z.literal("").transform(() => undefined)),
        cpf: z
          .string()
          .transform((v) => v.replace(/\D/g, ""))
          .refine((v) => v.length === 11, { message: "CPF inválido" })
          .optional(),
        returnUrl: z.string().url(),
        environment: z.enum(["sandbox", "live"]),
      })
      .parse(data),
  )
  .handler(async ({ data }): Promise<CheckoutSessionResult> => {
    try {
      const stripe = createStripeClient(data.environment);
      const prices = await stripe.prices.list({ lookup_keys: [ARSENAL_PRODUCT.lookupKey], active: true, limit: 1 });
      const stripePrice = prices.data[0];
      if (!stripePrice) throw new Error("Preço do Arsenal Med não encontrado na Stripe.");

      if (
        stripePrice.unit_amount !== ARSENAL_PRODUCT.priceCents ||
        stripePrice.currency.toLowerCase() !== ARSENAL_PRODUCT.currency
      ) {
        console.error("Stripe price mismatch", {
          lookupKey: ARSENAL_PRODUCT.lookupKey,
          stripeAmount: stripePrice.unit_amount,
          expectedAmount: ARSENAL_PRODUCT.priceCents,
          stripeCurrency: stripePrice.currency,
          expectedCurrency: ARSENAL_PRODUCT.currency,
        });
        throw new Error(
          "O preço publicado e o preço configurado no pagamento estão diferentes. A compra foi bloqueada para evitar cobrança incorreta.",
        );
      }

      const productId =
        typeof stripePrice.product === "string" ? stripePrice.product : stripePrice.product.id;
      const product = await stripe.products.retrieve(productId);

      const metadata = {
        managed_payments: "false",
        product: "arsenal_med_3",
        product_version: ARSENAL_PRODUCT.version,
        ...(data.cpf ? { cpf: data.cpf } : {}),
      };

      const base = {
        line_items: [{ price: stripePrice.id, quantity: 1 }],
        mode: "payment" as const,
        ui_mode: "embedded_page" as const,
        return_url: data.returnUrl,
        payment_intent_data: { description: product.name },
        ...(data.customerEmail && { customer_email: data.customerEmail }),
      };

      let session;
      try {
        session = await stripe.checkout.sessions.create({
          ...base,
          payment_method_types: ["card", "pix"],
          metadata,
        });
      } catch (firstError) {
        console.warn("checkout retry without pix:", getStripeErrorMessage(firstError));
        session = await stripe.checkout.sessions.create({
          ...base,
          payment_method_types: ["card"],
          metadata,
        });
      }

      if (!session.client_secret) {
        throw new Error("A Stripe não retornou o código necessário para abrir o checkout.");
      }
      return { clientSecret: session.client_secret };
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
      return { status: "pendente" };
    } catch (error) {
      return { status: "erro", message: getStripeErrorMessage(error) };
    }
  });
