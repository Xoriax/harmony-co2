"use server";

import { redirect } from "next/navigation";
import { createSession } from "@/lib/session";

// Identifiants fixes temporaires, à remplacer par Supabase Auth.
const USER = "admin";
const PASSWORD = "admin123";

export async function login(
  _prevState: { error: string } | null,
  formData: FormData,
) {
  const user = formData.get("user");
  const password = formData.get("password");

  if (user !== USER || password !== PASSWORD) {
    return { error: "Identifiant ou mot de passe incorrect." };
  }

  await createSession(USER);
  redirect("/backoffice");
}
