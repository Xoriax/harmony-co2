import Image from "next/image";
import Link from "next/link";
import { avatarUrl } from "@/lib/discord";
import { getSession } from "@/lib/session";
import { logout } from "./connexion/actions";

export async function SiteHeader() {
  const session = await getSession();
  const avatar = session ? avatarUrl(session.avatar) : null;

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
          <Link href="/event" className="hover:text-blue">Event</Link>
          <Link href="/mandat" className="hover:text-blue">Mandat</Link>
        </div>

        {session ? (
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
        ) : (
          <Link
            href="/connexion"
            className="rounded-full bg-night px-5 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-blue"
          >
            Connexion
          </Link>
        )}
      </nav>
    </header>
  );
}
