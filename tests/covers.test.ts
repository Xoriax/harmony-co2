import { describe, expect, it } from "vitest";
import { COVER_MAX_BYTES, validateCover } from "@/lib/covers";

const file = (type: string, bytes = 10) => new File([new Uint8Array(bytes)], "image", { type });

describe("validateCover", () => {
  it.each(["image/jpeg", "image/png", "image/webp", "image/gif"])("accepte %s", (type) => {
    expect(validateCover(file(type))).toBeNull();
  });

  it.each(["image/svg+xml", "application/pdf", "text/html", "application/octet-stream", ""])(
    "refuse le type %j (pas de SVG ni de HTML envoyés comme image)",
    (type) => {
      expect(validateCover(file(type))).toBe("L'image doit être au format JPG, PNG, WebP ou GIF.");
    },
  );

  it("accepte une image de 5 Mo pile et refuse au-delà", () => {
    expect(validateCover(file("image/png", COVER_MAX_BYTES))).toBeNull();
    expect(validateCover(file("image/png", COVER_MAX_BYTES + 1))).toBe(
      "L'image ne doit pas dépasser 5 Mo.",
    );
  });
});
