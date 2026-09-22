import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "../og-image";
import { OG_LOGO_DATA_URL } from "../og-logo";

export const alt = "Calculer mon bilan carbone";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOgImage({
    logoSrc: OG_LOGO_DATA_URL,
    eyebrow: "Bilan carbone",
    title: "Calcule le bilan carbone de ton association",
    subtitle: "Sélectionne tes catégories, renseigne tes quantités, exporte en PDF ou en Excel.",
  });
}
