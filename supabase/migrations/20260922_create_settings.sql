-- Réglages de l'association : objectif de bilan carbone (comparaison sur /bilan) et seuil
-- d'alerte Discord (annonce automatique d'un bilan important). Une ligne par réglage.
-- À exécuter une fois dans Supabase : SQL Editor > New query > Run.

create table if not exists public.settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- Accès uniquement via le serveur (clé secrète) : aucune policy, donc aucun accès public.
alter table public.settings enable row level security;
