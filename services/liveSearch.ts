import type { LiveSearchCategory, LiveSearchResponse, OsmPlacesRequest, OsmPlacesResponse, PeopleSearchRequest, PeopleSearchResponse, PersonAssistResponse } from "./gemini/types";

/**
 * Client-side entry point to the Gemini-backed live search. Calls the
 * server route (which holds the API key) rather than Gemini directly.
 * Never throws: network or server failures resolve to `configured: false`
 * so callers can just skip rendering the live section.
 */
export async function fetchLiveResults(params: {
  category: LiveSearchCategory;
  query: string;
  heritages: string[];
  city: string;
  state: string;
}): Promise<LiveSearchResponse> {
  try {
    const res = await fetch("/api/live-search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (!res.ok) return { configured: false, results: [] };
    return (await res.json()) as LiveSearchResponse;
  } catch {
    return { configured: false, results: [] };
  }
}

async function postJson<T>(url: string, body: unknown): Promise<T | null> {
  try {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/** Real people found on public pages that show they welcome questions. */
export async function fetchPeople(params: PeopleSearchRequest): Promise<PeopleSearchResponse> {
  return (await postJson<PeopleSearchResponse>("/api/people-search", params)) ?? { configured: false, people: [] };
}

export async function fetchPersonAssist(body: unknown): Promise<PersonAssistResponse> {
  return (await postJson<PersonAssistResponse>("/api/person-assist", body)) ?? { configured: false };
}

/** Real places near a point from OpenStreetMap. Needs no API key. */
export async function fetchOsmPlaces(params: OsmPlacesRequest): Promise<OsmPlacesResponse> {
  return (await postJson<OsmPlacesResponse>("/api/osm-places", params)) ?? { results: [], error: "Couldn't reach the map data service." };
}
