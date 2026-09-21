// Les dates du site sont des heures de Paris sans fuseau ; Discord attend un instant exact.
// Cette conversion ne dépend pas du fuseau de la machine (serveur, navigateur ou CI).
export function parisToDate(local: string): Date {
  const [datePart, timePart] = local.split("T");
  const [y, m, d] = datePart.split("-").map(Number);
  const [h, mi, s = 0] = timePart.split(":").map(Number);
  const guess = Date.UTC(y, m - 1, d, h, mi, s);

  const format = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Paris",
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const offsetAt = (ts: number) => {
    const parts = format.formatToParts(new Date(ts));
    const get = (type: string) => Number(parts.find((p) => p.type === type)!.value);
    return (
      Date.UTC(
        get("year"),
        get("month") - 1,
        get("day"),
        get("hour"),
        get("minute"),
        get("second"),
      ) - ts
    );
  };

  let ts = guess - offsetAt(guess);
  ts = guess - offsetAt(ts);
  return new Date(ts);
}
