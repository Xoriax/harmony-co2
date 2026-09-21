# harmony-co2

Bilan carbone pour les associations, by Harmony. L'utilisateur sélectionne les postes qui le concernent (numérique, repas, boissons, habillement, usage numérique, mobilier, transport) et obtient un total en kgCO2e avec le détail par catégorie, exportable en PDF ou en Excel et enregistré dans l'historique quand on est connecté. Les facteurs d'émission viennent de l'API [Impact CO2](https://impactco2.fr) (ADEME).

## Stack

- [Next.js](https://nextjs.org) 16 (App Router), React 19, TypeScript
- Tailwind CSS 4
- API Impact CO2
- Supabase (base de données Postgres et Storage) pour les événements
- jsPDF (+ autotable) et ExcelJS pour les exports

## Démarrage

```bash
npm install
cp .env.example .env   # puis renseigner les valeurs
npm run dev
```

L'application tourne sur http://localhost:3000.

## Variables d'environnement

| Variable | Rôle |
|---|---|
| `IMPACTCO2_TOKEN` | Token de l'API Impact CO2 (serveur uniquement) |
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Clé publique Supabase |
| `SUPABASE_SECRET_KEY` | Clé secrète Supabase (serveur uniquement, jamais exposée au navigateur) |
| `SITE_URL` | URL publique du site (sans `/` final), ex. `http://localhost:3000` |
| `DISCORD_CLIENT_ID` | Identifiant de l'application Discord |
| `DISCORD_CLIENT_SECRET` | Secret de l'application Discord (serveur uniquement) |
| `DISCORD_GUILD_ID` | Identifiant du serveur Discord dont il faut être membre |
| `DISCORD_ADMIN_ROLE_ID` | Identifiant du rôle qui donne accès au backoffice |
| `SESSION_SECRET` | Secret de signature du cookie de session (chaîne aléatoire d'au moins 32 octets) |

Le fichier `.env` est ignoré par git.

## Pages

| Route | Description |
|---|---|
| `/` | Accueil : navigation (Mon bilan, Event, Mandat, Connexion), hero 3D, sections |
| `/connexion` | Connexion avec Discord (membres du serveur ciblé) |
| `/backoffice` | Espace réservé au rôle Discord autorisé (redirige vers `/connexion` ou `/` sinon) : créer, modifier, supprimer les événements |
| `/bilan` | Formulaire et calcul du bilan carbone, export PDF (1 page paysage) et Excel |
| `/historique` | Bilans enregistrés de l'utilisateur connecté (PDF et Excel), téléchargement et suppression |
| `/event` | Événements publiés : cartes qui se retournent, compte à rebours, passage automatique en « passés » |
| `/mandat` | Page mandat (à venir) |

## Base de données (Supabase)

Les événements sont stockés dans la table `events` (couvertures dans le bucket public `event-covers`), l'historique dans la table `bilans` (fichiers dans le bucket privé `bilans`). Les buckets sont créés automatiquement. Exécuter une fois, dans l'ordre, dans le SQL Editor de Supabase :

1. `supabase/migrations/20260921_create_events.sql` : crée la table (version à jour, avec `cover_url` et `ends_at` obligatoire).
2. Uniquement si la table existait déjà avant : `20260921_add_event_cover.sql`, puis `20260921_require_event_end.sql`.
3. `20260921_create_bilans.sql` : crée la table de l'historique des bilans.

## Scripts

| Commande | Action |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm run start` | Serveur de production |
| `npm run lint` | Vérification ESLint |

## Versions

Le détail de chaque version est dans [CHANGELOG.md](CHANGELOG.md) et dans les [releases GitHub](https://github.com/Xoriax/harmony-co2/releases).
