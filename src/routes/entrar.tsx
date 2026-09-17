import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { criarAcessoComprador } from "@/lib/conta.functions";
import { Header } from "../components/Header";
import { Logo } from "../components/Logo";

export const Route = createFileRoute("/entrar")({
  head: () => ({
    meta: [
      { title: "Acesso do comprador — Arsenal Med 3.0" },
      {
        name: "description",
        content:
          "Entre com e-mail e senha para baixar o Manual Completo e o Catálogo de Fármacos do Arsenal Med 3.0.",
      },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Acesso do comprador — Arsenal Med 3.0" },
      { property: "og:description", content: "Área de download do Arsenal Med 3.0." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: EntrarPage,
});

type Modo = "entrar" | "criar" | "recuperar";

const inputClass =
  "mt-2 h-12 w-full rounded-[2px] border-2 border-musgo-300 bg-papel px-3 font-mono text-sm text-tinta outline-none focus-visible:border-ocre";

function EntrarPage() {
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
      if (modo === "entrar") {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password: senha,
        });
        if (error) throw error;
        await navigate({ to: "/minha-conta", replace: true });
        return;
      }

      if (modo === "criar") {
        await criarAcessoComprador({ data: { email, senha } });
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password: senha,
        });
        if (error) throw error;
        await navigate({ to: "/minha-conta", replace: true });
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${window.location.origin}/nova-senha`,
      });
      if (error) throw error;
      setAviso(
        "Se existir um acesso com este e-mail, enviamos um link para criar uma nova senha. Confira a caixa de entrada e o spam.",
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Não foi possível concluir.";
      setErro(/invalid login/i.test(msg) ? "E-mail ou senha incorretos." : msg);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="min-h-screen bg-papel text-tinta">
      <Header />
      <main className="mx-auto max-w-[520px] px-4 pb-20 pt-24 md:px-6">
        <div className="border border-musgo-300 p-5 md:p-8">
          <div className="flex justify-center">
            <Logo size={52} />
          </div>
          <p className="label mt-6 text-center text-ocre">ÁREA DO COMPRADOR</p>
          <h1 className="mt-3 text-center font-heading text-xl font-bold uppercase tracking-wide sm:text-2xl">
            {modo === "criar"
              ? "Criar acesso"
              : modo === "recuperar"
                ? "Recuperar senha"
                : "Entrar para baixar"}
          </h1>
          <p className="mx-auto mt-3 max-w-[420px] text-center text-[15px] leading-relaxed text-musgo-600">
            {modo === "criar"
              ? "Use o mesmo e-mail da compra e escolha uma senha. O acesso só é criado para compras confirmadas."
              : modo === "recuperar"
                ? "Informe o e-mail do seu acesso e enviaremos um link para definir uma nova senha."
                : "Entre com e-mail e senha para acessar o Manual Completo e o Catálogo de Fármacos."}
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="label block text-musgo-600">
                E-mail da compra
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
              />
            </div>

            {modo !== "recuperar" && (
              <div>
                <label htmlFor="senha" className="label block text-musgo-600">
                  {modo === "criar" ? "Crie uma senha (mín. 8 caracteres)" : "Senha"}
                </label>
                <input
                  id="senha"
                  type="password"
                  required
                  minLength={8}
                  autoComplete={modo === "criar" ? "new-password" : "current-password"}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className={inputClass}
                />
              </div>
            )}

            {erro ? (
              <p role="alert" className="border border-alerta/40 bg-alerta/5 p-3 text-sm text-alerta">
                {erro}
              </p>
            ) : null}
            {aviso ? (
              <p role="status" className="border border-ocre/50 bg-ocre/10 p-3 text-sm text-tinta">
                {aviso}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={carregando}
              className="h-12 w-full rounded-[2px] bg-ocre font-heading text-sm font-bold uppercase tracking-[0.12em] text-musgo-900 transition-colors hover:bg-musgo-800 hover:text-papel disabled:opacity-60"
            >
              {carregando
                ? "Aguarde…"
                : modo === "criar"
                  ? "CRIAR ACESSO"
                  : modo === "recuperar"
                    ? "ENVIAR LINK"
                    : "ENTRAR"}
            </button>
          </form>

          <div className="mt-6 space-y-2 text-center text-sm text-musgo-600">
            {modo !== "criar" && (
              <p>
                Primeira vez aqui?{" "}
                <button
                  type="button"
                  onClick={() => trocarModo("criar")}
                  className="underline underline-offset-4 hover:text-tinta"
                >
                  Criar acesso com o e-mail da compra
                </button>
              </p>
            )}
            {modo !== "entrar" && (
              <p>
                Já tem senha?{" "}
                <button
                  type="button"
                  onClick={() => trocarModo("entrar")}
                  className="underline underline-offset-4 hover:text-tinta"
                >
                  Entrar
                </button>
              </p>
            )}
            {modo !== "recuperar" && (
              <p>
                <button
                  type="button"
                  onClick={() => trocarModo("recuperar")}
                  className="underline underline-offset-4 hover:text-tinta"
                >
                  Esqueci minha senha
                </button>
              </p>
            )}
            <p className="pt-2">
              Ainda não comprou?{" "}
              <Link to="/comprar" className="underline underline-offset-4 hover:text-tinta">
                Ver o pacote completo
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
