import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { TEAMS } from "@/lib/mandat-format";
import { getMember, listMembers } from "@/lib/mandat";
import { pageMetadata } from "@/lib/seo";
import { SiteHeader } from "../../site-header";
import { PageFallback } from "../../page-fallback";
import { BackofficeTabs } from "../tabs";
import DeleteMemberButton from "./delete-member-button";
import MemberForm from "./member-form";

export const metadata: Metadata = pageMetadata({
  title: "Backoffice · Mandat",
  description: "Gestion des membres du mandat, réservée aux administrateurs.",
  path: "/backoffice/mandat",
  noIndex: true,
});

async function BackofficeMandatContent({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  await requireAdmin();

  const { edit } = await searchParams;
  const [{ members, error }, editing] = await Promise.all([
    listMembers(),
    edit ? getMember(edit) : Promise.resolve(null),
  ]);

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="grain border-b border-ink/10">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-10">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-forest/25 bg-cream-soft px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-forest">
              <span className="h-2 w-2 rounded-full bg-emerald" />
              Backoffice
            </span>
            <h1 className="font-display text-4xl font-extrabold tracking-tight text-night sm:text-5xl">
              Gérer le mandat
            </h1>
            <p className="max-w-[56ch] text-lg text-ink/80">
              Ajoute les membres du Responsable RSE et du Bureau restreint, et choisis ce qui
              s&apos;affiche sur chaque carte.
            </p>
            <BackofficeTabs active="mandat" />
          </div>
        </section>

        <div className="mx-auto grid max-w-6xl items-start gap-8 px-5 py-10 lg:grid-cols-[380px_1fr]">
          <section className="rounded-3xl border-2 border-forest bg-cream-soft p-6 lg:sticky lg:top-24">
            <h2 className="mb-5 font-display text-2xl font-bold text-night">
              {editing ? "Modifier le membre" : "Nouveau membre"}
            </h2>
            <MemberForm key={editing?.id ?? "new"} member={editing ?? undefined} />
          </section>

          <div className="flex flex-col gap-8">
            {error && (
              <p
                role="alert"
                className="rounded-2xl border-2 border-red-700/30 bg-red-50 px-5 py-4 font-medium text-red-800"
              >
                {error}
              </p>
            )}

            {!error && members.length === 0 && (
              <p className="rounded-2xl border border-dashed border-ink/25 px-5 py-8 text-center text-ink/70">
                Aucun membre pour l&apos;instant. Ajoute le premier avec le formulaire.
              </p>
            )}

            {TEAMS.map((team) => {
              const list = members.filter((m) => m.team === team.value);
              return (
                <section key={team.value} className="flex flex-col gap-4">
                  <h2 className="font-display text-2xl font-bold text-night">
                    {team.label} <span className="text-ink/50">({list.length})</span>
                  </h2>
                  {list.length === 0 && !error && (
                    <p className="text-sm text-ink/65">Personne dans ce groupe.</p>
                  )}
                  <ul className="flex flex-col gap-4">
                    {list.map((m) => (
                      <li
                        key={m.id}
                        className={`flex gap-4 rounded-3xl border-2 bg-cream-soft p-4 ${
                          editing?.id === m.id ? "border-blue" : "border-ink/10"
                        }`}
                      >
                        <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-2xl bg-black">
                          {m.photo_url ? (
                            <Image
                              src={m.photo_url}
                              alt=""
                              fill
                              sizes="80px"
                              className="object-cover"
                            />
                          ) : (
                            <span className="absolute inset-0 flex items-center justify-center font-display text-3xl font-extrabold text-leaf">
                              {m.name.slice(0, 1).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col gap-2">
                          <div>
                            <h3 className="truncate font-display text-xl font-bold text-night">
                              {m.name}
                            </h3>
                            <p className="truncate text-sm font-medium text-forest">{m.role}</p>
                          </div>
                          <ul className="flex flex-wrap gap-1.5 text-xs font-semibold">
                            {(
                              [
                                ["Photo", m.show_photo, Boolean(m.photo_url)],
                                ["E-mail", m.show_email, Boolean(m.email)],
                                ["Discord", m.show_discord, Boolean(m.discord)],
                              ] as const
                            ).map(([label, shown, filled]) => (
                              <li
                                key={label}
                                className={`rounded-full px-2.5 py-1 ${
                                  shown && filled
                                    ? "bg-emerald/25 text-forest"
                                    : "bg-ink/10 text-ink/60 line-through"
                                }`}
                                title={
                                  !filled
                                    ? "Non renseigné"
                                    : shown
                                      ? "Affiché sur la carte"
                                      : "Masqué sur la carte"
                                }
                              >
                                {label}
                              </li>
                            ))}
                          </ul>
                          <div className="flex flex-wrap gap-3 pt-1">
                            <Link
                              href={`/backoffice/mandat?edit=${m.id}`}
                              className="flex h-10 items-center rounded-full border-2 border-night/80 px-4 text-sm font-semibold text-night transition-colors hover:bg-night hover:text-cream"
                            >
                              Modifier
                            </Link>
                            <DeleteMemberButton id={m.id} name={m.name} />
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
        </div>
      </main>
    </>
  );
}

export default function BackofficeMandatPage(props: { searchParams: Promise<{ edit?: string }> }) {
  return (
    <Suspense fallback={<PageFallback />}>
      <BackofficeMandatContent {...props} />
    </Suspense>
  );
}
