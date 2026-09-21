# Changelog

Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/), versionnement [SemVer](https://semver.org/lang/fr/).

## [0.1.0] - 2026-09-21

Première version fonctionnelle.

### Ajouté
- Initialisation du projet Next.js 16 (App Router, TypeScript, Tailwind CSS, ESLint).
- Logo Harmony (`public/logo.svg`) utilisé aussi comme favicon.
- Page d'accueil avec le logo et les boutons **Connect**, **Mon bilan** et **Event**.
- Page `/connexion` : formulaire utilisateur / mot de passe (identifiants fixes temporaires), session par cookie `httpOnly` signé (HMAC), valable 8 heures.
- Page `/backoffice` protégée par la session, avec un bouton de retour à l'accueil.
- Page `/bilan` : sélection des catégories à inclure, éléments proposés par l'API Impact CO2 (dont les 136 modes de transport), quantités, distance et nombre de trajets pour le transport.
- Calcul du bilan côté serveur : total en kgCO2e et détail par catégorie incluse (élément, quantité, facteur, émissions, sous-total).
- Page `/event` (contenu à venir).
- `.env.example` et README (installation, variables, pages, scripts).

### Notes
- Pour la catégorie Alimentation, seuls les types de repas de l'API sont proposés.
- Les identifiants de connexion sont provisoires et seront remplacés par une vraie authentification.
- Dépendance `@supabase/ssr` installée en prévision de l'authentification, non utilisée pour l'instant.

[0.1.0]: https://github.com/Xoriax/harmony-co2/releases/tag/v0.1.0
