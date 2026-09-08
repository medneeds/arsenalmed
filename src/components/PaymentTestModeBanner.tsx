// Faixa de aviso exibida somente quando o checkout de produção não está
// configurado (token ausente). Em ambientes de teste (pk_test_) e em
// produção (pk_live_) não renderizamos nada na página.
const clientToken = import.meta.env["VITE_PAYMENTS_CLIENT_TOKEN"];

export function PaymentTestModeBanner() {
  if (!clientToken) {
    return (
      <div className="w-full border-b border-ferrugem bg-ferrugem/10 px-4 py-2 text-center text-sm text-ferrugem">
        O checkout de produção ainda não está configurado.
      </div>
    );
  }
  return null;
}
