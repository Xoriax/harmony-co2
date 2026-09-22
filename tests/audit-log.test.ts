import { describe, expect, it } from "vitest";
import { auditActionLabel, type AuditAction } from "@/lib/audit-log";

describe("auditActionLabel", () => {
  const actions: AuditAction[] = [
    "login",
    "logout",
    "bilan_create",
    "event_create",
    "event_update",
    "event_delete",
    "mandat_create",
    "mandat_update",
    "mandat_delete",
  ];

  it("fournit un libellé français non vide pour chaque action connue", () => {
    for (const action of actions) {
      const label = auditActionLabel(action);
      expect(label).toBeTruthy();
      expect(label).not.toBe(action);
    }
  });
});
