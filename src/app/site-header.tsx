import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { avatarUrl } from "@/lib/discord";
import { getSession } from "@/lib/session";
import { logout } from "./connexion/actions";

const loginClass =
  "rounded-full bg-night px-5 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-blue";

// Bloc dépendant de la session : il est le seul à lire le cookie, donc le reste de la page reste statique.
async function HeaderAuth() {
  const session = await getSession();
  if (!session) {
    return (
      <Link href="/connexion" className={loginClass}>
        Connexion
      </Link>
    );
  }

  const avatar = avatarUrl(session.avatar);
  return (
    <div className="flex items-center gap-2">
      {session.admin && (
        <Link
          href="/backoffice"
          className="rounded-full border-2 border-night/80 px-4 py-2 text-sm font-semibold text-night transition-colors hover:bg-night hover:text-cream"
        >
          Backoffice
        </Link>
      )}
      <span className="flex items-center gap-2 rounded-full bg-cream-soft py-1 pl-1 pr-4 text-sm font-semibold text-night">
        {avatar ? (
          <Image src={avatar} alt="" width={32} height={32} className="h-8 w-8 rounded-full" />
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-forest text-cream">
            {session.name.slice(0, 1).toUpperCase()}
          </span>
        )}
        <span className="max-w-28 truncate">{session.name}</span>
      </span>
      <form action={logout}>
        <button
          type="submit"
          className="rounded-full bg-night px-4 py-2 text-sm font-semibold text-cream transition-colors hover:bg-blue"
        >
          Se déconnecter
        </button>
      </form>
    </div>
  );
}

// Lien d'historique : visible seulement une fois connecté, donc lui aussi derrière Suspense.
async function HistoryLink() {
  const session = await getSession();
  if (!session) return null;
  return (
    <Link href="/historique" className="hover:text-blue">
      Historique
    </Link>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-ink/10 bg-cream/85 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo.svg" alt="Logo Harmony" width={44} height={44} priority />
          <span className="font-display text-xl font-bold tracking-tight text-night">
            Harmony
          </span>
        </Link>
        <div className="hidden items-center gap-8 text-sm font-medium md:flex">
          <Link href="/bilan" className="hover:text-blue">Mon bilan</Link>
          <Suspense fallback={null}>
            <HistoryLink />
          </Suspense>
          <Link href="/event" className="hover:text-blue">Event</Link>
          <Link href="/mandat" className="hover:text-blue">Mandat</Link>
        </div>

        {/* Le visiteur non connecté (cas courant) voit d'emblée le bouton « Connexion ». */}
        <Suspense
          fallback={
            <Link href="/connexion" className={loginClass}>
              Connexion
            </Link>
          }
        >
          <HeaderAuth />
        </Suspense>
      </nav>
    </header>
  );
}
