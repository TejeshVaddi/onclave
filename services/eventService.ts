import type { CulturalEvent, EventCategory, GeoPoint, Timeframe } from "@/types";
import { dataSource } from "./dataSource";
import { distanceMiles } from "@/lib/geo";
import { daysUntil, parseLocalDate } from "@/lib/format";
import { searchWithBackfill, type BackfillResult } from "@/lib/backfill";

export interface EventFilters {
  query?: string;
  heritages?: string[];
  categories?: EventCategory[];
  timeframe?: Timeframe;
  near?: GeoPoint;
  radiusMiles?: number;
  includeVirtual?: boolean;
  now?: Date;
}

export const EVENT_CATEGORIES: { id: EventCategory; label: string }[] = [
  { id: "festival", label: "Festivals" },
  { id: "religious", label: "Religious" },
  { id: "community", label: "Community" },
  { id: "workshop", label: "Workshops" },
  { id: "performance", label: "Performances" },
  { id: "food", label: "Food" },
];

export function eventCategoryLabel(id: EventCategory): string {
  return EVENT_CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

/** Inclusive day-offset window for a timeframe relative to `now`. */
export function timeframeWindow(tf: Timeframe, now = new Date()): [number, number] | null {
  if (!tf) return null;
  const dow = now.getDay(); // 0 = Sunday
  switch (tf) {
    case "today":
      return [0, 0];
    case "weekend": {
      // Next Saturday/Sunday (or the current weekend if we're in it).
      const toSat = dow === 0 ? -1 : (6 - dow) % 7;
      const start = Math.min(toSat, dow === 6 || dow === 0 ? 0 : toSat);
      const end = dow === 0 ? 0 : toSat + 1;
      return [start, end];
    }
    case "week":
      return [0, 7];
    case "month":
      return [0, 31];
  }
}

export function eventInTimeframe(e: CulturalEvent, tf: Timeframe, now = new Date()): boolean {
  const window = timeframeWindow(tf, now);
  if (!window) return true;
  const [min, max] = window;
  const start = daysUntil(e.date, now);
  const end = e.endDate ? daysUntil(e.endDate, now) : start;
  // Overlap check between [start, end] and [min, max]
  return end >= min && start <= max;
}

export function isUpcoming(e: CulturalEvent, now = new Date()): boolean {
  const last = e.endDate ?? e.date;
  return daysUntil(last, now) >= 0;
}

export function matchesEvent(e: CulturalEvent, f: EventFilters): boolean {
  const now = f.now ?? new Date();
  if (!isUpcoming(e, now)) return false;
  if (f.query) {
    const q = f.query.toLowerCase();
    const hay = `${e.name} ${e.description} ${e.city} ${e.venue} ${e.organizer} ${e.tags.join(" ")}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  if (f.heritages?.length && !e.heritages.some((h) => f.heritages!.includes(h))) return false;
  if (f.categories?.length && !f.categories.includes(e.category)) return false;
  if (f.timeframe && !eventInTimeframe(e, f.timeframe, now)) return false;
  if (f.includeVirtual === false && e.isVirtual) return false;
  if (f.near && f.radiusMiles && !e.isVirtual && e.geo) {
    if (distanceMiles(f.near, e.geo) > f.radiusMiles) return false;
  }
  return true;
}

export async function searchEvents(filters: EventFilters = {}, minResults = 0): Promise<BackfillResult<CulturalEvent>> {
  const all = await dataSource.getEvents();
  const result = searchWithBackfill(all, filters, matchesEvent, minResults);
  const items = [...result.items].sort(
    (a, b) => parseLocalDate(a.date).getTime() - parseLocalDate(b.date).getTime(),
  );
  return { ...result, items };
}

export async function getEvent(id: string): Promise<CulturalEvent | undefined> {
  const all = await dataSource.getEvents();
  return all.find((e) => e.id === id);
}
