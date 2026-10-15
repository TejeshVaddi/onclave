import { GroundingUnavailableError, callGemini, callGeminiGrounded } from "@/services/gemini/client";
import { callGroq } from "@/services/groq/client";
import { callOpenRouter, callOpenRouterChat, type ChatTurn } from "@/services/openrouter/client";
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

export interface ChatResult {
  text: string;
  sources: LiveSource[];
  provider: ProviderName;
  /** True when the answer was written with live web search results in front of the model. */
  webSearch: boolean;
}

const flatten = (turns: ChatTurn[]): string =>
  turns
    .map((t) => (t.role === "system" ? t.content : `${t.role === "user" ? "Person" : "Assistant"}: ${t.content}`))
    .join("\n\n")
    .concat("\n\nAssistant:");

/**
 * A chat reply. OpenRouter is the main provider (with live web search); if it
 * cannot answer, Gemini with search, then Gemini, then Groq without it. The
 * caller supplies both prompts: `webSystem` for answers that can use search
 * results, and `offlineSystem` for the providers that cannot.
 */
export async function chatText(keys: ProviderKeys, history: ChatTurn[], webSystem: string, offlineSystem: string): Promise<ChatResult> {
  const notes: string[] = [];

  if (keys.openrouter) {
    try {
      const r = await callOpenRouterChat(keys.openrouter, [{ role: "system", content: webSystem }, ...history], { web: true, maxTokens: 1600 });
      if (r.text.trim()) return { text: r.text, sources: r.sources, provider: "openrouter", webSearch: true };
      notes.push("openrouter: empty reply");
    } catch (err) {
      notes.push(`openrouter: ${messageOf(err)}`);
    }
  }

  if (keys.gemini && geminiAvailable()) {
    try {
      const r = await callGeminiGrounded(keys.gemini, flatten([{ role: "system", content: webSystem }, ...history]));
      if (r.text.trim()) return { text: r.text, sources: r.sources, provider: "gemini", webSearch: true };
    } catch (err) {
      notes.push(messageOf(err));
      if (err instanceof GroundingUnavailableError && err.transient) geminiBusyUntil = Date.now() + GEMINI_COOLDOWN_MS;
    }
  }

  const offline = flatten([{ role: "system", content: offlineSystem }, ...history]);
  if (keys.gemini && geminiAvailable()) {
    try {
      const { text } = await callGemini(keys.gemini, offline, false);
      if (text.trim()) return { text, sources: [], provider: "gemini", webSearch: false };
    } catch (err) {
      const msg = messageOf(err);
      notes.push(`gemini: ${msg}`);
      noteGemini(msg);
    }
  }
  if (keys.openrouter) {
    try {
      const r = await callOpenRouterChat(keys.openrouter, [{ role: "system", content: offlineSystem }, ...history], { web: false, maxTokens: 1200 });
      if (r.text.trim()) return { text: r.text, sources: [], provider: "openrouter", webSearch: false };
    } catch (err) {
      notes.push(`openrouter (no search): ${messageOf(err)}`);
    }
  }
  if (keys.groq) {
    try {
      const text = await callGroq(keys.groq, offline);
      if (text.trim()) return { text, sources: [], provider: "groq", webSearch: false };
    } catch (err) {
      notes.push(`groq: ${messageOf(err)}`);
    }
  }

  throw new NoProviderError(notes.length ? notes.join(" | ") : "No provider is configured.");
}
