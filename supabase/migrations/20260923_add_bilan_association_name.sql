-- Nom de l'association : champ obligatoire du formulaire de bilan (/bilan), enregistré avec
-- chaque bilan et affiché dans l'historique, le PDF et l'Excel.
-- La valeur par défaut ne sert qu'à ne pas casser les bilans déjà enregistrés : le formulaire,
-- lui, exige toujours ce champ.
alter table public.bilans
  add column if not exists association_name text not null default '';
