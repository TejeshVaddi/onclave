import { groundedText, hasAnyKey, plainText, providerKeys } from "@/services/llm/providers";
import { buildSearchPrompt, extractJsonArray, toItem } from "@/services/llm/shared";
import { verifyResults } from "@/services/llm/verify";
import type { LiveResultItem, LiveSearchCategory, LiveSearchRequest, LiveSearchResponse, LiveSource } from "@/services/gemini/types";

// Searching and then opening every result's page takes longer than the default limit.
export const maxDuration = 60;

const CATEGORIES: LiveSearchCategory[] = ["community", "food", "places", "events", "recipe", "mentorProgram"];
/** Candidates asked of the model; fewer survive the existence check. */
const CANDIDATES = 12;
const MAX_RETURNED = 8;
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const CACHE_MAX_ENTRIES = 300;

const cache = new Map<string, { at: number; payload: LiveSearchResponse }>();

function cacheKey(b: LiveSearchRequest): string {
  return JSON.stringify([b.category, b.query.trim().toLowerCase(), [...b.heritages].sort(), b.city.trim().toLowerCase(), b.state.trim().toLowerCase()]);
}

function isValidBody(body: unknown): body is LiveSearchRequest {
  if (typeof body !== "object" || body === null) return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.category === "string" &&
    CATEGORIES.includes(b.category as LiveSearchCategory) &&
    typeof b.query === "string" &&
    Array.isArray(b.heritages) &&
    typeof b.city === "string" &&
    typeof b.state === "string"
  );
}

async function confirmed(text: string, category: LiveSearchCategory, sources: LiveSource[]): Promise<LiveResultItem[]> {
  const candidates = extractJsonArray(text)
    .map((item) => toItem(item, category))
    .filter((item): item is LiveResultItem => item !== null)
    .slice(0, CANDIDATES);
  return (await verifyResults(candidates, sources)).slice(0, MAX_RETURNED);
}

/**
 * Live search. A provider with web access (Gemini with Google Search
 * grounding, or OpenRouter's web plugin) is asked for candidates; if none can
 * search, a model's memory is used as a last resort. Either way the answer is
 * only a list of candidates: each one is kept only after the server opens its
 * page and finds its name there (see services/llm/verify). Returns
 * `{ configured: false }` (not an error) when no provider key is set.
 */
export async function POST(request: Request): Promise<Response> {
  const keys = providerKeys();
  if (!hasAnyKey(keys)) {
    return Response.json({ configured: false, results: [] } satisfies LiveSearchResponse);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ configured: true, results: [], error: "Invalid request." } satisfies LiveSearchResponse, { status: 400 });
  }

  if (!isValidBody(body)) {
    return Response.json({ configured: true, results: [], error: "Invalid request." } satisfies LiveSearchResponse, { status: 400 });
  }

  const key = cacheKey(body);
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return Response.json(hit.payload);

  const remember = (payload: LiveSearchResponse): Response => {
    if (payload.results.length) {
      if (cache.size >= CACHE_MAX_ENTRIES) cache.delete(cache.keys().next().value as string);
      cache.set(key, { at: Date.now(), payload });
    }
    return Response.json(payload);
  };

  let groundingNote: string | undefined;
  try {
    const r = await groundedText(keys, buildSearchPrompt(body, true, CANDIDATES));
    return remember({ configured: true, results: await confirmed(r.text, body.category, r.sources), sources: r.sources, grounded: true, provider: r.provider });
  } catch (err) {
    groundingNote = err instanceof Error ? err.message : String(err);
    console.warn("Live search ran without web access:", groundingNote);
  }

  try {
    const r = await plainText(keys, buildSearchPrompt(body, false, CANDIDATES));
    return remember({ configured: true, results: await confirmed(r.text, body.category, []), sources: [], grounded: false, groundingNote, provider: r.provider });
  } catch (err) {
    console.error("Live search failed:", err instanceof Error ? err.message : err);
  }

  return Response.json({
    configured: true,
    results: [],
    groundingNote,
    error: "Live search is temporarily unavailable.",
  } satisfies LiveSearchResponse);
}
