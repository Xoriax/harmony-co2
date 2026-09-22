-- Limitation de débit (anti-abus) sur les endpoints sensibles : calcul de bilan (appelle l'API
-- Impact CO2) et callback de connexion Discord. Une ligne par clé (ex. "bilan:203.0.113.5"),
-- fenêtre fixe : le compteur repart à 1 dès que la fenêtre est expirée.
-- À exécuter une fois dans Supabase : SQL Editor > New query > Run.

create table if not exists public.rate_limits (
  key text primary key,
  count integer not null default 1,
  window_start timestamptz not null default now()
);

-- Accès uniquement via le serveur (clé secrète) : aucune policy, donc aucun accès public.
alter table public.rate_limits enable row level security;

-- Incrémente le compteur de `key` et renvoie sa valeur à jour, en réinitialisant la fenêtre si
-- elle est expirée. Un seul statement (INSERT ... ON CONFLICT ... UPDATE) : atomique même avec
-- des appels concurrents sur la même clé.
create or replace function public.rate_limit_hit(p_key text, p_window_seconds int)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  insert into public.rate_limits (key, count, window_start)
  values (p_key, 1, now())
  on conflict (key) do update
    set count = case
          when public.rate_limits.window_start < now() - make_interval(secs => p_window_seconds)
            then 1
          else public.rate_limits.count + 1
        end,
        window_start = case
          when public.rate_limits.window_start < now() - make_interval(secs => p_window_seconds)
            then now()
          else public.rate_limits.window_start
        end
  returning count into v_count;
  return v_count;
end;
$$;

-- Par défaut Postgres autorise tous les rôles (dont `anon`, exposé via la clé publique) à
-- exécuter une nouvelle fonction. Comme celle-ci contourne la RLS (SECURITY DEFINER), on retire
-- ce droit et on ne le redonne qu'au rôle utilisé par le serveur (clé secrète).
revoke all on function public.rate_limit_hit(text, int) from public;
grant execute on function public.rate_limit_hit(text, int) to service_role;
