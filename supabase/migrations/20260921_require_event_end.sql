-- La date de fin devient obligatoire.
-- À exécuter dans le SQL Editor de Supabase si la table events existe déjà
-- (inutile si tu la crées avec la version à jour de 20260921_create_events.sql).

-- Les événements sans fin prennent leur date de début comme fin (ils sont donc clos).
update public.events set ends_at = starts_at where ends_at is null;

alter table public.events alter column ends_at set not null;
