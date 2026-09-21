import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-10 px-6 py-16">
      <Image
        src="/logo.svg"
        alt="Logo Harmony"
        width={280}
        height={280}
        priority
      />
      <div className="flex w-full max-w-xs flex-col gap-4 text-base font-medium sm:max-w-md sm:flex-row">
        <Link
          href="/connexion"
          className="flex h-12 flex-1 items-center justify-center rounded-full bg-foreground px-5 text-background transition-opacity hover:opacity-80"
        >
          Connect
        </Link>
        <Link
          href="/bilan"
          className="flex h-12 flex-1 items-center justify-center rounded-full border border-solid border-black/[.15] px-5 transition-colors hover:bg-black/[.05] dark:border-white/[.25] dark:hover:bg-white/[.1]"
        >
          Mon bilan
        </Link>
        <Link
          href="/event"
          className="flex h-12 flex-1 items-center justify-center rounded-full border border-solid border-black/[.15] px-5 transition-colors hover:bg-black/[.05] dark:border-white/[.25] dark:hover:bg-white/[.1]"
        >
          Event
        </Link>
      </div>
    </main>
  );
}
