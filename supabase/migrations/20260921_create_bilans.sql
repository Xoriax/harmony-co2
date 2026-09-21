-- Historique des bilans carbone générés par les utilisateurs connectés.
-- À exécuter une fois dans Supabase : SQL Editor > New query > Run.
-- Les fichiers PDF et Excel sont stockés dans le bucket privé « bilans » (créé automatiquement).

create table if not exists public.bilans (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,                 -- identifiant Discord
  user_name text not null default '',
  total numeric not null,                -- kgCO2e
  categories jsonb not null default '[]'::jsonb,  -- [{ name, subtotal, count }]
  pdf_path text not null,
  xlsx_path text not null,
  created_at timestamptz not null default now()
);

create index if not exists bilans_user_created_idx on public.bilans (user_id, created_at desc);

-- Accès uniquement via le serveur (clé secrète) : aucune policy, donc aucun accès public.
alter table public.bilans enable row level security;
