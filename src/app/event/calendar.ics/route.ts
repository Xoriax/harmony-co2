import { NextResponse, type NextRequest } from "next/server";
import { eventStatus, nowParisFull } from "@/lib/event-format";
import { listEvents } from "@/lib/events";
import { eventsToIcsCalendar } from "@/lib/ics";
import { siteUrl } from "@/lib/seo";

// Fichier iCalendar : un événement (?id=...) ou tous les événements publiés à venir/en cours (le
// bouton « Ajouter au calendrier » de chaque carte et le lien d'abonnement de la page Event).
export async function GET(request: NextRequest) {
  const { events, error } = await listEvents({ publishedOnly: true });
  if (error) return new NextResponse(error, { status: 503 });

  const id = request.nextUrl.searchParams.get("id");
  const now = nowParisFull();
  const selected = id
    ? events.filter((event) => event.id === id)
    : events.filter((event) => eventStatus(event, now) !== "ended");

  if (id && selected.length === 0) {
    return new NextResponse("Événement introuvable.", { status: 404 });
  }

  const body = eventsToIcsCalendar(selected, siteUrl());
  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="harmony-co2-evenements.ics"',
      "Cache-Control": "no-store",
    },
  });
}
