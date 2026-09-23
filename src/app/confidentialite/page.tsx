import { LEGAL } from "@/lib/legal";
import { Fill, LegalPage, List, Section, legalMetadata } from "../legal/legal-page";

export const metadata = legalMetadata(
  "Politique de confidentialité",
  "Quelles données Harmony CO2 collecte, pourquoi, combien de temps, et comment exercer tes droits.",
  "/confidentialite",
);

const link = "font-semibold text-forest underline hover:text-blue";

export default function ConfidentialitePage() {
  return (
    <LegalPage
      seed="confidentialite"
      title="Politique de confidentialité"
      intro="Ce que le site collecte sur toi, pourquoi, combien de temps c'est conservé et comment exercer tes droits (RGPD)."
    >
      <Section title="Qui est responsable ?">
        <p>
          Le responsable du traitement est <Fill value={LEGAL.name} />, joignable à{" "}
          <Fill value={LEGAL.email} />.
        </p>
      </Section>

      <Section title="Les données que nous traitons">
        <p className="font-semibold text-night">Si tu te connectes avec Discord</p>
        <List>
          <li>
            Ton identifiant Discord, ton pseudo, ton avatar et le fait que tu aies ou non le rôle
            d&apos;administration sur le serveur. Nous ne demandons que les autorisations{" "}
            <em>identify</em> et <em>guilds.members.read</em> : ni ton e-mail, ni tes messages, ni
            tes amis.
          </li>
          <li>
            Ces informations ne sont pas enregistrées dans une base : elles sont placées dans un
            cookie de session signé, qui expire après 8 heures ou à ta déconnexion.
          </li>
        </List>

        <p className="font-semibold text-night">Quand tu génères un bilan</p>
        <List>
          <li>
            Les résultats (total et sous-totaux par catégorie), le nom d&apos;association que tu
            saisis, ainsi que le PDF et l&apos;Excel générés sont toujours enregistrés, connecté ou
            non : ils servent de registre interne à l&apos;association (onglet Historique bilan du
            backoffice, réservé aux administrateurs).
          </li>
          <li>
            Connecté, ton identifiant et ton pseudo Discord y sont associés, pour que tu retrouves
            ce bilan dans ton propre onglet Historique. Les fichiers sont alors stockés dans un
            espace privé : seul toi (et les administrateurs) peux les y télécharger.
          </li>
          <li>
            Sans connexion, le bilan est enregistré comme « visiteur anonyme », sans aucune donnée
            permettant de t&apos;identifier : il n&apos;apparaît dans l&apos;historique d&apos;aucun
            compte et toi-même ne peux pas le retrouver plus tard.
          </li>
        </List>

        <p className="font-semibold text-night">Les membres du mandat</p>
        <List>
          <li>
            Nom, poste, photo, adresse e-mail et identifiant Discord, saisis par les administrateurs
            pour présenter l&apos;équipe.
          </li>
          <li>
            Pour chaque fiche, la photo, l&apos;e-mail et le Discord peuvent être masqués. Un
            élément masqué n&apos;est jamais envoyé aux visiteurs.
          </li>
        </List>

        <p className="font-semibold text-night">Les événements</p>
        <List>
          <li>
            Titre, description, dates, image : ce sont des informations sur l&apos;événement, pas
            sur des personnes. Elles peuvent être publiées sur le serveur Discord de
            l&apos;association.
          </li>
        </List>
      </Section>

      <Section title="Pourquoi et sur quelle base légale">
        <List>
          <li>
            <strong>Connexion et historique</strong> : fournir le service que tu demandes (exécution
            du contrat, art. 6.1.b du RGPD) et tenir l&apos;historique de tes bilans.
          </li>
          <li>
            <strong>Présentation du mandat</strong> : ton consentement (art. 6.1.a), que tu peux
            retirer à tout moment en demandant la suppression ou le masquage de tes informations.
          </li>
          <li>
            <strong>Sécurité</strong> : réserver le backoffice aux administrateurs (intérêt
            légitime, art. 6.1.f).
          </li>
        </List>
        <p>Nous ne faisons ni publicité, ni profilage, ni revente de données.</p>
      </Section>

      <Section title="Combien de temps ?">
        <List>
          <li>Session de connexion : 8 heures au maximum.</li>
          <li>
            Bilans de ton historique personnel : jusqu&apos;à ce que tu les supprimes depuis
            l&apos;onglet Historique (la suppression efface aussi les fichiers) ou que tu demandes
            l&apos;effacement de tes données.
          </li>
          <li>
            Bilans générés sans connexion, et registre interne conservé par l&apos;association
            (onglet Historique bilan du backoffice) : sans durée fixe, jusqu&apos;à suppression
            manuelle par un administrateur.
          </li>
          <li>
            Fiche d&apos;un membre du mandat : pendant la durée du mandat, puis supprimée à la fin
            de sa mission ou à sa demande.
          </li>
        </List>
      </Section>

      <Section title="Cookies">
        <p>
          Le site n&apos;utilise que des cookies strictement nécessaires, exemptés de consentement.
          Il n&apos;y a ni cookie publicitaire, ni outil de mesure d&apos;audience.
        </p>
        <List>
          <li>
            <code className="rounded bg-cream-soft px-1.5">session</code> : te garder connecté, 8
            heures.
          </li>
          <li>
            Un cookie technique d&apos;état, le temps de l&apos;échange avec Discord (10 minutes au
            plus), pour sécuriser la connexion.
          </li>
        </List>
        <p>
          Les polices sont incluses dans le site : ton navigateur ne contacte aucun service de
          polices externe.
        </p>
        <p>
          Le site mesure aussi, sans cookie ni identifiant, la vitesse de chargement de chaque page
          (temps d&apos;affichage, stabilité visuelle) : cette mesure technique est anonyme et ne
          permet pas de suivre un visiteur d&apos;une page à l&apos;autre.
        </p>
      </Section>

      <Section title="Qui reçoit les données ?">
        <p>Uniquement les prestataires nécessaires au fonctionnement du site :</p>
        <List>
          <li>
            <strong>Supabase</strong> : base de données et stockage des fichiers (région :{" "}
            <Fill value={LEGAL.databaseRegion} />
            ).
          </li>
          <li>
            <strong>Discord</strong> : authentification et publication des événements sur le serveur
            de l&apos;association. Discord Inc. est établi aux États-Unis ; les transferts sont
            encadrés par des clauses contractuelles types.
          </li>
          <li>
            <strong>Impact CO2 (ADEME)</strong> : reçoit les quantités saisies pour calculer les
            émissions, sans aucune donnée te concernant.
          </li>
          <li>
            <strong>Hébergeur</strong> : <Fill value={LEGAL.host} />.
          </li>
        </List>
        <p>
          Les administrateurs de l&apos;association gèrent les fiches du mandat et les événements,
          et consultent tous les bilans générés (onglet Historique bilan du backoffice) : c&apos;est
          le registre interne de l&apos;association, y compris pour les bilans générés sans
          connexion.
        </p>
      </Section>

      <Section title="Tes droits">
        <p>
          Tu peux à tout moment demander l&apos;accès à tes données, leur rectification, leur
          effacement, la limitation ou l&apos;opposition à leur traitement, et leur portabilité.
          Écris à <Fill value={LEGAL.email} /> en précisant ton pseudo Discord ; nous répondons sous
          un mois.
        </p>
        <p>
          Tu peux déjà supprimer toi-même tes bilans depuis l&apos;onglet Historique et te
          déconnecter à tout moment. En cas de désaccord, tu peux saisir la CNIL :{" "}
          <a href="https://www.cnil.fr/fr/plaintes" className={link}>
            cnil.fr/fr/plaintes
          </a>
          .
        </p>
      </Section>

      <Section title="Sécurité">
        <p>
          La session est signée et inaccessible au JavaScript du navigateur, les tables sont fermées
          à tout accès public et les fichiers de l&apos;historique ne sont téléchargeables que par
          leur propriétaire, via un lien temporaire.
        </p>
      </Section>

      <Section title="Modifications">
        <p>
          Cette politique peut évoluer avec le site ; la date de mise à jour figure en haut de la
          page.
        </p>
      </Section>
    </LegalPage>
  );
}
