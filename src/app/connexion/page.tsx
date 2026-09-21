import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import LoginForm from "./login-form";

export default async function ConnexionPage() {
  if (await getSession()) redirect("/backoffice");

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6">
      <h1 className="text-3xl font-semibold">Connexion</h1>
      <LoginForm />
    </main>
  );
}
