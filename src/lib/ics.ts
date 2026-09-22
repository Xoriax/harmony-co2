import { eventEnd, type EventRow } from "./event-format";
import { parisToDate } from "./paris-time";

const icsDate = (date: Date) => date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

// RFC 5545 : antislash, point-virgule, virgule et saut de ligne doivent être échappés dans le
// texte libre (SUMMARY, DESCRIPTION, LOCATION).
const escapeIcsText = (text: string) =>
  text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

function eventToIcs(event: EventRow, siteUrl: string, now: Date): string {
  return [
    "BEGIN:VEVENT",
    `UID:${event.id}@harmony-co2`,
    `DTSTAMP:${icsDate(now)}`,
    `DTSTART:${icsDate(parisToDate(event.starts_at))}`,
    `DTEND:${icsDate(parisToDate(eventEnd(event)))}`,
    `SUMMARY:${escapeIcsText(event.title)}`,
    `DESCRIPTION:${escapeIcsText(event.description)}`,
    `LOCATION:${escapeIcsText(event.location || "Lieu à préciser")}`,
    `URL:${siteUrl}/event`,
    "END:VEVENT",
  ].join("\r\n");
}

// Calendrier iCalendar (RFC 5545) pour un ou plusieurs événements, à ajouter à un agenda ou à
// suivre comme calendrier abonné. `now` est un paramètre (et non `new Date()` en dur) pour rester
// testable.
export function eventsToIcsCalendar(
  events: EventRow[],
  siteUrl: string,
  now: Date = new Date(),
): string {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Harmony CO2//Événements//FR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    ...events.map((event) => eventToIcs(event, siteUrl, now)),
    "END:VCALENDAR",
  ].join("\r\n");
}
