"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { removeBilan } from "@/lib/bilans";
import { getSession } from "@/lib/session";

export async function deleteBilan(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/connexion");

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await removeBilan(id, session.id);
  revalidatePath("/historique");
}
