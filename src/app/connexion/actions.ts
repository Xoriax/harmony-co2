"use server";

import { redirect } from "next/navigation";
import { logAudit } from "@/lib/audit-log";
import { deleteSession, getSession } from "@/lib/session";

export async function logout() {
  const session = await getSession();
  if (session) await logAudit("logout", session);
  await deleteSession();
  redirect("/");
}
