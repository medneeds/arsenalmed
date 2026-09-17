import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type VolumeStatus = {
  downloadsRestantes: number;
};

export type MinhaCompra = {
  id: string;
  criadoEm: string;
  expiraEm: string;
  expirado: boolean;
  temCatalogo: boolean;
  downloadsManualRestantes: number;
  downloadsCatalogoRestantes: number;
};

const MAX_DOWNLOADS_PER_FILE = 5;

/**
 * Cria o acesso do comprador (e-mail + senha). Só funciona quando existe uma
 * compra paga do Arsenal Med com aquele e-mail. Não há cadastro aberto.
 */
export const criarAcessoComprador = createServerFn({ method: "POST" })
  .inputValidator((input: { email: string; senha: string }) => {
    const email = String(input?.email ?? "").trim().toLowerCase();
    const senha = String(input?.senha ?? "");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      throw new Error("Informe um e-mail válido.");
    }
    if (senha.length < 8) {
      throw new Error("A senha precisa ter pelo menos 8 caracteres.");
    }
    return { email, senha };
  })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: compras, error } = await supabaseAdmin
      .from("compras")
      .select("id, email, status, user_id")
      .ilike("email", data.email);

    if (error) {
      console.error("criarAcessoComprador: falha ao consultar compras", error);
      throw new Error("Não foi possível criar o acesso agora. Tente novamente em instantes.");
    }

    const pagas = (compras ?? []).filter((c) => c.status === "pago");
    if (pagas.length === 0) {
      throw new Error(
        "Não encontramos uma compra confirmada com este e-mail. Use o mesmo e-mail do pagamento ou escreva para suporte@arsenalmed.com.br.",
      );
    }

    const jaVinculado = pagas.find((c) => c.user_id);
    if (jaVinculado) {
      throw new Error(
        "Este e-mail já tem acesso criado. Entre com a sua senha ou use \"Esqueci minha senha\".",
      );
    }

    const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.senha,
      email_confirm: true,
    });

    if (createError || !created?.user) {
      const msg = createError?.message ?? "";
      if (/already been registered|already exists/i.test(msg)) {
        throw new Error(
          "Este e-mail já tem acesso criado. Entre com a sua senha ou use \"Esqueci minha senha\".",
        );
      }
      console.error("criarAcessoComprador: falha ao criar usuário", createError);
      throw new Error("Não foi possível criar o acesso agora. Tente novamente em instantes.");
    }

    const { error: linkError } = await supabaseAdmin
      .from("compras")
      .update({ user_id: created.user.id })
      .in(
        "id",
        pagas.map((c) => c.id),
      );

    if (linkError) {
      console.error("criarAcessoComprador: falha ao vincular compras", linkError);
      throw new Error("Acesso criado, mas houve falha ao vincular a compra. Escreva para suporte@arsenalmed.com.br.");
    }

    return { ok: true as const };
  });

/** Lista as compras do usuário autenticado (RLS: só as próprias). */
export const getMinhasCompras = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<MinhaCompra[]> => {
    const { data, error } = await context.supabase
      .from("compras")
      .select("id, criado_em, expira_em, status, catalogo_path, downloads_manual, downloads_catalogo")
      .eq("status", "pago")
      .order("criado_em", { ascending: false });

    if (error) {
      console.error("getMinhasCompras:", error);
      throw new Error("Não foi possível carregar suas compras.");
    }

    return (data ?? []).map((c) => ({
      id: c.id,
      criadoEm: c.criado_em,
      expiraEm: c.expira_em,
      expirado: new Date(c.expira_em).getTime() < Date.now(),
      temCatalogo: Boolean(c.catalogo_path),
      downloadsManualRestantes: Math.max(0, MAX_DOWNLOADS_PER_FILE - Number(c.downloads_manual ?? 0)),
      downloadsCatalogoRestantes: Math.max(0, MAX_DOWNLOADS_PER_FILE - Number(c.downloads_catalogo ?? 0)),
    }));
  });
