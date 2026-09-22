"use server";

import { updateTag } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { parseSettingsForm } from "@/lib/settings-form";
import { saveSettings } from "@/lib/settings";

export type SettingsFormState = {
  error?: string;
  saved?: boolean;
  values?: Record<string, string>;
} | null;

export async function updateSettings(
  _prev: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  await requireAdmin();
  const { values, patch, error } = parseSettingsForm(formData);
  if (error) return { error, values };

  const ok = await saveSettings(patch);
  updateTag("settings");
  if (!ok) return { error: "L'enregistrement a échoué, réessaie.", values };
  return { saved: true, values };
}
