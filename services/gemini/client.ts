import type { LiveResultItem, LiveSearchRequest, LiveSource } from "./types";
import { buildGeneratePrompt, buildSearchPrompt, extractJsonArray, toItem } from "@/services/llm/shared";

/**
 * Server-only Gemini client. This module must only ever be imported from a
 * Next.js Route Handler (app/api/**\/route.ts) — never from a component —
 * so GEMINI_API_KEY (read from process.env, no NEXT_PUBLIC_ prefix) never
 * reaches the browser bundle.
 *
 * Tries Gemini's Google Search grounding tool first, so results are backed
 * by real, current web pages with citable sources. Some accounts have
 * grounding blocked by quota/billing even on keys that work fine for plain
 * generation — when that happens, this automatically retries once without
 * grounding, using the model's own trained knowledge instead, and reports
 * `grounded: false` so callers can disclose the weaker guarantee rather
 * than silently upgrading an unverified guess into a "live result."
 */
const DEFAULT_MODEL = "gemini-3.6-flash";
// Gemini 3.x models reason internally before answering, which runs longer
// without search grounding to lean on, so this needs real headroom.
const REQUEST_TIMEOUT_MS = 60_000;
/** Candidates asked of the model; fewer survive the existence check. */
const MAX_RESULTS = 12;

interface GeminiApiPart {
  text?: string;
}
interface GeminiGroundingChunk {
  web?: { uri?: string; title?: string };
}
interface GeminiApiResponse {
  candidates?: {
    content?: { parts?: GeminiApiPart[] };
    groundingMetadata?: { groundingChunks?: GeminiGroundingChunk[] };
  }[];
}

export async function callGemini(apiKey: string, prompt: string, withGrounding: boolean, modelOverride?: string): Promise<{ text: string; sources: LiveSource[] }> {
  const model = modelOverride || process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(`${url}?key=${encodeURIComponent(apiKey)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        ...(withGrounding ? { tools: [{ google_search: {} }] } : {}),
        generationConfig: { temperature: 0.2 },
      }),
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Gemini API error ${res.status}: ${body.slice(0, 300)}`);
  }

  const data = (await res.json()) as GeminiApiResponse;
  const candidate = data.candidates?.[0];
  const text = candidate?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
  const sources: LiveSource[] = (candidate?.groundingMetadata?.groundingChunks ?? [])
    .map((c) => (c.web?.uri ? { title: c.web.title || c.web.uri, url: c.web.uri } : null))
    .filter((s): s is LiveSource => s !== null);

  return { text, sources };
}

/**
 * Models to try for Google Search grounding, in order. Which models may use
 * grounding differs by account and plan, so when the configured model is
 * refused, the next one is tried before giving up on live web search.
 */
const GROUNDING_MODELS = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.5-flash-lite"];

export interface GroundedCall {
  text: string;
  sources: LiveSource[];
  model: string;
}

/** A grounded call that walks the model list. Throws only if every model refused, with each reason. */
export async function callGeminiGrounded(apiKey: string, prompt: string): Promise<GroundedCall> {
  const configured = process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL;
  const models = [configured, ...GROUNDING_MODELS.filter((m) => m !== configured)];
  const failures: string[] = [];
  for (const model of models) {
    try {
      const { text, sources } = await callGemini(apiKey, prompt, true, model);
      return { text, sources, model };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      failures.push(`${model}: ${msg.replace(/\s+/g, " ").slice(0, 160)}`);
      // A rejected key will not work on any model.
      if (/ 40[13] /.test(msg) || /API key not valid|UNAUTHENTICATED/i.test(msg)) break;
    }
  }
  throw new Error(`Grounded search unavailable. ${failures.join(" | ")}`);
}

export async function runGeminiSearch(
  apiKey: string,
  req: LiveSearchRequest,
): Promise<{ results: LiveResultItem[]; sources: LiveSource[]; grounded: boolean; groundingNote?: string }> {
  let grounded = true;
  let groundingNote: string | undefined;
  let text: string;
  let sources: LiveSource[];

  try {
    ({ text, sources } = await callGeminiGrounded(apiKey, buildSearchPrompt(req, true, MAX_RESULTS)));
  } catch (err) {
    groundingNote = err instanceof Error ? err.message : String(err);
    // Grounding can be gated by quota/billing separately from plain
    // generation on some accounts. Fall back once to ungrounded generation
    // rather than surfacing nothing — the response is clearly marked
    // `grounded: false` so the UI can disclose it's not independently verified.
    console.warn("Gemini grounded search failed, retrying without grounding:", err instanceof Error ? err.message : err);
    grounded = false;
    ({ text, sources } = await callGemini(apiKey, buildSearchPrompt(req, false, MAX_RESULTS), false));
  }

  const raw = extractJsonArray(text);
  const results = raw
    .map((item) => toItem(item, req.category))
    .filter((item): item is LiveResultItem => item !== null)
    .slice(0, MAX_RESULTS);
  return { results, sources: sources.slice(0, 12), grounded, groundingNote };
}

/**
 * Synthesizes ONE example (a recipe, or guidance for finding a real
 * community/place/event/program) when nothing real matched locally or via
 * search. Never uses grounding — this is explicitly not a "search for a
 * real one" call. Throws on transport/API failure so the caller
 * (app/api/ai-generate) can fall back to Groq.
 */
export async function generateWithGemini(apiKey: string, req: LiveSearchRequest): Promise<LiveResultItem | null> {
  const { text } = await callGemini(apiKey, buildGeneratePrompt(req), false);
  const raw = extractJsonArray(text);
  const item = raw.map((r) => toItem(r, req.category)).find((r): r is LiveResultItem => r !== null);
  return item ?? null;
}
