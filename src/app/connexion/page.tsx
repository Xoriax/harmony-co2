import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import LeafLayer from "../leaf-layer";
import { sideLeaves } from "../leaf-presets";
import { SiteHeader } from "../site-header";
import { PageFallback } from "../page-fallback";

const ERRORS: Record<string, string> = {
  not_member: "Ton compte Discord n'est pas membre du serveur : connexion refusée.",
  denied: "Connexion annulée sur Discord.",
  state: "La connexion a expiré, réessaie.",
  failed: "Discord n'a pas répondu correctement, réessaie dans un instant.",
  config: "La connexion Discord n'est pas configurée (variables d'environnement manquantes).",
};

async function ConnexionContent({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const session = await getSession();
  if (session) redirect(session.admin ? "/backoffice" : "/");

  const { error } = await searchParams;
  const message = error ? (ERRORS[error] ?? ERRORS.failed) : null;

  return (
    <>
      <SiteHeader />
      <main className="grain relative flex flex-1 items-center justify-center px-5 py-16">
        <LeafLayer leaves={sideLeaves("connexion")} />
        <div className="relative z-10 flex w-full max-w-md flex-col gap-6 rounded-3xl border border-ink/10 bg-cream-soft p-8 shadow-[0_30px_50px_-32px_rgb(20_37_54/0.5)]">
          <div className="flex flex-col gap-2">
            <h1 className="font-display text-4xl font-extrabold tracking-tight text-night">
              Connexion
            </h1>
            <p className="leading-relaxed text-ink/80">
              Connecte-toi avec ton compte Discord. Seuls les membres du serveur peuvent se
              connecter.
            </p>
          </div>

          {message && (
            <p
              role="alert"
              className="rounded-xl border border-red-700/30 bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
            >
              {message}
            </p>
          )}

          {/* Lien classique (pas de prefetch) : la route redirige vers Discord. */}
          <a
            href="/connexion/discord"
            className="flex h-12 items-center justify-center gap-3 rounded-full bg-[#5865f2] px-6 font-semibold text-white transition-transform hover:-translate-y-0.5"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true">
              <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
            </svg>
            Se connecter avec Discord
          </a>

          <p className="text-sm text-ink/65">
            Les membres avec le rôle autorisé accèdent au backoffice. Les autres restent connectés
            avec leur pseudo.
          </p>
        </div>
      </main>
    </>
  );
}

export default function ConnexionPage(props: { searchParams: Promise<{ error?: string }> }) {
  return (
    <Suspense fallback={<PageFallback />}>
      <ConnexionContent {...props} />
    </Suspense>
  );
}
