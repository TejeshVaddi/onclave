import { runGeminiSearch } from "@/services/gemini/client";
import { runGroqSearch } from "@/services/groq/client";
import { verifyResults } from "@/services/llm/verify";
import type { LiveResultItem, LiveSearchCategory, LiveSearchRequest, LiveSearchResponse, LiveSource } from "@/services/gemini/types";

// Searching and then opening every result's page takes longer than the default limit.
export const maxDuration = 60;

const CATEGORIES: LiveSearchCategory[] = ["community", "food", "places", "events", "recipe", "mentorProgram"];
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

async function confirmed(results: LiveResultItem[], sources: LiveSource[]): Promise<LiveResultItem[]> {
  return (await verifyResults(results, sources)).slice(0, MAX_RETURNED);
}

/**
 * Live search backed by the Gemini API with Google Search grounding, with
 * Groq as a backup provider when Gemini fails entirely. Whatever a model
 * returns is only a list of candidates: each one is kept only after the
 * server opens its page and finds its name there (see services/llm/verify).
 * Returns `{ configured: false }` (not an error) whenever neither
 * GEMINI_API_KEY nor GROQ_API_KEY is set.
 */
export async function POST(request: Request): Promise<Response> {
  const geminiKey = process.env.GEMINI_API_KEY?.trim();
  const groqKey = process.env.GROQ_API_KEY?.trim();
  if (!geminiKey && !groqKey) {
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

  if (geminiKey) {
    try {
      const { results, sources, grounded, groundingNote } = await runGeminiSearch(geminiKey, body);
      if (groundingNote) console.warn("Live search ran without web grounding:", groundingNote);
      return remember({ configured: true, results: await confirmed(results, sources), sources, grounded, groundingNote });
    } catch (err) {
      console.warn("Gemini live search failed, trying Groq:", err instanceof Error ? err.message : err);
    }
  }

  if (groqKey) {
    try {
      const { results, sources } = await runGroqSearch(groqKey, body);
      return remember({ configured: true, results: await confirmed(results, sources), sources, grounded: false });
    } catch (err) {
      console.error("Groq live search failed:", err);
    }
  }

  return Response.json({
    configured: true,
    results: [],
    error: "Live search is temporarily unavailable.",
  } satisfies LiveSearchResponse);
}
