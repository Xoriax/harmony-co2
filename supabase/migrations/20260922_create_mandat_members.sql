-- Membres affichés sur la page Mandat, gérés depuis le backoffice.
-- À exécuter une fois dans Supabase : SQL Editor > New query > Run.
-- Les photos sont stockées dans le bucket public « mandat-photos » (créé automatiquement).

create table if not exists public.mandat_members (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  role text not null check (char_length(role) between 1 and 80),          -- poste occupé
  team text not null check (team in ('rse', 'bureau')),                   -- Responsable RSE / Bureau restreint
  photo_url text,
  email text not null default '' check (char_length(email) <= 120),
  discord text not null default '' check (char_length(discord) <= 60),
  -- Éléments affichés (ou non) sur la carte de la page publique.
  show_photo boolean not null default true,
  show_email boolean not null default true,
  show_discord boolean not null default true,
  position integer not null default 0,                                    -- ordre dans son groupe
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists mandat_members_team_position_idx
  on public.mandat_members (team, position);

-- Aucune policy : l'accès se fait uniquement via le serveur (clé secrète).
-- Les e-mails et pseudos masqués ne sortent donc jamais de la base.
alter table public.mandat_members enable row level security;
