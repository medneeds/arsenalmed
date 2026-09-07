import { sendTemplateEmail } from "@/lib/email-templates/send-email";

const SITE_URL = "https://www.arsenalmed.com.br";

export async function sendDeliveryEmail(email: string, tokenDownload: string): Promise<void> {
  const accessUrl = `${SITE_URL}/download?token=${encodeURIComponent(tokenDownload)}`;
  try {
    await sendTemplateEmail("compra", email, {
      templateData: { accessUrl },
      idempotencyKey: `compra-${tokenDownload}`,
    });
  } catch (error) {
    // O webhook continua idempotente e a página /obrigado libera o acesso imediatamente.
    // Um novo evento da Stripe pode tentar a entrega novamente sem duplicar a compra.
    console.error("[delivery-email] falha ao enviar e-mail de entrega:", error);
  }
}
