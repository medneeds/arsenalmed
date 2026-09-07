ALTER TABLE public.compras
  ADD COLUMN IF NOT EXISTS catalogo_path text;

ALTER TABLE public.compras
  ADD COLUMN IF NOT EXISTS downloads_manual integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS downloads_catalogo integer NOT NULL DEFAULT 0;