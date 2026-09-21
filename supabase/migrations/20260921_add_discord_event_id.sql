-- Lien entre un événement du site et l'événement Discord correspondant.
-- À exécuter dans le SQL Editor de Supabase si la table events existe déjà
-- (inutile si tu la crées avec la version à jour de 20260921_create_events.sql).

alter table public.events add column if not exists discord_event_id text;
