const clientToken = import.meta.env["VITE_PAYMENTS_CLIENT_TOKEN"];

export function PaymentTestModeBanner() {
  if (!clientToken) {
    return (
      <div className="w-full border-b border-ferrugem bg-ferrugem/10 px-4 py-2 text-center text-sm text-ferrugem">
        O checkout de produção ainda não está configurado.
      </div>
    );
  }
  if (clientToken.startsWith("pk_test_")) {
    return (
      <div className="w-full border-b border-ocre bg-ocre/15 px-4 py-2 text-center font-mono text-xs uppercase tracking-widest text-tinta">
        Modo de teste — nenhum pagamento real é cobrado. Cartão de teste: 4242 4242 4242 4242.
      </div>
    );
  }
  return null;
}
