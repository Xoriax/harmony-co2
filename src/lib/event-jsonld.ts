import { eventEnd, eventStatus, type EventRow } from "./event-format";
import { parisToDate } from "./paris-time";

export type EventJsonLd = {
  "@context": "https://schema.org";
  "@type": "Event";
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  eventStatus: string;
  eventAttendanceMode: string;
  location: { "@type": "Place"; name: string };
  image?: string[];
  organizer: { "@type": "Organization"; name: string; url: string };
  url: string;
};

// Données structurées (schema.org/Event) pour les événements publiés et pas encore terminés :
// Google déconseille de lister des événements passés dans les données structurées. Il n'y a pas
// de page dédiée par événement : `url` pointe vers la page Event, qui les liste tous.
export function eventsJsonLd(
  events: EventRow[],
  now: string,
  siteUrl: string,
  siteName: string,
): EventJsonLd[] {
  return events
    .filter((event) => eventStatus(event, now) !== "ended")
    .map((event) => ({
      "@context": "https://schema.org",
      "@type": "Event",
      name: event.title,
      description: event.description,
      startDate: parisToDate(event.starts_at).toISOString(),
      endDate: parisToDate(eventEnd(event)).toISOString(),
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      location: { "@type": "Place", name: event.location || "Lieu à préciser" },
      ...(event.cover_url && { image: [event.cover_url] }),
      organizer: { "@type": "Organization", name: siteName, url: siteUrl },
      url: `${siteUrl}/event`,
    }));
}
