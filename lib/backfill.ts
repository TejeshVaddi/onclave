import type { GeoPoint } from "@/types";

/**
 * Ensures a search has enough to show without ever inventing content.
 *
 * The curated demo dataset is real but finite, and two different things can
 * make a search come up thin:
 *
 * 1. A heritage filter narrower than the dataset supports (e.g. "Turkish
 *    mentors in medicine" might only genuinely match one or two people).
 * 2. A user whose location is nowhere near the dataset's real-world center
 *    (Northern Virginia) — someone in Seattle searching "restaurants near
 *    me" would otherwise see an empty grid, not because nothing exists, but
 *    because everything in the dataset happens to be 2,000+ miles away.
 *
 * Rather than stop at a handful of results (or none), this backfills in two
 * relaxation stages — same area but any heritage, then (only if still thin)
 * any heritage and any distance — always with REAL items that still match
 * every other filter. It reports how many were exact vs. backfilled, and
 * whether the distance filter had to be dropped, so the UI can label results
 * honestly instead of implying a uniform or nearby match.
 */
export interface BackfillResult<T> {
  items: T[];
  /** How many of `items` matched every filter, including heritage and distance. */
  exactCount: number;
  /** True when items beyond `exactCount` were added by relaxing heritage and/or distance. */
  backfilled: boolean;
  /** True when reaching `minResults` required dropping the distance filter — some items may be far from the user. */
  outsideRadius: boolean;
}

interface RelaxableFilters {
  heritages?: string[];
  near?: GeoPoint;
  radiusMiles?: number;
}

export function searchWithBackfill<T extends { id: string }, F extends RelaxableFilters>(
  all: T[],
  filters: F,
  matches: (item: T, f: F) => boolean,
  minResults: number,
): BackfillResult<T> {
  const exact = all.filter((item) => matches(item, filters));

  if (minResults <= 0 || exact.length >= minResults) {
    return { items: exact, exactCount: exact.length, backfilled: false, outsideRadius: false };
  }

  const seen = new Set(exact.map((item) => item.id));
  const items: T[] = [...exact];

  // Stage 1: same area, any heritage.
  if (filters.heritages?.length) {
    const relaxedHeritage = { ...filters, heritages: undefined } as F;
    for (const item of all) {
      if (items.length >= minResults) break;
      if (seen.has(item.id) || !matches(item, relaxedHeritage)) continue;
      items.push(item);
      seen.add(item.id);
    }
  }

  // Stage 2 (last resort): the area itself came up thin — drop the distance
  // filter too rather than show an empty grid. These are still real matches
  // on every other filter; callers that show a distance badge make the
  // "not actually nearby" fact visible on the item itself.
  let outsideRadius = false;
  if (items.length < minResults && (filters.near || filters.radiusMiles != null)) {
    const relaxedLocation = { ...filters, heritages: undefined, near: undefined, radiusMiles: undefined } as F;
    for (const item of all) {
      if (items.length >= minResults) break;
      if (seen.has(item.id) || !matches(item, relaxedLocation)) continue;
      items.push(item);
      seen.add(item.id);
      outsideRadius = true;
    }
  }

  return { items, exactCount: exact.length, backfilled: items.length > exact.length, outsideRadius };
}
