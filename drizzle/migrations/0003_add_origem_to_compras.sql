ALTER TABLE public.compras
  ADD COLUMN IF NOT EXISTS origem text NOT NULL DEFAULT 'checkout';

COMMENT ON COLUMN public.compras.origem IS 'Origem do acesso: checkout (venda pela Stripe) ou medstation_bonus (bônus do plano anual MedStation).';

CREATE INDEX IF NOT EXISTS compras_email_lower_idx ON public.compras (lower(email));