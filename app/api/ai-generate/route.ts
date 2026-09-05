import { generateWithGemini } from "@/services/gemini/client";
import { generateWithGroq } from "@/services/groq/client";
import type { AiGenerateResponse, LiveSearchCategory, LiveSearchRequest } from "@/services/gemini/types";

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
 * AI generation — used when neither the local dataset nor a live web search
 * found a real match (e.g. a specific dish, like "semya payasam", that isn't
 * in the demo dataset). Tries Gemini first, then Groq as a backup, and
 * returns `{ generated: false }` rather than an error if both fail or
 * neither has anything genuinely confident to say — never fabricating a
 * confident answer under pressure to return *something*.
 */
export async function POST(request: Request): Promise<Response> {
  const geminiKey = process.env.GEMINI_API_KEY?.trim();
  const groqKey = process.env.GROQ_API_KEY?.trim();
  if (!geminiKey && !groqKey) {
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

  if (geminiKey) {
    try {
      const item = await generateWithGemini(geminiKey, body);
      if (item) return Response.json({ configured: true, generated: true, item, provider: "gemini" } satisfies AiGenerateResponse);
    } catch (err) {
      console.warn("Gemini generation failed, trying Groq:", err instanceof Error ? err.message : err);
    }
  }

  if (groqKey) {
    try {
      const item = await generateWithGroq(groqKey, body);
      if (item) return Response.json({ configured: true, generated: true, item, provider: "groq" } satisfies AiGenerateResponse);
    } catch (err) {
      console.error("Groq generation failed:", err);
    }
  }

  return Response.json({ configured: true, generated: false } satisfies AiGenerateResponse);
}
