-- Vide l'historique des bilans : toutes les lignes de la table `bilans`, ainsi que les fichiers
-- associés (PDF, Excel) dans le bucket de stockage privé « bilans ». N'importe pas les réglages,
-- le journal d'audit, la limitation de débit, les événements ni le mandat.
--
-- IRRÉVERSIBLE. À exécuter dans le SQL Editor de Supabase (Project > SQL Editor > New query > Run).

-- Avant de lancer la suppression, vérifier ce qui va être supprimé :
-- select count(*) as bilans from public.bilans;
-- select count(*) as fichiers from storage.objects where bucket_id = 'bilans';

delete from storage.objects where bucket_id = 'bilans';
delete from public.bilans;
