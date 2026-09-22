import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "../og-image";
import { OG_LOGO_DATA_URL } from "../og-logo";

export const alt = "Événements";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOgImage({
    logoSrc: OG_LOGO_DATA_URL,
    eyebrow: "Événements",
    title: "Les prochains événements de l'association",
    subtitle: "Dates, lieu et compte à rebours pour chaque événement.",
  });
}
