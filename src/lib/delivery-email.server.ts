// Envio do e-mail de entrega do manual.
// Depende do domínio de e-mail configurado no Lovable Cloud. Enquanto não
// estiver configurado, registra e não quebra o fluxo de compra.
export async function sendDeliveryEmail(email: string, tokenDownload: string): Promise<void> {
  const downloadUrl = `${process.env["SITE_URL"] ?? ""}/download?token=${tokenDownload}`;
  try {
    const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
    const result = await sendTemplateEmail("entrega-manual", email, {
      templateData: { downloadUrl },
      idempotencyKey: `entrega-manual-${tokenDownload}`,
    });
    if (!result.sent) {
      console.warn("delivery email not sent:", result.reason);
    }
  } catch (error) {
    // O domínio de e-mail ainda não foi configurado ou o envio falhou.
    // A compra já está registrada e a página /obrigado libera o download.
    console.error("delivery email failed:", error);
  }
}
