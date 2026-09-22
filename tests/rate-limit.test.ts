import { describe, expect, it } from "vitest";
import { clientIp } from "@/lib/rate-limit";

describe("clientIp", () => {
  it("prend la première IP de x-forwarded-for", () => {
    const headers = new Headers({ "x-forwarded-for": "203.0.113.5, 10.0.0.1" });
    expect(clientIp(headers)).toBe("203.0.113.5");
  });

  it("retombe sur x-real-ip si x-forwarded-for est absent", () => {
    const headers = new Headers({ "x-real-ip": "198.51.100.7" });
    expect(clientIp(headers)).toBe("198.51.100.7");
  });

  it('retombe sur "unknown" si aucun en-tête n\'est présent', () => {
    expect(clientIp(new Headers())).toBe("unknown");
  });
});
