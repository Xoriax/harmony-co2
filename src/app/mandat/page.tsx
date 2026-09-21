import Image from "next/image";
import { TEAMS, type MemberRow } from "@/lib/mandat-format";
import { listMembers } from "@/lib/mandat";
import { GlobeScene } from "../globe-scene";
import LeafLayer from "../leaf-layer";
import { DARK_LEAVES } from "../leaf-presets";
import { LeafPage } from "../leaf-page";
import { SiteHeader } from "../site-header";
import TiltCard from "../tilt-card";

const TONES = ["bg-leaf", "bg-sky", "bg-gold", "bg-emerald", "bg-blue"];

function DiscordIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="currentColor" aria-hidden="true">
      <path d="M20.3 4.4A19.8 19.8 0 0 0 15.4 3l-.2.5a18.3 18.3 0 0 0-6.4 0L8.6 3a19.7 19.7 0 0 0-4.9 1.5C.6 9.1-.3 13.6.1 18.1a19.9 19.9 0 0 0 6 3l1.3-2.1c-.7-.3-1.4-.6-2-1l.5-.4a14.2 14.2 0 0 0 12.2 0l.5.4c-.6.4-1.3.7-2 1l1.3 2.1a19.9 19.9 0 0 0 6-3c.5-5.2-.8-9.7-3.6-13.7ZM8 15.4c-1.2 0-2.1-1.1-2.1-2.4s.9-2.4 2.1-2.4 2.1 1.1 2.1 2.4-.9 2.4-2.1 2.4Zm8 0c-1.2 0-2.1-1.1-2.1-2.4s.9-2.4 2.1-2.4 2.1 1.1 2.1 2.4-.9 2.4-2.1 2.4Z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

// Les éléments masqués ne sont pas rendus : rien n'en sort vers le navigateur.
function MemberCard({ member, index }: { member: MemberRow; index: number }) {
  const showEmail = member.show_email && member.email;
  const showDiscord = member.show_discord && member.discord;
  const tone = TONES[index % TONES.length];
  const leaf = (
    <span
      className={`sway block h-11 w-11 shrink-0 rounded-[0_100%_0_100%] border-2 border-ink ${tone}`}
    />
  );

  return (
    <li className="rise" style={{ animationDelay: `${index * 90}ms` }}>
      <TiltCard className="flex flex-col gap-5 rounded-[2rem] border border-ink/10 bg-cream-soft p-4 text-ink">
        {member.show_photo && (
          <div className="depth-1 relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2.75rem_0.75rem_2.75rem_0.75rem] bg-black">
              {member.photo_url ? (
                <Image
                  src={member.photo_url}
                  alt={`Photo de ${member.name}`}
                  fill
                  sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
              ) : (
                <>
                  <span className="absolute -left-10 -top-10 h-40 w-40 rounded-full border-[18px] border-forest/70" />
                  <span className="absolute inset-0 flex items-center justify-center font-display text-8xl font-extrabold text-leaf">
                    {member.name.slice(0, 1).toUpperCase()}
                  </span>
                </>
              )}
            </div>
            <span className="depth-3 absolute -bottom-4 right-5">{leaf}</span>
          </div>
        )}

        <div className="depth-2 flex items-start gap-3 px-2">
          {!member.show_photo && leaf}
          <div className="flex min-w-0 flex-col gap-2">
            <h3 className="font-display text-2xl font-extrabold leading-tight text-night">
              {member.name}
            </h3>
            <p className="w-fit rounded-full bg-leaf/45 px-3 py-1 text-sm font-semibold text-forest">
              {member.role}
            </p>
          </div>
        </div>

        {(showEmail || showDiscord) && (
          <ul className="depth-2 flex flex-col gap-2 px-2 pb-2 text-sm">
            {showEmail && (
              <li>
                <a
                  href={`mailto:${member.email}`}
                  className="flex items-center gap-3 rounded-xl border border-ink/10 bg-cream px-3 py-2.5 font-medium transition-colors hover:border-blue hover:text-blue"
                >
                  <MailIcon />
                  <span className="min-w-0 break-all">{member.email}</span>
                </a>
              </li>
            )}
            {showDiscord && (
              <li className="flex items-center gap-3 rounded-xl border border-ink/10 bg-cream px-3 py-2.5 font-medium">
                <span className="text-[#5865f2]">
                  <DiscordIcon />
                </span>
                <span className="min-w-0 break-all">{member.discord}</span>
              </li>
            )}
          </ul>
        )}
      </TiltCard>
    </li>
  );
}

export default async function MandatPage() {
  const { members, error } = await listMembers();
  const groups = TEAMS.map((team) => ({
    ...team,
    list: members.filter((m) => m.team === team.value),
  })).filter((g) => g.list.length > 0);

  return (
    <>
      <SiteHeader />
      <LeafPage>
        <section className="grain overflow-hidden border-b border-ink/10">
          <div className="mx-auto grid max-w-6xl items-center gap-8 px-5 py-12 md:grid-cols-[1.2fr_1fr] md:py-16">
            <div className="flex flex-col gap-5">
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-forest/25 bg-cream-soft px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-forest">
                <span className="h-2 w-2 rounded-full bg-emerald" />
                Mandat
              </span>
              <h1 className="font-display text-5xl font-extrabold leading-[1.02] tracking-tight text-night [text-wrap:balance] sm:text-6xl">
                L&apos;équipe du{" "}
                <span className="relative whitespace-nowrap text-forest">
                  mandat
                  <span className="absolute -bottom-1 left-0 -z-10 h-3 w-full -skew-x-12 rounded-sm bg-leaf/70" />
                </span>
              </h1>
              <p className="max-w-[48ch] text-lg leading-relaxed text-ink/80">
                Le Responsable RSE et le Bureau restreint : qui fait quoi, et comment les
                contacter.
              </p>
            </div>
            <div className="hidden w-full max-w-[300px] justify-self-center md:block">
              <GlobeScene small />
            </div>
          </div>
        </section>

        {error && (
          <div className="mx-auto max-w-6xl px-5 py-12">
            <p
              role="alert"
              className="rounded-2xl border-2 border-red-700/30 bg-red-50 px-5 py-4 font-medium text-red-800"
            >
              Impossible de charger l&apos;équipe, réessaie plus tard.
            </p>
          </div>
        )}

        {!error && members.length === 0 && (
          <div className="mx-auto max-w-6xl px-5 py-12">
            <p className="text-ink/70">Aucun membre pour le moment.</p>
          </div>
        )}

        {groups.map((group, gi) => {
          const dark = gi % 2 === 0;
          return (
            <section
              key={group.value}
              className={`relative overflow-hidden ${dark ? "bg-forest text-cream" : ""}`}
            >
              {dark && (
                <>
                  <LeafLayer leaves={DARK_LEAVES} />
                  <span className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border-[28px] border-emerald/40" />
                  <span className="pointer-events-none absolute -bottom-28 left-10 h-60 w-60 rounded-full border-[22px] border-leaf/20" />
                </>
              )}
              <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-10 px-5 py-14 md:py-20">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div className="flex flex-col gap-2">
                    <span
                      className={`text-xs font-semibold uppercase tracking-[0.14em] ${
                        dark ? "text-leaf" : "text-emerald"
                      }`}
                    >
                      {group.list.length} membre{group.list.length > 1 ? "s" : ""}
                    </span>
                    <h2
                      className={`font-display text-4xl font-extrabold tracking-tight md:text-5xl ${
                        dark ? "text-cream" : "text-night"
                      }`}
                    >
                      {group.label}
                    </h2>
                  </div>
                  <span
                    aria-hidden="true"
                    className={`hidden h-1.5 w-40 rounded-full sm:block ${
                      dark ? "bg-leaf/60" : "bg-forest/25"
                    }`}
                  />
                </div>
                <ul
                  className="grid items-start gap-8 sm:grid-cols-2 lg:grid-cols-3"
                  style={{ perspective: "1200px" }}
                >
                  {group.list.map((m, i) => (
                    <MemberCard key={m.id} member={m} index={i} />
                  ))}
                </ul>
              </div>
            </section>
          );
        })}
      </LeafPage>
    </>
  );
}
