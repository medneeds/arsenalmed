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

function AuthPage() {
  const navigate = useNavigate();
  const modo = "entrar" as const;
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErro(null);
    setAviso(null);
    setCarregando(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: senha,
      });
      if (error) throw error;
      await navigate({ to: "/admin", replace: true });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Não foi possível entrar.";
      setErro(/invalid login/i.test(msg) ? "E-mail ou senha incorretos." : msg);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-musgo-900 px-4 py-16">
      <div className="w-full max-w-[400px] border-2 border-musgo-700 bg-musgo-800 p-6 md:p-8">
        <p className="label text-ocre">ÁREA RESTRITA</p>
        <h1 className="mt-3 text-2xl text-papel">Painel Arsenal Med</h1>
        <p className="mt-2 text-sm text-musgo-300">
          {modo === "entrar"
            ? "Entre com o e-mail e a senha do administrador."
            : "Crie a conta do administrador."}
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
          <div>
            <label htmlFor="senha" className="label block text-musgo-150">
              Senha
            </label>
            <input
              id="senha"
              type="password"
              required
              minLength={8}
              autoComplete={modo === "criar" ? "new-password" : "current-password"}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="mt-2 h-12 w-full rounded-[2px] border-2 border-musgo-600 bg-musgo-900 px-3 font-mono text-sm text-papel outline-none focus-visible:border-ocre"
            />
          </div>

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
            {carregando ? "Aguarde…" : modo === "entrar" ? "Entrar" : "Criar conta"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setModo(modo === "entrar" ? "criar" : "entrar");
            setErro(null);
            setAviso(null);
          }}
          className="mt-5 text-sm text-musgo-300 underline underline-offset-4 hover:text-papel"
        >
          {modo === "entrar" ? "Ainda não tenho conta" : "Já tenho conta"}
        </button>
      </div>
    </main>
  );
}
