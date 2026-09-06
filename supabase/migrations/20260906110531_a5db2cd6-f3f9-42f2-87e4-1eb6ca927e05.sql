ALTER TABLE public.compras
  ADD COLUMN IF NOT EXISTS cpf text,
  ADD COLUMN IF NOT EXISTS arquivo_path text;