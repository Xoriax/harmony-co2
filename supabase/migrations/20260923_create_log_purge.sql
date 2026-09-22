-- Purge automatique du journal d'audit et des mesures Web Vitals, selon la durée de conservation
-- réglée dans /backoffice/reglages (table `settings`, clés `audit_log_retention_days` et
-- `web_vitals_retention_days`). Une valeur absente ou vide = conservé indéfiniment.
-- À exécuter une fois dans Supabase : SQL Editor > New query > Run.
--
-- Si la ligne `create extension pg_cron` échoue avec une erreur du type « extension "pg_cron" is
-- not allow-listed », active d'abord l'extension via le tableau de bord Supabase :
-- Database > Extensions > pg_cron > Enable, puis relance cette migration.

create extension if not exists pg_cron with schema pg_catalog;

create or replace function public.purge_old_logs()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_audit_days integer;
  v_vitals_days integer;
begin
  select (value #>> '{}')::integer into v_audit_days
    from public.settings where key = 'audit_log_retention_days';
  if v_audit_days is not null then
    delete from public.audit_log where created_at < now() - make_interval(days => v_audit_days);
  end if;

  select (value #>> '{}')::integer into v_vitals_days
    from public.settings where key = 'web_vitals_retention_days';
  if v_vitals_days is not null then
    delete from public.web_vitals where created_at < now() - make_interval(days => v_vitals_days);
  end if;
end;
$$;

-- Comme pour rate_limit_hit : retire le droit d'exécution par défaut (accordé à tous les rôles),
-- cette fonction contourne la RLS et n'a pas besoin d'être appelable depuis l'app.
revoke all on function public.purge_old_logs() from public;

-- Tous les jours à 3h du matin (UTC). cron.schedule met à jour le job existant si le nom est déjà
-- pris, donc rejouer cette migration ne crée pas de doublon.
select cron.schedule('purge-old-logs', '0 3 * * *', 'select public.purge_old_logs();');
