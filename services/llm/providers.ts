import { GroundingUnavailableError, callGemini, callGeminiGrounded } from "@/services/gemini/client";
import { callGroq } from "@/services/groq/client";
import { callOpenRouter } from "@/services/openrouter/client";
import type { LiveSource } from "@/services/gemini/types";

/**
 * Chooses which AI provider answers a request, so the routes do not each
 * repeat the fallback logic.
 *
 * - Web search (finding real things): Gemini with Google Search grounding,
 *   then OpenRouter with its web plugin. Groq cannot search the web, so it is
 *   never used here.
 * - Plain text (drafting, recipes, and a last-resort ungrounded guess that is
 *   still checked against a real page): Gemini, then OpenRouter, then Groq.
 *
 * Server-only.
 */
export interface ProviderKeys {
  gemini?: string;
  openrouter?: string;
  groq?: string;
}

export type ProviderName = "gemini" | "openrouter" | "groq";

export function providerKeys(): ProviderKeys {
  const clean = (v: string | undefined) => v?.trim() || undefined;
  return { gemini: clean(process.env.GEMINI_API_KEY), openrouter: clean(process.env.OPENROUTER_API_KEY), groq: clean(process.env.GROQ_API_KEY) };
}

export const hasAnyKey = (k: ProviderKeys) => Boolean(k.gemini || k.openrouter || k.groq);
export const hasSearchKey = (k: ProviderKeys) => Boolean(k.gemini || k.openrouter);

export interface TextResult {
  text: string;
  sources: LiveSource[];
  provider: ProviderName;
  model?: string;
}

/** After Gemini reports quota or overload, skip it briefly so requests are not spent on a certain failure. */
const GEMINI_COOLDOWN_MS = 5 * 60 * 1000;
let geminiBusyUntil = 0;
const geminiAvailable = () => Date.now() >= geminiBusyUntil;
const noteGemini = (msg: string) => {
  if (/ (429|503) /.test(msg)) geminiBusyUntil = Date.now() + GEMINI_COOLDOWN_MS;
};

const messageOf = (err: unknown) => (err instanceof Error ? err.message : String(err)).replace(/\s+/g, " ").slice(0, 400);

export class NoProviderError extends Error {}

/** Text grounded in live web pages, with the pages used as sources. */
export async function groundedText(keys: ProviderKeys, prompt: string): Promise<TextResult> {
  const notes: string[] = [];

  if (keys.gemini) {
    if (geminiAvailable()) {
      try {
        const r = await callGeminiGrounded(keys.gemini, prompt);
        return { text: r.text, sources: r.sources, provider: "gemini", model: r.model };
      } catch (err) {
        notes.push(messageOf(err));
        if (err instanceof GroundingUnavailableError && err.transient) geminiBusyUntil = Date.now() + GEMINI_COOLDOWN_MS;
      }
    } else {
      notes.push("gemini: skipped, recently out of quota or overloaded");
    }
  }

  if (keys.openrouter) {
    try {
      const r = await callOpenRouter(keys.openrouter, prompt, { web: true });
      return { text: r.text, sources: r.sources, provider: "openrouter", model: r.model };
    } catch (err) {
      notes.push(`openrouter: ${messageOf(err)}`);
    }
  }

  throw new NoProviderError(notes.length ? notes.join(" | ") : "No web search provider is configured.");
}

/** Plain text with no web access. */
export async function plainText(keys: ProviderKeys, prompt: string): Promise<TextResult> {
  const notes: string[] = [];

  if (keys.gemini && geminiAvailable()) {
    try {
      const { text } = await callGemini(keys.gemini, prompt, false);
      return { text, sources: [], provider: "gemini" };
    } catch (err) {
      const msg = messageOf(err);
      notes.push(`gemini: ${msg}`);
      noteGemini(msg);
    }
  }

  if (keys.openrouter) {
    try {
      const r = await callOpenRouter(keys.openrouter, prompt, { web: false });
      return { text: r.text, sources: [], provider: "openrouter", model: r.model };
    } catch (err) {
      notes.push(`openrouter: ${messageOf(err)}`);
    }
  }

  if (keys.groq) {
    try {
      return { text: await callGroq(keys.groq, prompt), sources: [], provider: "groq" };
    } catch (err) {
      notes.push(`groq: ${messageOf(err)}`);
    }
  }

  throw new NoProviderError(notes.length ? notes.join(" | ") : "No provider is configured.");
}
