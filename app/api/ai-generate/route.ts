import { hasAnyKey, plainText, providerKeys } from "@/services/llm/providers";
import { buildGeneratePrompt, extractJsonArray, toItem } from "@/services/llm/shared";
import type { AiGenerateResponse, LiveResultItem, LiveSearchCategory, LiveSearchRequest } from "@/services/gemini/types";

// Only recipes are ever written by AI; real communities, places, events, and people must come from search.
const CATEGORIES: LiveSearchCategory[] = ["recipe"];

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
 * AI generation: only for recipes. When no recipe matched a specific dish
 * (like "semya payasam"), one is written from general culinary knowledge.
 * Returns `{ generated: false }` rather than an error when no provider has
 * anything genuinely confident to say, and never fabricates an answer under
 * pressure to return something.
 */
export async function POST(request: Request): Promise<Response> {
  const keys = providerKeys();
  if (!hasAnyKey(keys)) {
    return Response.json({ configured: false, generated: false } satisfies AiGenerateResponse);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ configured: true, generated: false, error: "Invalid request." } satisfies AiGenerateResponse, { status: 400 });
  }

  if (!isValidBody(body)) {
    return Response.json({ configured: true, generated: false, error: "Invalid request." } satisfies AiGenerateResponse, { status: 400 });
  }

  try {
    const { text, provider } = await plainText(keys, buildGeneratePrompt(body));
    const item = extractJsonArray(text)
      .map((r) => toItem(r, body.category))
      .find((r): r is LiveResultItem => r !== null);
    if (item) return Response.json({ configured: true, generated: true, item, provider } satisfies AiGenerateResponse);
  } catch (err) {
    console.warn("Generation failed:", err instanceof Error ? err.message : err);
  }

  return Response.json({ configured: true, generated: false } satisfies AiGenerateResponse);
}
