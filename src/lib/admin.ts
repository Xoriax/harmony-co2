import "server-only";
import { redirect } from "next/navigation";
import { getSession } from "./session";

// À appeler en tête de chaque action ou page du backoffice.
export async function requireAdmin() {
  const session = await getSession();
  if (!session) redirect("/connexion");
  if (!session.admin) redirect("/");
  return session;
}
