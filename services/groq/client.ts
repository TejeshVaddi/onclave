
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

interface GroqApiResponse {
  choices?: { message?: { content?: string } }[];
}

export async function callGroq(apiKey: string, prompt: string): Promise<string> {
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
