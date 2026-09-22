import type { EventRow } from "@/lib/event-format";
import { eventsJsonLd } from "@/lib/event-jsonld";
import { SITE_NAME, siteUrl } from "@/lib/seo";

// Données structurées (schema.org/Event), pour un affichage enrichi dans les résultats Google.
export default function EventsJsonLd({ events, now }: { events: EventRow[]; now: string }) {
  const data = eventsJsonLd(events, now, siteUrl(), SITE_NAME);
  if (data.length === 0) return null;

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}
