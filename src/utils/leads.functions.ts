import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { rastreioSchema, type RastreioInput } from "@/lib/rastreio";

export const CONSENT_TEXT =
  "Autorizo o envio do material e de comunicações sobre o Arsenal Med. Posso cancelar a qualquer momento.";

const PERFIS = ["Estudante de medicina", "Interno", "Residente", "Médico(a)", "Outro"] as const;

type LeadResult =
  | { ok: true; url: string | null; email: "enviado" | "suprimido" | "sem_link" | "falhou" }
  | { ok: false; error: string };

export const registrarLead = createServerFn({ method: "POST" })
  .inputValidator(
    (data: { nome: string; email: string; perfil: string; consentimento: boolean; rastreio?: RastreioInput }) =>
      z
        .object({
          nome: z.string().trim().min(2).max(120),
          email: z.string().trim().email().max(200),
          perfil: z.enum(PERFIS),
          consentimento: z.literal(true),
          // Origem da visita: nunca bloqueia o cadastro se vier inválida.
          rastreio: z
            .unknown()
            .optional()
            .transform((v) => {
              const r = rastreioSchema.safeParse(v ?? {});
              return r.success ? r.data : {};
            }),
        })
        .parse(data),
  )
  .handler(async ({ data }): Promise<LeadResult> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const email = data.email.toLowerCase();
    const r = data.rastreio;

    // Novo cadastro do mesmo e-mail: atualiza o último toque e mantém o primeiro.
    const { data: existente } = await supabaseAdmin
      .from("leads")
      .select("primeiro_utm")
      .eq("email", email)
      .maybeSingle();

    const { error } = await supabaseAdmin.from("leads").upsert(
      {
        nome: data.nome,
        email,
        perfil: data.perfil,
        origem: "arsenal-compacto",
        consentimento_em: new Date().toISOString(),
        consentimento_texto: CONSENT_TEXT,
        utm_source: r.utm_source ?? null,
        utm_medium: r.utm_medium ?? null,
        utm_campaign: r.utm_campaign ?? null,
        utm_content: r.utm_content ?? null,
        utm_term: r.utm_term ?? null,
        primeiro_utm: existente?.primeiro_utm ?? r.primeiro_utm ?? null,
        referrer: r.referrer ?? null,
        pagina_entrada: r.pagina_entrada ?? null,
        dispositivo: r.dispositivo ?? null,
        origem_formulario: r.origem_formulario ?? null,
        session_id: r.session_id ?? null,
      },
      { onConflict: "email" },
    );

    if (error) {
      console.error("falha ao registrar lead:", error);
      return { ok: false, error: "Não conseguimos registrar seu e-mail agora. Tente novamente." };
    }

    // O gratuito também sai identificado: e-mail do lead no rodapé de todas as
    // páginas. Se a personalização falhar, entregamos o arquivo original para
    // não travar a captação.
    let caminho = "arsenal-compacto.pdf";
    try {
      const { generateCompactoPdf } = await import("@/lib/pdf-personalize.server");
      caminho = await generateCompactoPdf(email);
    } catch (e) {
      console.error("[compacto] falha ao personalizar; entregando original:", e);
    }

    const { data: signed } = await supabaseAdmin.storage
      .from("downloads")
      .createSignedUrl(caminho, 60 * 60 * 24, {
        download: "ArsenalMed-Compacto-Manual-de-Plantao.pdf",
      });
    const url = signed?.signedUrl ?? null;

    const { sendCompactoEmail } = await import("@/lib/compacto-email.server");
    const status = await sendCompactoEmail(data.nome, email, url);

    return { ok: true, url, email: status };
  });
