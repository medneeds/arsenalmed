ALTER TABLE public.compras
  ADD COLUMN IF NOT EXISTS produto text NOT NULL DEFAULT 'arsenal_med_3';

DELETE FROM public.compras WHERE valor_centavos <> 9990;

ALTER TABLE public.compras
  DROP CONSTRAINT IF EXISTS compras_produto_arsenal_chk;
ALTER TABLE public.compras
  ADD CONSTRAINT compras_produto_arsenal_chk CHECK (produto = 'arsenal_med_3');