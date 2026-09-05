import type { AiGenerateResponse, LiveSearchCategory } from "./gemini/types";

/**
 * Client-side entry point to /api/ai-generate — synthesizes one example
 * (a recipe, or guidance for finding a real community/place/event/program)
 * when nothing real matched locally or via live search. Never throws:
 * network or server failures resolve to `configured: false` so callers can
 * just skip rendering the generated section.
 */
export async function fetchAiGenerated(params: {
  category: LiveSearchCategory;
  query: string;
  heritages: string[];
  city: string;
  state: string;
}): Promise<AiGenerateResponse> {
  try {
    const res = await fetch("/api/ai-generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (!res.ok) return { configured: false, generated: false };
    return (await res.json()) as AiGenerateResponse;
  } catch {
    return { configured: false, generated: false };
  }
}
