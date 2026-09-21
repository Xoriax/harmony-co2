// Les dates sont stockées sans fuseau (heure locale saisie) : on les formate en UTC pour ne rien décaler.
export type EventRow = {
  id: string;
  title: string;
  description: string;
  location: string;
  starts_at: string;
  ends_at: string | null;
  published: boolean;
  cover_url: string | null;
};

const asDate = (value: string) => new Date(`${value.slice(0, 16)}:00Z`);

export function formatEventDate(value: string) {
  return asDate(value).toLocaleString("fr-FR", {
    timeZone: "UTC",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function eventDay(value: string) {
  const d = asDate(value);
  return {
    day: d.toLocaleString("fr-FR", { timeZone: "UTC", day: "2-digit" }),
    month: d.toLocaleString("fr-FR", { timeZone: "UTC", month: "short" }).replace(".", ""),
    time: d.toLocaleString("fr-FR", { timeZone: "UTC", hour: "2-digit", minute: "2-digit" }),
  };
}

// Valeur pour <input type="datetime-local">.
export const toInputValue = (value: string | null) => (value ? value.slice(0, 16) : "");

// Heure actuelle à Paris, au même format que starts_at, pour comparer "à venir" / "passé".
export function nowParis() {
  return new Date()
    .toLocaleString("sv-SE", { timeZone: "Europe/Paris" })
    .replace(" ", "T")
    .slice(0, 16);
}

export function formatShortDate(value: string) {
  return asDate(value).toLocaleDateString("fr-FR", {
    timeZone: "UTC",
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatTime(value: string) {
  return asDate(value).toLocaleTimeString("fr-FR", {
    timeZone: "UTC",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export type EventStatus = "live" | "upcoming" | "ended";

// Heure de Paris avec les secondes, au même format que les dates stockées ("AAAA-MM-JJTHH:mm:ss").
export function nowParisFull() {
  return new Date()
    .toLocaleString("sv-SE", { timeZone: "Europe/Paris" })
    .replace(" ", "T");
}

const full = (value: string) => (value.length === 16 ? `${value}:00` : value.slice(0, 19));

// La fin est obligatoire ; pour d'anciens événements sans fin, on retient la fin de la journée de début.
export function eventEnd(event: EventRow) {
  return event.ends_at ? full(event.ends_at) : `${event.starts_at.slice(0, 10)}T23:59:59`;
}

export function eventStatus(event: EventRow, now: string): EventStatus {
  const current = full(now);
  if (current < full(event.starts_at)) return "upcoming";
  return current < eventEnd(event) ? "live" : "ended";
}

export function remainingMs(event: EventRow, now: string) {
  return Date.parse(`${eventEnd(event)}Z`) - Date.parse(`${full(now)}Z`);
}

export function formatCountdown(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const two = (n: number) => String(n).padStart(2, "0");
  return `${days > 0 ? `${days} j ` : ""}${two(hours)} h ${two(minutes)} min ${two(seconds)} s`;
}
