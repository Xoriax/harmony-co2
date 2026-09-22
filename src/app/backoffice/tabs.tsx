import Link from "next/link";

const TABS = [
  { href: "/backoffice", key: "events", label: "Événements" },
  { href: "/backoffice/mandat", key: "mandat", label: "Mandat" },
  { href: "/backoffice/statistiques", key: "statistiques", label: "Statistiques" },
  { href: "/backoffice/journal", key: "journal", label: "Journal" },
  { href: "/backoffice/reglages", key: "reglages", label: "Réglages" },
] as const;

export function BackofficeTabs({ active }: { active: (typeof TABS)[number]["key"] }) {
  return (
    <nav aria-label="Sections du backoffice" className="flex flex-wrap gap-2 pt-2">
      {TABS.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          aria-current={tab.key === active ? "page" : undefined}
          className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
            tab.key === active
              ? "bg-night text-cream"
              : "border-2 border-night/30 text-night hover:border-night"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
