# harmony-co2

Bilan carbone pour les associations, by Harmony. L'utilisateur sélectionne les postes qui le concernent (numérique, repas, boissons, habillement, usage numérique, mobilier, transport) et obtient un total en kgCO2e avec le détail par catégorie. Les facteurs d'émission viennent de l'API [Impact CO2](https://impactco2.fr) (ADEME).

## Stack

- [Next.js](https://nextjs.org) 16 (App Router), React 19, TypeScript
- Tailwind CSS 4
- API Impact CO2

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
| `SESSION_SECRET` | Secret de signature du cookie de session (chaîne aléatoire d'au moins 32 octets) |

Le fichier `.env` est ignoré par git.

## Pages

| Route | Description |
|---|---|
| `/` | Accueil : navigation (Mon bilan, Event, Mandat, Connexion), hero 3D, sections |
| `/connexion` | Connexion (identifiants fixes temporaires) |
| `/backoffice` | Espace protégé, redirige vers `/connexion` si non connecté |
| `/bilan` | Formulaire et calcul du bilan carbone |
| `/event` | Page événement (à venir) |
| `/mandat` | Page mandat (à venir) |

## Scripts

| Commande | Action |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm run start` | Serveur de production |
| `npm run lint` | Vérification ESLint |

## Versions

Le détail de chaque version est dans [CHANGELOG.md](CHANGELOG.md) et dans les [releases GitHub](https://github.com/Xoriax/harmony-co2/releases).
