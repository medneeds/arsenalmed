import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const CONSENT_TEXT =
  "Autorizo o envio do material e de comunicações sobre o Arsenal Med. Posso cancelar a qualquer momento.";

const PERFIS = ["Estudante de medicina", "Interno", "Residente", "Médico(a)", "Outro"] as const;

type LeadResult = { ok: true; url: string | null } | { ok: false; error: string };

export const registrarLead = createServerFn({ method: "POST" })
  .inputValidator(
    (data: { nome: string; email: string; perfil: string; consentimento: boolean }) =>
      z
        .object({
          nome: z.string().trim().min(2).max(120),
          email: z.string().trim().email().max(200),
          perfil: z.enum(PERFIS),
          consentimento: z.literal(true),
        })
        .parse(data),
  )
  .handler(async ({ data }): Promise<LeadResult> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const email = data.email.toLowerCase();

    const { error } = await supabaseAdmin.from("leads").upsert(
      {
        nome: data.nome,
        email,
        perfil: data.perfil,
        origem: "arsenal-compacto",
        consentimento_em: new Date().toISOString(),
        consentimento_texto: CONSENT_TEXT,
      },
      { onConflict: "email" },
    );

    if (error) {
      console.error("falha ao registrar lead:", error);
      return { ok: false, error: "Não conseguimos registrar seu e-mail agora. Tente novamente." };
    }

    const { data: signed } = await supabaseAdmin.storage
      .from("downloads")
      .createSignedUrl("arsenal-compacto.pdf", 60 * 60 * 24, {
        download: "ArsenalMed-Compacto-Manual-de-Plantao.pdf",
      });
    const url = signed?.signedUrl ?? null;

    const { sendCompactoEmail } = await import("@/lib/compacto-email.server");
    await sendCompactoEmail(data.nome, email, url);

    return { ok: true, url };
  });
