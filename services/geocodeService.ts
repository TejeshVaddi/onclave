import type { UserLocation } from "@/types";
import { CITIES } from "@/data/cities";

/**
 * Mock geocoder. Resolves a free-text city (and optional state/country) to
 * coordinates using the small table in data/cities.ts. Swap for a geocoding
 * API (Google, Mapbox, Nominatim) without touching callers.
 */
export function geocode(input: { city: string; state?: string; country?: string }): UserLocation {
  const cityKey = input.city.trim().toLowerCase();
  const stateKey = input.state?.trim().toLowerCase();

  const candidates = CITIES.filter(
    (c) => c.city.toLowerCase() === cityKey || c.aliases?.some((a) => a === cityKey),
  );

  const match =
    candidates.find((c) => !stateKey || c.state?.toLowerCase() === stateKey) ?? candidates[0];

  if (match) {
    return {
      city: match.city,
      state: input.state?.trim() || match.state,
      country: input.country?.trim() || match.country,
      lat: match.lat,
      lng: match.lng,
    };
  }

  // Unknown city: keep what the user typed; distance-based features degrade gracefully.
  return {
    city: input.city.trim(),
    state: input.state?.trim() || undefined,
    country: input.country?.trim() || "United States",
  };
}

export function formatLocation(loc: UserLocation): string {
  return [loc.city, loc.state, loc.country === "United States" ? undefined : loc.country]
    .filter(Boolean)
    .join(", ");
}

/** Suggestions for the onboarding location input. */
export function suggestCities(query: string, limit = 6): string[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  return CITIES.filter((c) => c.city.toLowerCase().startsWith(q) || c.aliases?.some((a) => a.startsWith(q)))
    .slice(0, limit)
    .map((c) => (c.state ? `${c.city}, ${c.state}` : `${c.city}, ${c.country}`));
}
