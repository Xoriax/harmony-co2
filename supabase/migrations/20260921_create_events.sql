-- Table des événements gérés depuis le backoffice.
-- À exécuter une fois dans Supabase : SQL Editor > New query > Run.

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 120),
  description text not null default '' check (char_length(description) <= 2000),
  location text not null default '' check (char_length(location) <= 120),
  -- Heures locales saisies dans le backoffice, sans fuseau horaire.
  starts_at timestamp not null,
  ends_at timestamp not null,
  published boolean not null default true,
  cover_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint events_dates_check check (ends_at > starts_at)
);

create index if not exists events_starts_at_idx on public.events (starts_at);

-- Les écritures passent par le serveur avec la clé secrète (qui ignore la RLS).
-- La lecture publique est limitée aux événements publiés.
alter table public.events enable row level security;

drop policy if exists "Lecture publique des événements publiés" on public.events;
create policy "Lecture publique des événements publiés"
  on public.events for select
  using (published);
