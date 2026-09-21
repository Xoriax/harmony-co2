# Changelog

Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/), versionnement [SemVer](https://semver.org/lang/fr/).

## [0.9.0] - 2026-09-22

Performance : pages prérendues et suivi du poids des exports.

### Ajouté
- Activation de Cache Components (Next 16) : les pages sont prérendues avec une coque statique, seules les parties liées à la session ou à l'heure exacte arrivent en streaming.
- Écran de chargement instantané (`PageFallback`) pour les pages qui lisent la session (Historique, Connexion, Backoffice).
- Script `npm run size` (`scripts/check-bundle-size.mjs`) : poids du JavaScript au démarrage de chaque page (budget 220 Ko gzip) et contrôle que les librairies PDF et Excel ne se chargent qu'au clic.
- Préchargement des librairies d'export quand la souris ou le focus arrive sur un bouton d'export.

### Modifié
- Barre de navigation : la coque est statique ; le bloc pseudo, Backoffice et déconnexion, ainsi que le lien Historique, sont chargés à part (le visiteur voit d'emblée le bouton « Connexion »).
- Listes d'événements et de membres du mandat mises en cache 1 heure (étiquettes `events` et `mandat`), rafraîchies immédiatement à chaque modification depuis le backoffice.
- Page Event : la liste est rendue à la requête avec l'heure exacte du serveur ; le reste de la page est prérendu.
- Le module d'export est importé à la demande (`/bilan` charge 3 Ko de moins).
- Les routes d'administration utilisent des étiquettes de cache (`updateTag`) plutôt que le rafraîchissement des chemins publics.

### Supprimé
- Les réglages `dynamic = "force-dynamic"` des pages Event et Mandat (incompatibles avec Cache Components).

### Notes
- Une modification faite directement dans Supabase n'apparaît sur le site qu'après l'expiration du cache (1 heure au plus).
- Sans session, `/backoffice` et `/historique` redirigent désormais côté navigateur (au lieu d'une redirection serveur).
- Mesures : JS au démarrage de 179 à 183 Ko gzip par page, sans librairie d'export ; 2e visite de `/event` en environ 11 ms.

## [0.8.2] - 2026-09-22

Feuilles décoratives animées.

### Ajouté
- Feuilles décoratives (SVG aux couleurs du logo) qui dérivent seules et se décalent selon le défilement : sur la page d'accueil (hero, cartes, bandeau vert, bloc final) et sur les pages Bilan, Event, Mandat, Historique et Connexion. Le backoffice n'est pas concerné.
- Composants `LeafLayer` (calque animé), `LeafPage` (habillage des pages) et jeux de positions partagés (`leaf-presets`).
- Feuilles propres aux bandes vert sapin de la page Mandat.

### Notes
- Les feuilles sont placées derrière le contenu et n'interceptent aucun clic ; une partie est masquée sur mobile.
- Elles restent fixes avec `prefers-reduced-motion`.
- Aucun `overflow` n'est ajouté sur `<main>` afin de ne pas casser le panneau collant de la page Bilan.

## [0.8.1] - 2026-09-22

Textes de la page d'accueil.

### Modifié
- Les textes provisoires (lorem ipsum) de la page d'accueil sont remplacés par le contenu définitif : en-tête, cartes, étapes « Comment ça marche », appel à l'action et pied de page.
- La troisième carte de l'accueil pointe désormais vers la page Mandat au lieu de la connexion.
- Les étapes du bandeau vert sont numérotées.

### Notes
- Les images de la page d'accueil restent des blocs noirs en attendant les vraies photos.

## [0.8.0] - 2026-09-22

Page Mandat gérable depuis le backoffice et animations 3D sur Event et Historique.

### Ajouté
- Page `/mandat` : membres du **Responsable RSE** et du **Bureau restreint**, avec nom, poste, photo, e-mail et Discord.
- Onglet « Mandat » dans le backoffice (`/backoffice/mandat`) : ajouter, modifier et supprimer les membres, choisir leur groupe et leur ordre d'affichage, envoyer une photo (JPG, PNG, WebP ou GIF, 5 Mo max).
- Choix, pour chaque membre, des éléments affichés sur sa carte (photo, e-mail, Discord) : un élément masqué n'est jamais envoyé au navigateur des visiteurs.
- Onglets « Événements » et « Mandat » dans le backoffice, interrupteur réutilisable et garde d'accès partagée (`requireAdmin`).
- Composant de carte 3D partagé (inclinaison suivant la souris, reflet, profondeur), utilisé sur Mandat, Event et Historique.
- Migration `supabase/migrations/20260922_create_mandat_members.sql` et bucket public `mandat-photos`.

### Modifié
- Page `/mandat` redessinée : en-tête avec globe 3D, bande vert sapin pour le premier groupe, cartes 3D, photos aux coins en forme de feuille, animation d'apparition en cascade.
- Pages `/event` et `/historique` : globe 3D dans l'en-tête, cartes qui s'inclinent avec la souris, apparition en cascade, pulsation verte sur les événements en cours.
- Le téléversement d'images accepte désormais un bucket au choix (couvertures d'événements et photos de membres).

### Notes
- Les animations sont désactivées avec `prefers-reduced-motion`.
- La migration SQL doit être exécutée une fois dans le SQL Editor de Supabase (voir le README).

## [0.7.0] - 2026-09-21

Synchronisation des événements du site vers Discord.

### Ajouté
- Création, modification et suppression des événements Discord programmés depuis le backoffice, via un bot : titre, description, lieu, dates de début et de fin, cover (JPG, PNG, GIF) et lien vers la page Event.
- Un événement passé en brouillon est retiré de Discord ; un événement supprimé sur le site l'est aussi sur Discord.
- Conversion des heures de Paris vers un instant exact (heure d'été et d'hiver).
- Bandeau de résultat dans le backoffice après chaque enregistrement et badge « Sur Discord » sur les événements synchronisés.
- Colonne `discord_event_id` (migration `supabase/migrations/20260921_add_discord_event_id.sql`) et variable d'environnement `DISCORD_BOT_TOKEN`.

### Notes
- Discord refuse de programmer un événement dont le début est passé : il reste alors uniquement sur le site, avec un message.
- Sans lieu, « Lieu à préciser » est envoyé (Discord l'exige) ; la description est limitée à 1000 caractères sur Discord.
- Si Discord est indisponible ou si le bot n'a plus ses permissions, l'événement est tout de même enregistré sur le site.
- Le sens Discord vers site n'est pas encore géré.
- Le bot n'a pas besoin de tourner en continu : il apparaît hors ligne mais les appels fonctionnent.

## [0.6.0] - 2026-09-21

Historique des bilans.

### Ajouté
- Enregistrement automatique des bilans : quand l'utilisateur est connecté, le PDF et l'Excel sont générés côté serveur et enregistrés à chaque calcul (table `bilans` et bucket privé `bilans` sur Supabase).
- Page `/historique`, visible uniquement une fois connecté : liste des bilans (total, date, catégories) avec téléchargement du PDF et de l'Excel et suppression.
- Onglet « Historique » dans la barre de navigation pour les utilisateurs connectés.
- Message de confirmation (ou d'échec) de l'enregistrement dans les résultats du bilan.
- Téléchargement sécurisé : `/historique/fichier/[id]` vérifie le propriétaire puis redirige vers une URL signée de 60 secondes.
- Migration `supabase/migrations/20260921_create_bilans.sql`.

### Modifié
- La génération des PDF et Excel est séparée du téléchargement (`buildPdf`, `buildExcel`) pour servir côté navigateur et côté serveur.
- Les dates et heures des exports sont exprimées à l'heure de Paris, quel que soit le fuseau du serveur.

### Notes
- Un bilan calculé sans être connecté n'est pas enregistré.
- La migration SQL doit être exécutée une fois dans le SQL Editor de Supabase (voir le README).

## [0.5.0] - 2026-09-21

Connexion avec Discord.

### Ajouté
- Connexion via OAuth2 Discord (`/connexion/discord` et `/connexion/discord/callback`) : seuls les membres du serveur ciblé peuvent se connecter, avec protection anti-CSRF (état stocké en cookie).
- Accès au backoffice réservé aux membres ayant le rôle Discord autorisé ; les autres membres sont renvoyés à l'accueil et restent connectés avec leur pseudo.
- Barre de navigation adaptée à la session : pseudo et avatar Discord à la place du bouton « Connexion », bouton « Backoffice » pour les administrateurs, bouton « Se déconnecter ».
- Nouvelles variables d'environnement : `SITE_URL`, `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, `DISCORD_GUILD_ID`, `DISCORD_ADMIN_ROLE_ID` (voir `.env.example` et le README).

### Modifié
- La session contient désormais l'identifiant Discord, le pseudo, l'avatar, le rôle administrateur et une date d'expiration (8 heures), dans un cookie signé.
- La page `/connexion` est redessinée aux couleurs du site.

### Supprimé
- Les identifiants fixes temporaires (`admin` / `admin123`) et l'ancien formulaire de connexion.

### Notes
- Le rôle est vérifié à la connexion : un rôle retiré reste actif jusqu'à l'expiration de la session.
- Les pages utilisant la barre de navigation sont désormais rendues à chaque visite, car elles lisent la session.

## [0.4.0] - 2026-09-21

Gestion des événements depuis le backoffice.

### Ajouté
- Backoffice `/backoffice` : créer, modifier et supprimer des événements, enregistrés dans Supabase (titre, lieu, début, fin, description, image de couverture, publié ou brouillon).
- Image de couverture par événement : envoi vers le bucket Supabase Storage `event-covers` (JPG, PNG, WebP ou GIF, 5 Mo max), aperçu, remplacement et suppression, nettoyage automatique des anciens fichiers.
- Page `/event` publique : cartes 3D qui se retournent au clic pour afficher la description, avec cover, titre, dates et heures de début et de fin, et badge de statut (En cours, À venir, Clos).
- Compte à rebours en direct jusqu'à la fin de chaque événement ; à l'échéance, l'événement passe automatiquement dans « Événements passés » sans recharger la page.
- Migrations SQL dans `supabase/migrations/`, client Supabase serveur (`@supabase/supabase-js`), configuration des images distantes et de la taille des envois (6 Mo).

### Modifié
- La date de fin est obligatoire (formulaire, serveur et base) et doit être après le début.
- Bouton « Se connecter » de `/connexion` : couleurs corrigées après la refonte (il était invisible).

### Notes
- Les dates sont stockées sans fuseau (heure locale saisie) et comparées à l'heure de Paris.
- Sans date de fin (anciennes données), un événement est considéré en cours jusqu'à la fin de sa journée de début.
- Les migrations doivent être exécutées une fois dans le SQL Editor de Supabase (voir le README).

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

[0.9.0]: https://github.com/Xoriax/harmony-co2/releases/tag/v0.9.0
[0.8.2]: https://github.com/Xoriax/harmony-co2/releases/tag/v0.8.2
[0.8.1]: https://github.com/Xoriax/harmony-co2/releases/tag/v0.8.1
[0.8.0]: https://github.com/Xoriax/harmony-co2/releases/tag/v0.8.0
[0.7.0]: https://github.com/Xoriax/harmony-co2/releases/tag/v0.7.0
[0.6.0]: https://github.com/Xoriax/harmony-co2/releases/tag/v0.6.0
[0.5.0]: https://github.com/Xoriax/harmony-co2/releases/tag/v0.5.0
[0.4.0]: https://github.com/Xoriax/harmony-co2/releases/tag/v0.4.0
[0.3.0]: https://github.com/Xoriax/harmony-co2/releases/tag/v0.3.0
[0.2.0]: https://github.com/Xoriax/harmony-co2/releases/tag/v0.2.0
[0.1.0]: https://github.com/Xoriax/harmony-co2/releases/tag/v0.1.0
