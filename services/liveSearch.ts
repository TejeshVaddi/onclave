import type { LiveSearchCategory, LiveSearchResponse } from "./gemini/types";

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
