import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "../og-image";
import { OG_LOGO_DATA_URL } from "../og-logo";

export const alt = "Le mandat";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOgImage({
    logoSrc: OG_LOGO_DATA_URL,
    eyebrow: "L'équipe",
    title: "Le Responsable RSE et le Bureau restreint",
    subtitle: "Qui fait quoi dans l'association, et comment les contacter.",
  });
}
