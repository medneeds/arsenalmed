import { createServerFn } from "@tanstack/react-start";
import { eventoSchema, JANELA_LIMITE_MS, LIMITE_EVENTOS_JANELA, type EventoEntrada } from "@/lib/eventos";

// Grava um evento anônimo do funil. Público por natureza (qualquer visitante),
// por isso: lista fixa de eventos, props pequenas, sem dados pessoais e um
// limite por session_id. A tabela só é acessível pelo service_role.
export const registrarEvento = createServerFn({ method: "POST" })
  .inputValidator((input: EventoEntrada) => eventoSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const desde = new Date(Date.now() - JANELA_LIMITE_MS).toISOString();
    const { count, error: countError } = await supabaseAdmin
      .from("eventos_funil")
      .select("id", { count: "exact", head: true })
      .eq("session_id", data.session_id)
      .gte("criado_em", desde);
    if (countError) {
      console.error("[eventos] falha ao checar limite:", countError.message);
      return { ok: false as const };
    }
    if ((count ?? 0) >= LIMITE_EVENTOS_JANELA) return { ok: false as const, limitado: true };

    const { error } = await supabaseAdmin.from("eventos_funil").insert({
      session_id: data.session_id,
      evento: data.evento,
      pagina: data.pagina,
      props: data.props,
      utm_source: data.utm_source,
      utm_medium: data.utm_medium,
      utm_campaign: data.utm_campaign,
      utm_content: data.utm_content,
      dispositivo: data.dispositivo,
    });
    if (error) {
      console.error("[eventos] falha ao gravar:", error.message);
      return { ok: false as const };
    }
    return { ok: true as const };
  });
