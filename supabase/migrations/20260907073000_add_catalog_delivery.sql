ALTER TABLE public.compras
  ADD COLUMN IF NOT EXISTS catalogo_path text;
