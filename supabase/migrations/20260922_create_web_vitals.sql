-- Mesures de performance anonymes (Web Vitals), envoyées par le site en production.
-- À exécuter une fois dans Supabase : SQL Editor > New query > Run.
-- Aucune donnée personnelle : ni cookie, ni IP, ni identifiant de visiteur.

create table if not exists public.web_vitals (
  id uuid primary key default gen_random_uuid(),
  metric text not null,   -- CLS, FCP, FID, INP, LCP ou TTFB
  value double precision not null,
  rating text not null,   -- good, needs-improvement ou poor
  path text not null,
  created_at timestamptz not null default now()
);

create index if not exists web_vitals_metric_created_idx on public.web_vitals (metric, created_at desc);

-- Accès uniquement via le serveur (clé secrète) : aucune policy, donc aucun accès public.
alter table public.web_vitals enable row level security;
