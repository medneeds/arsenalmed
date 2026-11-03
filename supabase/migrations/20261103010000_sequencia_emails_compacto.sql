-- Sequência de e-mails para quem baixou o Arsenal Compacto (D+1, D+3, D+5, D+7).
-- 1) descadastro por lead; 2) registro de envios (uma linha por lead e etapa,
-- impede envio duplicado); 3) agendamento de hora em hora da rota que envia.

ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS descadastrado_em timestamptz;

CREATE TABLE IF NOT EXISTS public.lead_emails (
  email text NOT NULL,
  etapa text NOT NULL,
  enviado_em timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (email, etapa)
);
GRANT ALL ON public.lead_emails TO service_role;
ALTER TABLE public.lead_emails ENABLE ROW LEVEL SECURITY;

-- A rota é idempotente (só envia a etapa vencida que ainda não consta em
-- lead_emails), então chamá-la a mais não causa envio repetido.
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

SELECT cron.unschedule('arsenal-sequencia-compacto')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'arsenal-sequencia-compacto');

SELECT cron.schedule(
  'arsenal-sequencia-compacto',
  '7 * * * *',
  $$ SELECT net.http_post(
       url := 'https://arsenalmed.com.br/api/public/sequencia-compacto',
       headers := '{"Content-Type": "application/json"}'::jsonb,
       body := '{}'::jsonb
     ); $$
);
