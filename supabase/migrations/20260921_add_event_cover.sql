-- Image de couverture des événements.
-- À exécuter dans le SQL Editor de Supabase si la table events existe déjà
-- (inutile si tu as créé la table avec la version à jour de 20260921_create_events.sql).
-- Les images sont stockées dans le bucket public « event-covers » (créé automatiquement par l'application).

alter table public.events add column if not exists cover_url text;
