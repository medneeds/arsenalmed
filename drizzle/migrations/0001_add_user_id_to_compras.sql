ALTER TABLE public.compras ADD COLUMN IF NOT EXISTS user_id uuid;

CREATE INDEX IF NOT EXISTS compras_user_id_idx ON public.compras (user_id);
CREATE INDEX IF NOT EXISTS compras_email_lower_idx ON public.compras (lower(email));

GRANT SELECT ON public.compras TO authenticated;

DROP POLICY IF EXISTS "Compradores leem as proprias compras" ON public.compras;
CREATE POLICY "Compradores leem as proprias compras"
ON public.compras
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);