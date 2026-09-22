// Lit et valide le formulaire des réglages (backoffice). Fonction pure : elle ne touche ni la
// base ni le cache, ce qui permet de la tester seule. Chaque champ est facultatif (laisser vide
// désactive la comparaison ou l'alerte correspondante) ; `error` vaut null quand tout est valide.
export function parseSettingsForm(formData: FormData) {
  const text = (key: string) => String(formData.get(key) ?? "").trim();
  const values = {
    goalTotal: text("goalTotal"),
    goalLabel: text("goalLabel"),
    alertThreshold: text("alertThreshold"),
  };

  const toNumberOrNull = (value: string): number | null | undefined => {
    if (value === "") return null;
    const n = Number(value.replace(",", "."));
    return Number.isFinite(n) && n >= 0 ? n : undefined;
  };

  const goalTotal = toNumberOrNull(values.goalTotal);
  const alertThreshold = toNumberOrNull(values.alertThreshold);

  let error: string | null = null;
  if (goalTotal === undefined) error = "L'objectif doit être un nombre positif, ou vide.";
  else if (values.goalLabel.length > 60) error = "Le libellé ne doit pas dépasser 60 caractères.";
  else if (alertThreshold === undefined)
    error = "Le seuil d'alerte doit être un nombre positif, ou vide.";

  return {
    values,
    patch: { goalTotal, goalLabel: values.goalLabel || null, alertThreshold },
    error,
  };
}
