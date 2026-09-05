import { runGeminiSearch } from "@/services/gemini/client";
import { runGroqSearch } from "@/services/groq/client";
import type { LiveSearchCategory, LiveSearchRequest, LiveSearchResponse } from "@/services/gemini/types";

const CATEGORIES: LiveSearchCategory[] = ["community", "food", "places", "events", "recipe", "mentorProgram"];

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

/**
 * Live search backed by the Gemini API with Google Search grounding, with
 * Groq as a backup provider when Gemini fails entirely (not just the
 * grounded→ungrounded fallback Gemini already does internally). Returns
 * `{ configured: false }` (not an error) whenever neither GEMINI_API_KEY nor
 * GROQ_API_KEY is set, so the client can silently skip rendering the
 * live-results section rather than showing a broken feature.
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

  if (geminiKey) {
    try {
      const { results, sources, grounded } = await runGeminiSearch(geminiKey, body);
      return Response.json({ configured: true, results, sources, grounded } satisfies LiveSearchResponse);
    } catch (err) {
      console.warn("Gemini live search failed, trying Groq:", err instanceof Error ? err.message : err);
    }
  }

  if (groqKey) {
    try {
      const { results, sources } = await runGroqSearch(groqKey, body);
      return Response.json({ configured: true, results, sources, grounded: false } satisfies LiveSearchResponse);
    } catch (err) {
      console.error("Groq live search failed:", err);
    }
  }

  return Response.json({
    configured: true,
    results: [],
    error: "Live search is temporarily unavailable. Showing local results only.",
  } satisfies LiveSearchResponse);
}
