import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "./og-image";
import { OG_LOGO_DATA_URL } from "./og-logo";

export const alt = "Harmony CO2";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOgImage({
    logoSrc: OG_LOGO_DATA_URL,
    eyebrow: "Bilan carbone associatif",
    title: "Mesure l'impact de ton association",
    subtitle: "Calcule ton empreinte en kgCO2e et exporte-la en PDF ou en Excel.",
  });
}
