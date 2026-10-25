import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "../components/Header";
import { Logo } from "../components/Logo";
import { SenhaCampo } from "../components/SenhaCampo";
import { describeAuthError, isWeakPasswordError, MENSAGEM_SENHA_FRACA } from "@/lib/auth-errors";

export const Route = createFileRoute("/nova-senha")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Nova senha — Arsenal Med 3.0" },
      { name: "description", content: "Defina uma nova senha de acesso ao Arsenal Med 3.0." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Nova senha — Arsenal Med 3.0" },
      { property: "og:description", content: "Defina uma nova senha de acesso." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: NovaSenhaPage,
});

function NovaSenhaPage() {
  const navigate = useNavigate();
  const [pronto, setPronto] = useState(false);
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    let ativo = true;
    supabase.auth.getSession().then(({ data }) => {
      if (ativo) setPronto(Boolean(data.session));
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) setPronto(true);
    });
    return () => {
      ativo = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErro(null);
    setCarregando(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: senha });
      if (error) {
        if (isWeakPasswordError(error)) throw new Error(MENSAGEM_SENHA_FRACA);
        console.error("nova-senha: falha ao alterar senha", describeAuthError(error));
        throw new Error("Não foi possível alterar a senha agora. Tente novamente em instantes.");
      }
      await navigate({ to: "/minha-conta", replace: true });
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível alterar a senha.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="min-h-screen bg-papel text-tinta">
      <Header />
      <main className="mx-auto max-w-[480px] px-4 pb-20 pt-24 md:px-6">
        <div className="border border-musgo-300 p-5 md:p-8">
          <div className="flex justify-center">
            <Logo size={52} />
          </div>
          <h1 className="mt-6 text-center font-heading text-xl font-bold uppercase tracking-wide sm:text-2xl">
            Definir nova senha
          </h1>

          {!pronto ? (
            <p className="mt-4 text-center text-sm text-musgo-600">
              Abra esta página pelo link enviado ao seu e-mail. Se já abriu, aguarde um instante.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <SenhaCampo
                id="senha"
                label="Nova senha"
                value={senha}
                onChange={setSenha}
                autoComplete="new-password"
                orientar
              />
              {erro ? (
                <p role="alert" className="border border-alerta/40 bg-alerta/5 p-3 text-sm text-alerta">
                  {erro}
                </p>
              ) : null}
              <button
                type="submit"
                disabled={carregando}
                className="h-12 w-full rounded-[2px] bg-ocre font-heading text-sm font-bold uppercase tracking-[0.12em] text-musgo-900 disabled:opacity-60"
              >
                {carregando ? "Aguarde…" : "SALVAR SENHA"}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
