import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { ehDia } from "@/lib/periodo";

type Ctx = { supabase: { rpc: (fn: "has_role", args: { _user_id: string; _role: "admin" }) => PromiseLike<{ data: unknown; error: unknown }> }; userId: string };

async function exigirAdmin(context: Ctx) {
  const { data, error } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
  if (error) throw new Error("Não foi possível verificar suas permissões.");
  if (!data) throw new Error("Forbidden");
}

const periodoInput = (input: { desde?: string; ate?: string } | undefined) => ({
  desde: ehDia(input?.desde) ? input!.desde : undefined,
  ate: ehDia(input?.ate) ? input!.ate : undefined,
});

export const getPainelCampanhas = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(periodoInput)
  .handler(async ({ data, context }) => {
    await exigirAdmin(context as unknown as Ctx);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { carregarPainel } = await import("@/lib/painel.server");
    return carregarPainel(supabaseAdmin, data);
  });

export const getRelatorioMarkdown = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(periodoInput)
  .handler(async ({ data, context }) => {
    await exigirAdmin(context as unknown as Ctx);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { carregarPainel } = await import("@/lib/painel.server");
    const { relatorioMarkdown } = await import("@/lib/relatorio");
    return { markdown: relatorioMarkdown(await carregarPainel(supabaseAdmin, data)) };
  });

export const getLeadTimeline = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { email: string }) => z.object({ email: z.string().trim().email().max(200) }).parse(input))
  .handler(async ({ data, context }) => {
    await exigirAdmin(context as unknown as Ctx);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { carregarTimeline } = await import("@/lib/painel.server");
    return carregarTimeline(supabaseAdmin, data.email);
  });

const investimentoSchema = z.object({
  dia: z.string().refine(ehDia, "Data inválida"),
  utm_campaign: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Informe a campanha")
    .max(100)
    .regex(/^[a-z0-9_\-.]+$/, "Use o mesmo nome do utm_campaign (letras, números, _ e -)"),
  valor_centavos: z.number().int().min(0).max(100_000_000),
  observacao: z.string().trim().max(300).optional().transform((v) => v || null),
});

export const salvarInvestimento = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: z.input<typeof investimentoSchema>) => investimentoSchema.parse(input))
  .handler(async ({ data, context }) => {
    await exigirAdmin(context as unknown as Ctx);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // Lançar de novo o mesmo dia e campanha substitui o valor.
    const { error } = await supabaseAdmin
      .from("investimento_campanhas")
      .upsert({ ...data, atualizado_em: new Date().toISOString() }, { onConflict: "dia,utm_campaign" });
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const };
  });

export const removerInvestimento = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { dia: string; utm_campaign: string }) =>
    z.object({ dia: z.string().refine(ehDia), utm_campaign: z.string().trim().min(1).max(100) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await exigirAdmin(context as unknown as Ctx);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("investimento_campanhas")
      .delete()
      .eq("dia", data.dia)
      .eq("utm_campaign", data.utm_campaign);
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const };
  });
