import { LEGAL } from "@/lib/legal";
import { Fill, LegalPage, List, Section, legalMetadata } from "../legal/legal-page";

export const metadata = legalMetadata(
  "Mentions légales",
  "Éditeur, hébergeur et conditions d'utilisation du site Harmony CO2.",
);

const link = "font-semibold text-forest underline hover:text-blue";

export default function MentionsLegalesPage() {
  return (
    <LegalPage
      seed="mentions-legales"
      title="Mentions légales"
      intro="Les informations que la loi impose de publier sur l'éditeur et l'hébergeur du site Harmony CO2."
    >
      <Section title="Éditeur du site">
        <List>
          <li>
            Association : <Fill value={LEGAL.name} />
          </li>
          <li>
            Forme juridique : <Fill value={LEGAL.form} />
          </li>
          <li>
            Siège : <Fill value={LEGAL.address} />
          </li>
          <li>
            Contact : <Fill value={LEGAL.email} />
          </li>
          <li>
            Directeur ou directrice de la publication : <Fill value={LEGAL.director} />
          </li>
        </List>
      </Section>

      <Section title="Hébergement">
        <p>
          Le site est hébergé par <Fill value={LEGAL.host} />.
        </p>
        <p>
          Les données (événements, mandat, historique des bilans) sont stockées chez Supabase, dans
          la région suivante : <Fill value={LEGAL.databaseRegion} />.
        </p>
      </Section>

      <Section title="Objet du site">
        <p>
          Harmony CO2 permet aux associations de calculer un bilan carbone, de suivre leurs
          événements et de présenter les membres de leur mandat. Les résultats sont des estimations
          fournies à titre indicatif : ils ne constituent pas un bilan réglementaire.
        </p>
      </Section>

      <Section title="Sources des données d'émissions">
        <p>
          Les facteurs d&apos;émission proviennent de l&apos;API publique{" "}
          <a href="https://impactco2.fr" className={link}>
            Impact CO2
          </a>{" "}
          de l&apos;ADEME. L&apos;éditeur n&apos;est pas responsable de leur exactitude ni de leurs
          évolutions.
        </p>
      </Section>

      <Section title="Propriété intellectuelle">
        <p>
          Le logo, les textes, les illustrations et le code du site sont la propriété de
          l&apos;éditeur, sauf mention contraire. Toute reproduction sans autorisation écrite est
          interdite. Les photos des membres et les images des événements restent la propriété de
          leurs auteurs et sont publiées avec leur accord.
        </p>
      </Section>

      <Section title="Responsabilité">
        <p>
          L&apos;éditeur s&apos;efforce de garder le site accessible et à jour, sans garantie de
          disponibilité continue. Il ne peut être tenu responsable d&apos;un dommage résultant de
          l&apos;utilisation du site ou de l&apos;indisponibilité d&apos;un service tiers (Discord,
          Supabase, Impact CO2).
        </p>
      </Section>

      <Section title="Données personnelles et cookies">
        <p>
          Le traitement des données personnelles et l&apos;usage des cookies sont détaillés dans la{" "}
          <a href="/confidentialite" className={link}>
            politique de confidentialité
          </a>
          .
        </p>
      </Section>

      <Section title="Droit applicable">
        <p>Le site est soumis au droit français. Tout litige relève des tribunaux français.</p>
      </Section>
    </LegalPage>
  );
}
