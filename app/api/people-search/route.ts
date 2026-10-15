import { groundedText, hasSearchKey, providerKeys } from "@/services/llm/providers";
import { buildPeoplePrompt, parsePeople, verifyPeople } from "@/services/llm/people";
import type { PeopleSearchRequest, PeopleSearchResponse } from "@/services/gemini/types";

export const maxDuration = 60;

const MAX_CANDIDATES = 12;
const MAX_RETURNED = 8;
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const cache = new Map<string, { at: number; payload: PeopleSearchResponse }>();

function isValidBody(body: unknown): body is PeopleSearchRequest {
  if (typeof body !== "object" || body === null) return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.professionLabel === "string" &&
    typeof b.industry === "string" &&
    Array.isArray(b.heritages) &&
    typeof b.city === "string" &&
    typeof b.state === "string" &&
    typeof b.query === "string" &&
    b.professionLabel.trim().length > 0
  );
}

/**
 * Real people to learn from. This needs a provider that can search the web
 * (Gemini with Google Search grounding, or OpenRouter's web plugin): a model
 * answering from memory would invent people, so there is deliberately no
 * memory-only fallback. Every person returned has been checked against the
 * public page that describes them (see services/llm/people).
 */
export async function POST(request: Request): Promise<Response> {
  const keys = providerKeys();
  if (!hasSearchKey(keys)) return Response.json({ configured: false, people: [] } satisfies PeopleSearchResponse);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ configured: true, people: [], error: "Invalid request." } satisfies PeopleSearchResponse, { status: 400 });
  }
  if (!isValidBody(body)) {
    return Response.json({ configured: true, people: [], error: "Invalid request." } satisfies PeopleSearchResponse, { status: 400 });
  }

  const key = JSON.stringify([body.professionLabel, [...body.heritages].sort(), body.city.toLowerCase(), body.state.toLowerCase(), body.query.trim().toLowerCase()]);
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return Response.json(hit.payload);

  try {
    const { text, sources } = await groundedText(keys, buildPeoplePrompt(body, MAX_CANDIDATES));
    const people = (await verifyPeople(parsePeople(text))).slice(0, MAX_RETURNED);
    const payload: PeopleSearchResponse = { configured: true, people, sources: sources.slice(0, 12) };
    if (people.length) {
      if (cache.size >= 200) cache.delete(cache.keys().next().value as string);
      cache.set(key, { at: Date.now(), payload });
    }
    return Response.json(payload);
  } catch (err) {
    console.warn("People search failed:", err instanceof Error ? err.message : err);
    return Response.json({ configured: true, people: [], error: "Search is temporarily unavailable." } satisfies PeopleSearchResponse);
  }
}
