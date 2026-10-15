import { searchOsm, type OsmKind } from "@/services/osm";
import type { OsmPlacesRequest, OsmPlacesResponse } from "@/services/gemini/types";

export const maxDuration = 60;

const KINDS: OsmKind[] = ["food", "places", "community"];
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const cache = new Map<string, { at: number; payload: OsmPlacesResponse }>();

function isValidBody(body: unknown): body is OsmPlacesRequest {
  if (typeof body !== "object" || body === null) return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.kind === "string" &&
    KINDS.includes(b.kind as OsmKind) &&
    Array.isArray(b.heritages) &&
    b.heritages.length > 0 &&
    b.heritages.length <= 4 &&
    b.heritages.every((h) => typeof h === "string") &&
    typeof b.city === "string" &&
    typeof b.state === "string" &&
    (b.lat === undefined || typeof b.lat === "number") &&
    (b.lng === undefined || typeof b.lng === "number")
  );
}

/** Finds a point for a city when the browser did not send one. Nominatim is OpenStreetMap's own geocoder. */
async function geocodeCity(city: string, state: string): Promise<{ lat: number; lng: number } | null> {
  const q = [city, state, "United States"].filter(Boolean).join(", ");
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`, {
      headers: { "User-Agent": "Onclave/1.0 (https://onclave.vercel.app)" },
      signal: AbortSignal.timeout(8_000),
    });
    if (!res.ok) return null;
    const rows = (await res.json()) as { lat?: string; lon?: string }[];
    const r = rows[0];
    return r?.lat && r.lon ? { lat: Number(r.lat), lng: Number(r.lon) } : null;
  } catch {
    return null;
  }
}

/**
 * Real restaurants, shops, cultural places, and community organizations near
 * a point, from OpenStreetMap. Needs no API key, so it keeps working when AI
 * providers are out of quota.
 */
export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ results: [], error: "Invalid request." } satisfies OsmPlacesResponse, { status: 400 });
  }
  if (!isValidBody(body)) return Response.json({ results: [], error: "Invalid request." } satisfies OsmPlacesResponse, { status: 400 });

  const point = body.lat != null && body.lng != null && (body.lat !== 0 || body.lng !== 0) ? { lat: body.lat, lng: body.lng } : await geocodeCity(body.city, body.state);
  if (!point) return Response.json({ results: [], error: "Couldn't find that city." } satisfies OsmPlacesResponse);

  const key = JSON.stringify([body.kind, [...body.heritages].sort(), point.lat.toFixed(2), point.lng.toFixed(2)]);
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return Response.json(hit.payload);

  try {
    const results = await searchOsm({ kind: body.kind, heritages: body.heritages, lat: point.lat, lng: point.lng });
    const payload: OsmPlacesResponse = { results };
    if (results.length) {
      if (cache.size >= 200) cache.delete(cache.keys().next().value as string);
      cache.set(key, { at: Date.now(), payload });
    }
    return Response.json(payload);
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.warn("OpenStreetMap search failed:", detail);
    return Response.json({ results: [], error: "The map data service is busy.", detail } satisfies OsmPlacesResponse);
  }
}
