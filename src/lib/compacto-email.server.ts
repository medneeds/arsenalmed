// Envio do e-mail do Arsenal Compacto: link assinado do PDF + oferta do 3.0.
import { sendTemplateEmail } from "@/lib/email-templates/send-email";

const SALES_URL = "https://www.arsenalmed.com.br";

export async function sendCompactoEmail(
  nome: string,
  email: string,
  downloadUrl: string | null,
): Promise<void> {
  if (!downloadUrl) {
    console.error(`[compacto-email] sem URL assinada para ${email}; e-mail não enviado.`);
    return;
  }
  try {
    await sendTemplateEmail("compacto", email, {
      templateData: { nome, downloadUrl, salesUrl: SALES_URL },
      idempotencyKey: `compacto-${email}`,
    });
  } catch (e) {
    // Falha no envio não derruba o cadastro — o link aparece no modal.
    console.error("[compacto-email] falha ao enviar:", e);
  }
}
