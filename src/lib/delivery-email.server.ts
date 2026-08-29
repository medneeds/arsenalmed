// Envio do e-mail de entrega do manual.
// ATENÇÃO: o envio real passa a funcionar depois que o domínio de e-mail for
// configurado no Lovable Cloud e os templates forem gerados. Até lá, a compra
// continua registrada e a página /obrigado já libera o download imediato.
export async function sendDeliveryEmail(email: string, tokenDownload: string): Promise<void> {
  console.log(`[delivery-email] domínio de e-mail ainda não configurado. Compra registrada para ${email}, token ${tokenDownload}. O download imediato na página /obrigado cobre a entrega.`);
}
