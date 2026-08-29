// Envio do e-mail com o PDF do Arsenal Compacto.
// ATENÇÃO: o envio real passa a funcionar depois que o domínio de e-mail for
// configurado no Lovable Cloud e os templates forem gerados. Até lá o cadastro
// fica registrado na tabela `leads` e o envio é apenas logado.
export async function sendCompactoEmail(nome: string, email: string): Promise<void> {
  console.log(
    `[compacto-email] domínio de e-mail ainda não configurado. Lead registrado: ${nome} <${email}>. O PDF do Arsenal Compacto será enviado assim que o domínio estiver ativo.`,
  );
}
