import type { CulturalPlaceCategory, FoodPlaceCategory, GeoPoint, Place, PlaceCategory } from "@/types";
import { dataSource } from "./dataSource";
import { distanceMiles, mapsUrl } from "@/lib/geo";
import { searchWithBackfill, type BackfillResult } from "@/lib/backfill";

export interface PlaceFilters {
  kind?: "food" | "cultural";
  query?: string;
  heritages?: string[];
  categories?: PlaceCategory[];
  near?: GeoPoint;
  radiusMiles?: number;
}

export interface PlaceWithDistance extends Place {
  distanceMiles: number | null;
}

export const FOOD_CATEGORIES: { id: FoodPlaceCategory; label: string }[] = [
  { id: "restaurant", label: "Restaurants" },
  { id: "grocery", label: "Grocery stores" },
  { id: "market", label: "Markets" },
  { id: "bakery", label: "Bakeries" },
  { id: "cafe", label: "Cafés" },
];

export const CULTURAL_CATEGORIES: { id: CulturalPlaceCategory; label: string }[] = [
  { id: "temple", label: "Temples" },
  { id: "mosque", label: "Mosques" },
  { id: "church", label: "Churches" },
  { id: "cultural-center", label: "Cultural centers" },
  { id: "museum", label: "Museums" },
  { id: "heritage-site", label: "Heritage sites" },
  { id: "community-center", label: "Community centers" },
];

export function placeCategoryLabel(id: PlaceCategory): string {
  const all = [...FOOD_CATEGORIES, ...CULTURAL_CATEGORIES] as { id: PlaceCategory; label: string }[];
  const label = all.find((c) => c.id === id)?.label ?? id;
  // Singular form for cards (handles "-ies", sibilant "-es", and plain "-s" plurals)
  if (label.endsWith("ies")) return label.slice(0, -3) + "y";
  if (label.endsWith("ches") || label.endsWith("shes") || label.endsWith("xes")) return label.slice(0, -2);
  if (label.endsWith("s")) return label.slice(0, -1);
  return label;
}

export function withDistance(p: Place, near?: GeoPoint): PlaceWithDistance {
  return { ...p, distanceMiles: near ? distanceMiles(near, p.geo) : null };
}

export function matchesPlace(p: Place, f: PlaceFilters): boolean {
  if (f.kind && p.kind !== f.kind) return false;
  if (f.query) {
    const q = f.query.toLowerCase();
    const hay = `${p.name} ${p.description} ${p.city} ${p.tags.join(" ")}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  if (f.heritages?.length && !p.heritages.some((h) => f.heritages!.includes(h))) return false;
  if (f.categories?.length && !f.categories.includes(p.category)) return false;
  if (f.near && f.radiusMiles && distanceMiles(f.near, p.geo) > f.radiusMiles) return false;
  return true;
}

/**
 * `minResults` (default 0 = off) backfills a thin heritage-filtered search
 * with the next-best heritage-relaxed matches. Callers sourcing places for a
 * specific heritage context (e.g. ingredients for one recipe) should leave
 * this at 0 — showing a wrong-heritage grocery store just to hit a count
 * would be actively misleading there. See lib/backfill.ts.
 */
export async function searchPlaces(filters: PlaceFilters = {}, minResults = 0): Promise<BackfillResult<PlaceWithDistance>> {
  const all = await dataSource.getPlaces();
  const { items, exactCount, backfilled, outsideRadius } = searchWithBackfill(all, filters, matchesPlace, minResults);
  const withDist = items.map((p) => withDistance(p, filters.near));
  if (filters.near) withDist.sort((a, b) => (a.distanceMiles ?? 0) - (b.distanceMiles ?? 0));
  return { items: withDist, exactCount, backfilled, outsideRadius };
}

export function placeMapUrl(p: Place): string {
  return p.externalUrl ?? mapsUrl(`${p.name}, ${p.address}, ${p.city}, ${p.state}`);
}
