// Supprime tous les fichiers du bucket de stockage privé « bilans » (PDF, Excel).
// Supabase refuse un DELETE SQL direct sur storage.objects ("Direct deletion from storage tables
// is not allowed") : il faut passer par l'API Storage, ce que fait ce script.
//
// Usage (à la racine du projet, avec le vrai .env local) :
//   node --env-file=.env scripts/purge-bilan-files.mjs          -> liste les fichiers, ne supprime rien
//   node --env-file=.env scripts/purge-bilan-files.mjs --yes    -> supprime pour de vrai
//
// Pour vider aussi les lignes de la table, exécuter en plus supabase/scripts/purge-bilans.sql
// (dans le SQL Editor de Supabase) : `delete from public.bilans;`.
import { createClient } from "@supabase/supabase-js";

const BUCKET = "bilans";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;

if (!url || !key) {
  console.error(
    "NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SECRET_KEY doivent être définis : lance avec " +
      "`node --env-file=.env scripts/purge-bilan-files.mjs`.",
  );
  process.exit(1);
}

const confirmed = process.argv.includes("--yes");

// Le chemin d'un fichier est `<user_id>/<id>.pdf` (ou .xlsx) : storage.list() ne liste qu'un seul
// niveau de dossier à la fois. On passe par storage.objects (lecture seule, autorisée) pour avoir
// tous les chemins d'un coup, puis on les supprime via l'API Storage.
const storageSchema = createClient(url, key, { db: { schema: "storage" } });
const { data: objects, error } = await storageSchema
  .from("objects")
  .select("name")
  .eq("bucket_id", BUCKET);

if (error) {
  console.error("Impossible de lister les fichiers :", error.message);
  process.exit(1);
}

const paths = (objects ?? []).map((o) => o.name);

if (paths.length === 0) {
  console.log(`Bucket « ${BUCKET} » déjà vide.`);
  process.exit(0);
}

if (!confirmed) {
  console.log(`${paths.length} fichier(s) dans « ${BUCKET} » :`);
  for (const p of paths) console.log(`  - ${p}`);
  console.log("\nRien n'a été supprimé. Relance avec --yes pour confirmer la suppression.");
  process.exit(0);
}

const client = createClient(url, key);
const BATCH = 100; // limite de l'API Storage par appel

let removed = 0;
for (let i = 0; i < paths.length; i += BATCH) {
  const batch = paths.slice(i, i + BATCH);
  const { error: removeError } = await client.storage.from(BUCKET).remove(batch);
  if (removeError) {
    console.error(`Échec sur le lot ${i / BATCH + 1} :`, removeError.message);
    process.exit(1);
  }
  removed += batch.length;
}

console.log(`${removed} fichier(s) supprimé(s) de « ${BUCKET} ».`);
