CREATE TABLE public.compras (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  stripe_session_id text unique not null,
  stripe_payment_intent text,
  valor_centavos integer not null,
  status text not null default 'pago',
  token_download uuid default gen_random_uuid(),
  downloads integer not null default 0,
  expira_em timestamptz not null default (now() + interval '7 days'),
  criado_em timestamptz not null default now()
);
GRANT ALL ON public.compras TO service_role;
ALTER TABLE public.compras ENABLE ROW LEVEL SECURITY;