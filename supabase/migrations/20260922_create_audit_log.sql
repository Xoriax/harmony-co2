-- Journal d'audit du backoffice : connexions, déconnexions, calculs de bilan, et création /
-- modification / suppression des événements et des membres du mandat.
-- À exécuter une fois dans Supabase : SQL Editor > New query > Run.

create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  action text not null,       -- login, logout, bilan_create, event_create, event_update,
                               -- event_delete, mandat_create, mandat_update ou mandat_delete
  user_id text not null,      -- identifiant Discord
  user_name text not null,
  target_label text,          -- titre de l'événement, nom du membre, etc. (facultatif)
  created_at timestamptz not null default now()
);

create index if not exists audit_log_created_at_idx on public.audit_log (created_at desc);

-- Accès uniquement via le serveur (clé secrète) : aucune policy, donc aucun accès public.
alter table public.audit_log enable row level security;
