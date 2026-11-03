-- Sequência de e-mails para quem baixou o Arsenal Compacto (D+1, D+3, D+5, D+7).
-- 1) descadastro por lead; 2) registro de envios (uma linha por lead e etapa,
-- impede envio duplicado). O agendamento de hora em hora (item 3 do arquivo
-- supabase/migrations/20261103010000_sequencia_emails_compacto.sql) é criado
-- pela ferramenta de agendamento HTTP gerenciada, pois a plataforma não aceita
-- cron.schedule com net.http_post em migração.

ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS descadastrado_em timestamptz;

CREATE TABLE IF NOT EXISTS public.lead_emails (
  email text NOT NULL,
  etapa text NOT NULL,
  enviado_em timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (email, etapa)
);
GRANT ALL ON public.lead_emails TO service_role;
ALTER TABLE public.lead_emails ENABLE ROW LEVEL SECURITY;

CREATE EXTENSION IF NOT EXISTS pg_net;
