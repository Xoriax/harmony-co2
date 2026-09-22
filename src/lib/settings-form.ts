// Lit et valide le formulaire des réglages (backoffice). Fonction pure : elle ne touche ni la
// base ni le cache, ce qui permet de la tester seule. Chaque champ est facultatif (laisser vide
// désactive la comparaison, l'alerte ou la purge correspondante) ; `error` vaut null quand tout
// est valide.
export function parseSettingsForm(formData: FormData) {
  const text = (key: string) => String(formData.get(key) ?? "").trim();
  const values = {
    goalTotal: text("goalTotal"),
    goalLabel: text("goalLabel"),
    alertThreshold: text("alertThreshold"),
    auditLogRetentionDays: text("auditLogRetentionDays"),
    webVitalsRetentionDays: text("webVitalsRetentionDays"),
  };

  const toNumberOrNull = (value: string): number | null | undefined => {
    if (value === "") return null;
    const n = Number(value.replace(",", "."));
    return Number.isFinite(n) && n >= 0 ? n : undefined;
  };

  // Durée de conservation : un nombre de jours entier et strictement positif, ou vide (conservé
  // indéfiniment). Pas de décimales ni de zéro (ça purgerait tout à chaque passage du job).
  const toDaysOrNull = (value: string): number | null | undefined => {
    if (value === "") return null;
    const n = Number(value);
    return Number.isInteger(n) && n > 0 ? n : undefined;
  };

  const goalTotal = toNumberOrNull(values.goalTotal);
  const alertThreshold = toNumberOrNull(values.alertThreshold);
  const auditLogRetentionDays = toDaysOrNull(values.auditLogRetentionDays);
  const webVitalsRetentionDays = toDaysOrNull(values.webVitalsRetentionDays);

  let error: string | null = null;
  if (goalTotal === undefined) error = "L'objectif doit être un nombre positif, ou vide.";
  else if (values.goalLabel.length > 60) error = "Le libellé ne doit pas dépasser 60 caractères.";
  else if (alertThreshold === undefined)
    error = "Le seuil d'alerte doit être un nombre positif, ou vide.";
  else if (auditLogRetentionDays === undefined)
    error = "La conservation du journal doit être un nombre de jours entier positif, ou vide.";
  else if (webVitalsRetentionDays === undefined)
    error =
      "La conservation des mesures de performance doit être un nombre de jours entier positif, ou vide.";

  return {
    values,
    patch: {
      goalTotal,
      goalLabel: values.goalLabel || null,
      alertThreshold,
      auditLogRetentionDays,
      webVitalsRetentionDays,
    },
    error,
  };
}
