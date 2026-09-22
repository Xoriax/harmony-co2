import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

// Couleurs de src/app/globals.css (--cream, --cream-soft, --forest, --ink) : ImageResponse
// (satori) ne lit pas le CSS du site, ces valeurs sont donc répétées ici.
export function renderOgImage({
  logoSrc,
  eyebrow,
  title,
  subtitle,
}: {
  logoSrc: string;
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 28,
        padding: "80px 96px",
        background: "linear-gradient(135deg, #f6e9cf 0%, #fbf4e4 55%, #f6e9cf 100%)",
        color: "#142536",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- image générée hors de next/image, en dehors du DOM navigateur */}
        <img src={logoSrc} width={88} height={88} alt="" />
        <span style={{ fontSize: 30, fontWeight: 700, color: "#07504a" }}>Harmony CO2</span>
      </div>
      <span
        style={{
          fontSize: 22,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: 4,
          color: "#07504a",
        }}
      >
        {eyebrow}
      </span>
      <span style={{ fontSize: 62, fontWeight: 800, lineHeight: 1.08, maxWidth: 940 }}>
        {title}
      </span>
      <span style={{ fontSize: 28, color: "#142536cc", maxWidth: 840 }}>{subtitle}</span>
    </div>,
    { ...OG_SIZE },
  );
}
