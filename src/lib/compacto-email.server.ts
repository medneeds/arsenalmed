// Envio do e-mail do Arsenal Compacto: link assinado do PDF + oferta do 3.0.
import { sendTemplateEmail } from "@/lib/email-templates/send-email";

const SALES_URL = "https://arsenalmed.com.br";

export type CompactoEmailStatus = "enviado" | "suprimido" | "sem_link" | "falhou";

// A chave de idempotência antes era só o e-mail: quem pedia o Compacto de novo
// (ou testava com o mesmo endereço) nunca recebia o segundo envio, porque o
// serviço descartava como duplicado. Agora ela só junta cliques repetidos na
// mesma janela de 10 minutos.
function chaveDeEnvio(email: string): string {
  const janela = Math.floor(Date.now() / (10 * 60 * 1000));
  return `compacto-${email}-${janela}`;
}

export async function sendCompactoEmail(
  nome: string,
  email: string,
  downloadUrl: string | null,
): Promise<CompactoEmailStatus> {
  if (!downloadUrl) {
    console.error("[compacto-email] sem URL assinada; e-mail não enviado.");
    return "sem_link";
  }
  try {
    const r = await sendTemplateEmail("compacto", email, {
      templateData: { nome, downloadUrl, salesUrl: SALES_URL },
      idempotencyKey: chaveDeEnvio(email),
    });
    if (!r.sent) {
      console.warn("[compacto-email] destinatário suprimido pelo serviço de e-mail (bounce/descadastro anterior).");
      return "suprimido";
    }
    return "enviado";
  } catch (e) {
    // Falha no envio não derruba o cadastro — o link aparece na tela.
    const err = e as { code?: string; status?: number; message?: string };
    console.error("[compacto-email] falha ao enviar:", err?.code, err?.status, err?.message);
    return "falhou";
  }
}
