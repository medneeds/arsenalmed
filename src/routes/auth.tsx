import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Acesso restrito — Arsenal Med" },
      {
        name: "description",
        content: "Área administrativa do Arsenal Med. Acesso restrito à equipe.",
      },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Acesso restrito — Arsenal Med" },
      { property: "og:description", content: "Área administrativa do Arsenal Med." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

type Modo = "entrar" | "recuperar";

function AuthPage() {
  const navigate = useNavigate();

  const [modo, setModo] = useState<Modo>("entrar");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  function trocarModo(novo: Modo) {
    setModo(novo);
    setErro(null);
    setAviso(null);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErro(null);
    setAviso(null);
    setCarregando(true);
    try {
      if (modo === "recuperar") {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
          redirectTo: `${window.location.origin}/nova-senha`,
        });
        if (error) throw error;
        setAviso(
          "Se este e-mail tiver acesso, enviamos um link para criar uma nova senha. Confira a caixa de entrada e o spam.",
        );
        return;
      }
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: senha,
      });
      if (error) throw error;
      await navigate({ to: "/admin", replace: true });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Não foi possível concluir.";
      setErro(/invalid login/i.test(msg) ? "E-mail ou senha incorretos." : msg);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-musgo-900 px-4 py-16">
      <div className="w-full max-w-[400px] border-2 border-musgo-700 bg-musgo-800 p-6 md:p-8">
        <p className="label text-ocre">ÁREA RESTRITA</p>
        <h1 className="mt-3 text-2xl text-papel">
          {modo === "recuperar" ? "Recuperar senha" : "Painel Arsenal Med"}
        </h1>
        <p className="mt-2 text-sm text-musgo-300">
          {modo === "recuperar"
            ? "Informe o e-mail do administrador. Enviaremos um link para definir uma nova senha."
            : "Entre com o e-mail e a senha do administrador."}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="label block text-musgo-150">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 h-12 w-full rounded-[2px] border-2 border-musgo-600 bg-musgo-900 px-3 font-mono text-sm text-papel outline-none focus-visible:border-ocre"
            />
          </div>
          {modo === "entrar" && (
            <div>
              <label htmlFor="senha" className="label block text-musgo-150">
                Senha
              </label>
              <input
                id="senha"
                type="password"
                required
                minLength={8}
                autoComplete="current-password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="mt-2 h-12 w-full rounded-[2px] border-2 border-musgo-600 bg-musgo-900 px-3 font-mono text-sm text-papel outline-none focus-visible:border-ocre"
              />
            </div>
          )}

          {erro ? (
            <p role="alert" className="rounded-[2px] border-2 border-alerta/60 bg-musgo-900 p-3 text-sm text-papel">
              {erro}
            </p>
          ) : null}
          {aviso ? (
            <p role="status" className="rounded-[2px] border-2 border-ocre/60 bg-musgo-900 p-3 text-sm text-papel">
              {aviso}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={carregando}
            className="h-12 w-full rounded-[2px] bg-ocre font-heading text-sm font-bold uppercase tracking-[0.12em] text-musgo-900 disabled:opacity-60"
          >
            {carregando ? "Aguarde…" : modo === "recuperar" ? "Enviar link" : "Entrar"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-musgo-300">
          <button
            type="button"
            onClick={() => trocarModo(modo === "entrar" ? "recuperar" : "entrar")}
            className="underline underline-offset-4 hover:text-papel"
          >
            {modo === "entrar" ? "Esqueci minha senha" : "Voltar para entrar"}
          </button>
        </p>
      </div>
    </main>
  );
}
