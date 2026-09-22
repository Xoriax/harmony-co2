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
| `DISCORD_BOT_TOKEN` | Jeton du bot Discord (permissions « Créer des événements » et « Gérer les événements ») : crée, met à jour et supprime les événements programmés du serveur |
| `SESSION_SECRET` | Secret de signature du cookie de session (chaîne aléatoire d'au moins 32 octets) |

Le fichier `.env` est ignoré par git.

## Pages

| Route | Description |
|---|---|
| `/` | Accueil : navigation (Mon bilan, Event, Mandat, Connexion), hero 3D, présentation du site et étapes du bilan |
| `/connexion` | Connexion avec Discord (membres du serveur ciblé) |
| `/backoffice` | Espace réservé au rôle Discord autorisé (redirige vers `/connexion` ou `/` sinon) : créer, modifier, supprimer les événements, synchronisés avec les événements programmés du serveur Discord |
| `/bilan` | Formulaire et calcul du bilan carbone, export PDF (1 page paysage) et Excel |
| `/historique` | Bilans enregistrés de l'utilisateur connecté (PDF et Excel), téléchargement et suppression |
| `/event` | Événements publiés : cartes qui se retournent, compte à rebours, passage automatique en « passés » |
| `/mandat` | Équipe du mandat (Responsable RSE et Bureau restreint) : cartes avec photo, poste, e-mail et Discord, éléments affichables au choix |
| `/backoffice/mandat` | Gestion des membres du mandat (même accès que `/backoffice`) |
| `/mentions-legales` | Mentions légales : éditeur, hébergeur, propriété intellectuelle, responsabilité |
| `/confidentialite` | Politique de confidentialité (RGPD) : données, bases légales, durées, cookies, destinataires, droits |

Les informations de l'association (nom, adresse, e-mail, hébergeur, région de la base) sont à renseigner dans `src/lib/legal.ts` : tant qu'une valeur est `null`, les pages affichent « à compléter ». Les liens vers ces deux pages sont dans le pied de page de tout le site.

## Base de données (Supabase)

Les événements sont stockés dans la table `events` (couvertures dans le bucket public `event-covers`), l'historique dans la table `bilans` (fichiers dans le bucket privé `bilans`), les membres du mandat dans la table `mandat_members` (photos dans le bucket public `mandat-photos`). Les buckets sont créés automatiquement. Exécuter une fois, dans l'ordre, dans le SQL Editor de Supabase :

1. `supabase/migrations/20260921_create_events.sql` : crée la table (version à jour, avec `cover_url` et `ends_at` obligatoire).
2. Uniquement si la table existait déjà avant : `20260921_add_event_cover.sql`, `20260921_require_event_end.sql`, puis `20260921_add_discord_event_id.sql`.
3. `20260921_create_bilans.sql` : crée la table de l'historique des bilans.
4. `20260922_create_mandat_members.sql` : crée la table des membres du mandat.
5. `20260922_create_web_vitals.sql` : crée la table des mesures de performance (Web Vitals).

## Performance

- **Cache Components** (Next 16) : les pages sont prérendues (coquille statique) et seules les parties liées à la session ou à l'heure exacte arrivent en streaming (pseudo dans la barre du haut, historique, backoffice, liste des événements).
- **Données publiques en cache** : la liste des événements (étiquette `events`) et celle des membres du mandat (étiquette `mandat`) sont mises en cache 1 heure et rafraîchies aussitôt qu'on les modifie depuis le backoffice. Une modification faite directement dans Supabase n'apparaît qu'après l'expiration du cache.
- **Exports** : jsPDF et ExcelJS ne sont chargés qu'à l'approche ou au clic d'un bouton d'export. `npm run size` le vérifie après chaque build.
- **Web Vitals en production** : chaque page envoie ses métriques de chargement (LCP, CLS, INP…) à `/api/vitals`, qui les enregistre dans la table `web_vitals`, sans cookie ni identifiant de visiteur (voir `/confidentialite`). Rien n'est envoyé en développement.

## Qualité du code

- **Tests unitaires** (`tests/`, Vitest) : calcul du bilan, conversion des heures de Paris (changements d'heure inclus), statut et compte à rebours d'un événement, éléments masqués des cartes du mandat, validation des formulaires du backoffice, session signée (falsification, expiration, secret manquant), synchronisation Discord, validation des images, téléchargement de l'historique, mesures Web Vitals et pages d'erreur. Ils tournent dans un fuseau horaire éloigné de Paris pour prouver qu'aucun calcul ne dépend de la machine.
- **Tests de bout en bout** (`e2e/`, Playwright) : parcours de connexion (accès au backoffice selon le rôle, déconnexion), création d'un bilan et export PDF/Excel, dans un vrai navigateur. La connexion Discord elle-même n'est pas automatisable : ces tests injectent un cookie de session signé avec le même format que la vraie session (voir `e2e/utils/session.ts`, dont la parité avec `src/lib/session.ts` est vérifiée par un test unitaire). `npm run e2e` (ou `npm run e2e:ui` pour l'interface pas à pas) lance un vrai build sur le port 3100, avec le `.env` local ; `IMPACTCO2_TOKEN` doit être une vraie valeur, ces tests calculent un vrai bilan.
- **Intégration continue** (`.github/workflows/ci.yml`) : à chaque push et pull request, GitHub lance ESLint, TypeScript, Prettier, les tests unitaires, le build (avec de fausses clés) et `npm run size` ; un second job lance les tests de bout en bout si le secret `IMPACTCO2_TOKEN` est configuré sur le dépôt (Settings > Secrets and variables > Actions), sinon il est ignoré sans faire échouer la vérification.
- **Mise à jour des dépendances** : Dependabot (`.github/dependabot.yml`) ouvre chaque semaine une pull request par dépendance de production, et une seule groupant les dépendances de développement.
- **Formatage** : Prettier (`.prettierrc.json`), `.editorconfig` et `.gitattributes` (fins de ligne LF partout, y compris sous Windows). Lancer `npm run format` avant de commiter.
- **Erreurs** : pages « introuvable » (404), erreur d'une page (avec « Réessayer »), erreur grave (layout) et écrans de chargement. Le message technique d'une erreur n'est jamais affiché aux visiteurs. Si `SESSION_SECRET` manque, le site reste utilisable mais personne ne peut se connecter (un message est écrit dans les journaux).

## Scripts

| Commande | Action |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm run start` | Serveur de production |
| `npm run lint` | Vérification ESLint |
| `npm run typecheck` | Vérification TypeScript |
| `npm run format` | Formate tout le code avec Prettier |
| `npm run format:check` | Vérifie le formatage sans rien modifier |
| `npm test` | Lance les tests (Vitest) |
| `npm run test:watch` | Relance les tests à chaque modification |
| `npm run check` | Enchaîne lint, types, formatage et tests (à lancer avant un commit) |
| `npm run size` | Après un build : poids du JS au démarrage de chaque page (budget 210 Ko gzip) et contrôle que les librairies PDF/Excel ne se chargent qu'au clic |

## Versions

Le détail de chaque version est dans [CHANGELOG.md](CHANGELOG.md) et dans les [releases GitHub](https://github.com/Xoriax/harmony-co2/releases).
