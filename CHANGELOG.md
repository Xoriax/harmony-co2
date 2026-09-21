# Changelog

Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/), versionnement [SemVer](https://semver.org/lang/fr/).

## [0.3.0] - 2026-09-21

Refonte de la page Bilan et export des résultats.

### Ajouté
- Export des résultats en **PDF** : une seule page A4 paysage (total, répartition par catégorie, détail de tous les éléments), avec une mise en page qui s'adapte au nombre de lignes.
- Export des résultats en **Excel** (.xlsx) : feuilles « Synthèse » (parts, moyennes, top 5 des éléments les plus émetteurs), « Détail » (une ligne par élément, parts, filtres, formules) et « Infos » (date, méthode, source).
- Composant `SiteHeader` partagé entre l'accueil et le bilan.
- Dépendances `jspdf`, `jspdf-autotable` et `exceljs` (chargées uniquement au clic sur un export).

### Modifié
- Page `/bilan` redessinée aux couleurs du logo : en-tête avec globe 3D, catégories sous forme de cartes avec interrupteur, panneau récapitulatif fixe, résultats avec total en grand, barres de répartition animées et tableaux par catégorie.
- Animations 3D sur le formulaire : feuille qui pivote à l'activation d'une catégorie, dépliage des champs en perspective, globe dans le panneau récapitulatif.
- L'accueil utilise désormais la barre de navigation partagée.

### Notes
- Les animations sont désactivées avec `prefers-reduced-motion`.
- La page `/connexion` n'est pas encore redessinée : son bouton utilise d'anciennes classes de couleur supprimées de la configuration.

## [0.2.0] - 2026-09-21

Refonte de la page d'accueil.

### Ajouté
- Nouvelle page d'accueil aux couleurs du logo (crème, bleu nuit, vert sapin, vert pomme, or), sur le thème de l'écologie : barre de navigation, hero, cartes, bandeau vert, appel à l'action et pied de page.
- Animations 3D en CSS : globe en anneaux qui tourne et suit la souris, feuilles flottantes, cartes inclinées au survol, blocs flottants (désactivées avec `prefers-reduced-motion`).
- Barre de navigation avec les onglets **Mon bilan**, **Event**, **Mandat** et le bouton **Connexion**.
- Page `/mandat` (contenu à venir).
- Polices Bricolage Grotesque et Figtree.

### Modifié
- Les textes et images de la page d'accueil sont des placeholders (lorem ipsum, blocs noirs) en attendant le contenu final.
- Métadonnées du site : titre « Harmony CO2 », langue `fr`.

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

[0.3.0]: https://github.com/Xoriax/harmony-co2/releases/tag/v0.3.0
[0.2.0]: https://github.com/Xoriax/harmony-co2/releases/tag/v0.2.0
[0.1.0]: https://github.com/Xoriax/harmony-co2/releases/tag/v0.1.0
