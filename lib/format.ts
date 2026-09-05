/** Format an ISO date (YYYY-MM-DD) for display without timezone drift. */
export function formatEventDate(iso: string, opts?: { weekday?: boolean }): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, (m ?? 1) - 1, d ?? 1);
  return date.toLocaleDateString("en-US", {
    weekday: opts?.weekday ? "short" : undefined,
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
  });
}

export function formatDateRange(start: string, end?: string): string {
  if (!end || end === start) return formatEventDate(start, { weekday: true });
  return `${formatEventDate(start)} – ${formatEventDate(end)}`;
}

/** Parse an ISO date as local midnight. */
export function parseLocalDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function daysUntil(iso: string, from = new Date()): number {
  const target = parseLocalDate(iso);
  const start = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  return Math.round((target.getTime() - start.getTime()) / 86_400_000);
}

export function formatMinutes(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} hr ${m} min` : `${h} hr`;
}

export function relativeDayLabel(iso: string): string {
  const d = daysUntil(iso);
  if (d < 0) return "Past";
  if (d === 0) return "Today";
  if (d === 1) return "Tomorrow";
  if (d <= 7) return `In ${d} days`;
  if (d <= 14) return "Next week";
  if (d <= 31) return "This month";
  return "Upcoming";
}
