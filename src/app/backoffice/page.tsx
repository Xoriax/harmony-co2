import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export default async function BackofficePage() {
  if (!(await getSession())) redirect("/connexion");

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-12">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold">Backoffice</h1>
        <Link
          href="/"
          className="flex h-10 items-center rounded-full border border-black/[.15] px-4 text-sm transition-colors hover:bg-black/[.05] dark:border-white/[.25] dark:hover:bg-white/[.1]"
        >
          Accueil
        </Link>
      </div>
    </main>
  );
}
