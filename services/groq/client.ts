import type { LiveResultItem, LiveSearchRequest, LiveSource } from "@/services/gemini/types";
import { buildGeneratePrompt, buildSearchPrompt, extractJsonArray, toItem } from "@/services/llm/shared";

/**
 * Server-only Groq client — the backup provider when Gemini is unavailable
 * (missing key, quota, timeout, or any other failure). Same
 * server-only-import rule as services/gemini/client.ts: GROQ_API_KEY must
 * never reach the browser bundle.
 *
 * Groq doesn't offer built-in web-search grounding the way Gemini does, so
 * every call here is "from the model's own knowledge" — never presented as
 * an independently verified live result.
 */
const DEFAULT_MODEL = "openai/gpt-oss-120b";
const REQUEST_TIMEOUT_MS = 30_000;
const MAX_RESULTS = 8;

interface GroqApiResponse {
  choices?: { message?: { content?: string } }[];
}

async function callGroq(apiKey: string, prompt: string): Promise<string> {
  const model = process.env.GROQ_MODEL?.trim() || DEFAULT_MODEL;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
      }),
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Groq API error ${res.status}: ${body.slice(0, 300)}`);
  }

  const data = (await res.json()) as GroqApiResponse;
  return data.choices?.[0]?.message?.content ?? "";
}

/** Backup for the "find real ones" search, used only when Gemini's own search+fallback both fail. */
export async function runGroqSearch(apiKey: string, req: LiveSearchRequest): Promise<{ results: LiveResultItem[]; sources: LiveSource[] }> {
  const text = await callGroq(apiKey, buildSearchPrompt(req, false, MAX_RESULTS));
  const raw = extractJsonArray(text);
  const results = raw
    .map((item) => toItem(item, req.category))
    .filter((item): item is LiveResultItem => item !== null)
    .slice(0, MAX_RESULTS);
  return { results, sources: [] };
}

/** Backup for AI generation (e.g. a recipe), used only when Gemini generation fails. */
export async function generateWithGroq(apiKey: string, req: LiveSearchRequest): Promise<LiveResultItem | null> {
  const text = await callGroq(apiKey, buildGeneratePrompt(req));
  const raw = extractJsonArray(text);
  const item = raw.map((r) => toItem(r, req.category)).find((r): r is LiveResultItem => r !== null);
  return item ?? null;
}
