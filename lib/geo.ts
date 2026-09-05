import type { GeoPoint } from "@/types";

const EARTH_RADIUS_MILES = 3958.8;

/**
 * Great-circle distance in miles between two points (haversine formula).
 * Returns `Infinity` for non-finite input (e.g. corrupted saved state) so a
 * radius filter correctly excludes the item instead of an `NaN > radius`
 * comparison — which is always `false` in JS — silently letting it through.
 */
export function distanceMiles(a: GeoPoint, b: GeoPoint): number {
  if (![a.lat, a.lng, b.lat, b.lng].every(Number.isFinite)) return Infinity;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_MILES * Math.asin(Math.sqrt(h));
}

export function formatDistance(miles: number): string {
  if (!Number.isFinite(miles)) return "Distance unknown";
  if (miles < 0.1) return "Nearby";
  if (miles < 10) return `${miles.toFixed(1)} mi`;
  return `${Math.round(miles)} mi`;
}

/** Build a maps deep link for an address. Works without any API key. */
export function mapsUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
