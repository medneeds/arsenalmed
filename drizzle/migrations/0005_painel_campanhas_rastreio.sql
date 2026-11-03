ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS utm_source text,
  ADD COLUMN IF NOT EXISTS utm_medium text,
  ADD COLUMN IF NOT EXISTS utm_campaign text,
  ADD COLUMN IF NOT EXISTS utm_content text,
  ADD COLUMN IF NOT EXISTS utm_term text,
  ADD COLUMN IF NOT EXISTS primeiro_utm jsonb,
  ADD COLUMN IF NOT EXISTS referrer text,
  ADD COLUMN IF NOT EXISTS pagina_entrada text,
  ADD COLUMN IF NOT EXISTS dispositivo text,
  ADD COLUMN IF NOT EXISTS origem_formulario text,
  ADD COLUMN IF NOT EXISTS session_id text;

CREATE INDEX IF NOT EXISTS idx_leads_session_id ON public.leads (session_id);
CREATE INDEX IF NOT EXISTS idx_leads_utm_campaign ON public.leads (utm_campaign);

ALTER TABLE public.compras
  ADD COLUMN IF NOT EXISTS utm_source text,
  ADD COLUMN IF NOT EXISTS utm_medium text,
  ADD COLUMN IF NOT EXISTS utm_campaign text,
  ADD COLUMN IF NOT EXISTS utm_content text,
  ADD COLUMN IF NOT EXISTS utm_term text,
  ADD COLUMN IF NOT EXISTS primeiro_utm jsonb,
  ADD COLUMN IF NOT EXISTS session_id text;

CREATE INDEX IF NOT EXISTS idx_compras_session_id ON public.compras (session_id);

CREATE TABLE IF NOT EXISTS public.eventos_funil (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  criado_em timestamptz NOT NULL DEFAULT now(),
  session_id text NOT NULL,
  evento text NOT NULL,
  pagina text,
  props jsonb NOT NULL DEFAULT '{}'::jsonb,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  dispositivo text
);

GRANT ALL ON public.eventos_funil TO service_role;
ALTER TABLE public.eventos_funil ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_eventos_funil_criado_em ON public.eventos_funil (criado_em);
CREATE INDEX IF NOT EXISTS idx_eventos_funil_session ON public.eventos_funil (session_id, criado_em);

COMMENT ON TABLE public.eventos_funil IS 'Anonymous funnel events (no personal data). Written and read only by service_role.';

CREATE TABLE IF NOT EXISTS public.investimento_campanhas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dia date NOT NULL,
  utm_campaign text NOT NULL,
  valor_centavos integer NOT NULL CHECK (valor_centavos >= 0),
  observacao text,
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now(),
  UNIQUE (dia, utm_campaign)
);

GRANT ALL ON public.investimento_campanhas TO service_role;
ALTER TABLE public.investimento_campanhas ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.investimento_campanhas IS 'Daily ad spend per utm_campaign, entered manually by the admin. Accessed only through admin server functions (service_role).';