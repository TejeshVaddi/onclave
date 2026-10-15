import type { LiveCommunityItem, LivePlaceItem } from "./gemini/types";
import { OVERPASS_ENDPOINTS, OVERPASS_FETCH_TIMEOUT_MS, buildOsmQuery, osmCandidates, osmItems, type OsmElement, type OsmRequest } from "./osmQuery";

/**
 * Asks the OpenStreetMap servers from the browser. The public servers allow a
 * couple of queries at a time per address, and every visitor has their own
 * address, so this avoids all visitors sharing one hosting address and being
 * refused. Returns null when the map servers could not be reached, so the
 * caller can fall back to asking through Onclave's server.
 */
async function overpassFromBrowser(query: string): Promise<OsmElement[] | null> {
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      // A plain form post: no custom headers, so the browser makes no preflight request.
      const res = await fetch(endpoint, {
        method: "POST",
        body: new URLSearchParams({ data: query }),
        signal: AbortSignal.timeout(OVERPASS_FETCH_TIMEOUT_MS),
      });
      if (!res.ok) continue;
      const data = (await res.json()) as { elements?: OsmElement[] };
      return data.elements ?? [];
    } catch {
      /* try the next server */
    }
  }
  return null;
}

async function loadingSites(urls: string[]): Promise<Record<string, string>> {
  if (!urls.length) return {};
  try {
    const res = await fetch("/api/verify-sites", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ urls }) });
    if (!res.ok) return {};
    return ((await res.json()) as { alive?: Record<string, string> }).alive ?? {};
  } catch {
    return {};
  }
}

export async function searchOsmInBrowser(req: OsmRequest): Promise<(LivePlaceItem | LiveCommunityItem)[] | null> {
  const query = buildOsmQuery(req);
  if (!query) return [];
  const elements = await overpassFromBrowser(query);
  if (!elements) return null;
  const candidates = osmCandidates(req, elements);
  const alive = await loadingSites(candidates.flatMap((c) => (c.website ? [c.website] : [])));
  return osmItems(req, candidates, candidates.map((c) => (c.website ? alive[c.website] : undefined)));
}
