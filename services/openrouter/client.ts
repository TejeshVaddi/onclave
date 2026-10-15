import type { LiveSource } from "@/services/gemini/types";

/**
 * Server-only OpenRouter client. OpenRouter is one account that routes to many
 * models, and its web plugin gives any of them live search results to read,
 * with the pages it used returned as citations. Same server-only rule as the
 * other clients: OPENROUTER_API_KEY must never reach the browser bundle.
 *
 * The web plugin is billed per search result on top of the model's own
 * per-token price, so searches ask for a modest number of results.
 */
export const DEFAULT_OPENROUTER_MODEL = "anthropic/claude-haiku-5.5";
const REQUEST_TIMEOUT_MS = 60_000;
const WEB_RESULTS = 6;
/** OpenRouter reserves credit for the longest possible reply, so an uncapped request can be refused on a small balance. */
const MAX_REPLY_TOKENS = 6000;

interface OpenRouterAnnotation {
  type?: string;
  url_citation?: { url?: string; title?: string };
}

interface OpenRouterResponse {
  choices?: { message?: { content?: string; annotations?: OpenRouterAnnotation[] } }[];
}

export async function callOpenRouter(apiKey: string, prompt: string, opts: { web: boolean }): Promise<{ text: string; sources: LiveSource[]; model: string }> {
  const model = process.env.OPENROUTER_MODEL?.trim() || DEFAULT_OPENROUTER_MODEL;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://onclave.vercel.app",
        "X-Title": "Onclave",
      },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        max_tokens: MAX_REPLY_TOKENS,
        ...(opts.web ? { plugins: [{ id: "web", max_results: WEB_RESULTS }] } : {}),
      }),
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`OpenRouter API error ${res.status}: ${body.slice(0, 300)}`);
  }

  const data = (await res.json()) as OpenRouterResponse;
  const message = data.choices?.[0]?.message;
  const sources: LiveSource[] = (message?.annotations ?? [])
    .filter((a) => a.type === "url_citation" && a.url_citation?.url)
    .map((a) => ({ title: a.url_citation?.title || (a.url_citation?.url as string), url: a.url_citation?.url as string }));

  // Citations are not returned for every model, so an empty list is not a failure:
  // whatever is claimed is checked against its own page before it is shown.
  return { text: message?.content ?? "", sources, model };
}
