import type { LiveCommunityItem, LivePlaceItem } from "./gemini/types";
import { isPublicHttpUrl, probePage } from "./llm/verify";
import { OVERPASS_ENDPOINTS, OVERPASS_FETCH_TIMEOUT_MS, buildOsmQuery, osmCandidates, osmItems, type OsmElement, type OsmRequest } from "./osmQuery";

/**
 * Server side of the OpenStreetMap search. The browser asks the map servers
 * directly when it can (each person's own address, so no shared server gets
 * rate limited); this path is the fallback. Server-only: it makes outbound
 * requests from a Route Handler.
 */
export type { OsmKind, OsmRequest } from "./osmQuery";

async function runOverpass(query: string): Promise<OsmElement[]> {
  let lastError = "no endpoint answered";
  // Two passes: a 429 means the server is busy with other callers, and a short wait usually clears it.
  for (let pass = 0; pass < 2; pass++) {
    let busy = false;
    for (const endpoint of OVERPASS_ENDPOINTS) {
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "Onclave/1.0 (https://onclave.vercel.app)" },
          body: `data=${encodeURIComponent(query)}`,
          signal: AbortSignal.timeout(OVERPASS_FETCH_TIMEOUT_MS),
        });
        if (res.status === 429) busy = true;
        if (!res.ok) {
          lastError = `${endpoint} answered ${res.status}`;
          continue;
        }
        const data = (await res.json()) as { elements?: OsmElement[] };
        return data.elements ?? [];
      } catch (err) {
        lastError = `${endpoint}: ${err instanceof Error ? err.message : String(err)}`;
      }
    }
    if (!busy) break;
    await new Promise((r) => setTimeout(r, 6_000));
  }
  throw new Error(`Overpass unavailable. ${lastError}`);
}

/** Which of these websites still load. Maps each to where it ended up, and leaves out the rest. */
export async function liveSites(urls: string[]): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  await Promise.all(
    urls.map(async (url) => {
      if (!isPublicHttpUrl(url)) return;
      const probe = await probePage(url, false);
      if (probe.readable || probe.blocked) out[url] = probe.finalUrl || url;
    }),
  );
  return out;
}

/** Real places near a point, as live items. Websites are kept only if they load. */
export async function searchOsm(req: OsmRequest): Promise<(LivePlaceItem | LiveCommunityItem)[]> {
  const query = buildOsmQuery(req);
  if (!query) return [];
  const candidates = osmCandidates(req, await runOverpass(query));
  const alive = await liveSites(candidates.flatMap((c) => (c.website ? [c.website] : [])));
  return osmItems(req, candidates, candidates.map((c) => (c.website ? alive[c.website] : undefined)));
}
