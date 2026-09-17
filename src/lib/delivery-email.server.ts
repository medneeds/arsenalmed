import { sendTemplateEmail } from "@/lib/email-templates/send-email";

const SITE_URL = "https://arsenalmed.com.br";

/**
 * Envia o e-mail de entrega com até 3 tentativas. Retorna true quando o envio
 * foi confirmado; false apenas depois de esgotar as tentativas — nesse caso a
 * compra continua liberada na página /obrigado e na Área do comprador, e uma
 * nova chamada (webhook repetido) tenta o envio de novo sem duplicar a compra.
 */
export async function sendDeliveryEmail(email: string, tokenDownload: string): Promise<boolean> {
  const accessUrl = `${SITE_URL}/download?token=${encodeURIComponent(tokenDownload)}`;

  for (let tentativa = 1; tentativa <= 3; tentativa++) {
    try {
      await sendTemplateEmail("compra", email, {
        templateData: { accessUrl },
        idempotencyKey: `compra-${tokenDownload}`,
      });
      return true;
    } catch (error) {
      console.error(`[delivery-email] tentativa ${tentativa} falhou:`, error);
      if (tentativa < 3) await new Promise((r) => setTimeout(r, 500 * tentativa));
    }
  }
  return false;
}
