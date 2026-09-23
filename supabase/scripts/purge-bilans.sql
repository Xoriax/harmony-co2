-- Vide la table `bilans`. N'affecte ni les réglages, ni le journal d'audit, ni la limitation de
-- débit, ni les événements, ni le mandat.
--
-- IRRÉVERSIBLE. À exécuter dans le SQL Editor de Supabase (Project > SQL Editor > New query > Run).
--
-- Ne supprime pas les fichiers (PDF, Excel) du bucket de stockage privé « bilans » : Supabase
-- refuse un DELETE SQL direct sur les fichiers ("Direct deletion from storage tables is not
-- allowed"). Pour les fichiers, exécuter en plus, en local :
--   node --env-file=.env scripts/purge-bilan-files.mjs --yes

-- Avant de lancer la suppression, vérifier ce qui va être supprimé :
-- select count(*) as bilans from public.bilans;

delete from public.bilans;
