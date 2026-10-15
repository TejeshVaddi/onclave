import { chatText, hasAnyKey, providerKeys } from "@/services/llm/providers";
import { clip } from "@/services/llm/shared";
import type { DiscoverChatMessage, DiscoverChatRequest, DiscoverChatResponse } from "@/services/gemini/types";

export const maxDuration = 60;

const MAX_MESSAGES = 12;
const MAX_MESSAGE_CHARS = 2000;
const MAX_VERIFIED = 18;
/** Each chat reply spends paid search and model credit, so one visitor cannot drain it. */
const RATE_LIMIT = 40;
const RATE_WINDOW_MS = 60 * 60 * 1000;
const hits = new Map<string, number[]>();

function overLimit(request: Request): boolean {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (recent.length >= RATE_LIMIT) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.delete(hits.keys().next().value as string);
  return false;
}

function isValidBody(body: unknown): body is DiscoverChatRequest {
  if (typeof body !== "object" || body === null) return false;
  const b = body as Record<string, unknown>;
  const p = b.profile as Record<string, unknown> | undefined;
  return (
    Array.isArray(b.messages) &&
    b.messages.length > 0 &&
    b.messages.length <= 40 &&
    b.messages.every((m) => typeof m === "object" && m !== null && ((m as Record<string, unknown>).role === "user" || (m as Record<string, unknown>).role === "assistant") && typeof (m as Record<string, unknown>).content === "string") &&
    (b.messages[b.messages.length - 1] as DiscoverChatMessage).role === "user" &&
    !!p &&
    typeof p.name === "string" &&
    Array.isArray(p.heritages) &&
    typeof p.professionLabel === "string" &&
    Array.isArray(p.interests) &&
    typeof p.city === "string" &&
    typeof p.state === "string" &&
    Array.isArray(b.verified) &&
    b.verified.every((v) => typeof v === "string")
  );
}

function profileLine(p: DiscoverChatRequest["profile"]): string {
  const list = (a: string[]) => a.slice(0, 5).map((x) => clip(x, 40)).join(", ") || "not given";
  return [
    `Name: ${clip(p.name, 60) || "not given"}`,
    `Heritage: ${list(p.heritages)}`,
    `Field of interest: ${clip(p.professionLabel, 80) || "not given"}`,
    `Other interests: ${list(p.interests)}`,
    `Location: ${clip(`${p.city} ${p.state}`, 80) || "not given"}`,
  ].join("; ");
}

const RULES = [
  "Be warm, direct, and brief: short paragraphs or a short list, no filler. Ask one clarifying question when a request is too vague to help.",
  "Never invent names, addresses, dates, prices, hours, phone numbers, email addresses, or links. If you are not sure of something, say you are not sure.",
  "Do not give contact details for private individuals. To find mentors or people to learn from, point to the Profession tab, which lists real people and associations.",
  "You may write a recipe from general culinary knowledge and say it is a general version; the Recipes tab has Onclave's own full recipes.",
  "For medical, legal, and immigration questions, give general information and point to a qualified professional or the official government source.",
  "Stay on what Onclave covers: communities, culture, food, events, recipes, and careers for diaspora communities. For anything else, say so briefly and steer back.",
  "Respect every culture and faith; do not assume a person's religion or beliefs from their heritage.",
  "Write plain text. Short lists may start each line with a dash. Do not use headings or tables.",
];

function systemPrompt(req: DiscoverChatRequest, web: boolean): string {
  const verified = req.verified.slice(0, MAX_VERIFIED).map((v) => `- ${clip(v, 300)}`).join("\n");
  return [
    "You are Onclave's assistant. Onclave helps people from immigrant and diaspora communities find communities, cultural places, food, events, recipes, and professional mentors.",
    `About the person you are talking to: ${profileLine(req.profile)}.`,
    ...RULES.map((r) => `- ${r}`),
    web
      ? "- Use the web search results you are given for anything about real places, events, groups, prices, hours, or dates. Name a specific real place, event, or organization only if it appears in those results or in the verified list below, and say where it came from."
      : "- You cannot search the web right now. If asked about specific real places, events, or organizations, say plainly that you can't check them at the moment and offer general guidance instead. Name only items from the verified list below.",
    verified ? `Items from Onclave's own lists for this question (each confirmed to exist, shown to the person as cards under your reply):\n${verified}` : "No items from Onclave's lists matched this question.",
  ].join("\n");
}

/**
 * The AI Discovery chat. OpenRouter with live web search writes the reply; if
 * it cannot, the other providers answer without search and are told to say so.
 * The cards shown under a reply come from Onclave's own confirmed lists, and
 * the reply is only allowed to name specific real things that are in those
 * lists or in the search results it was given.
 */
export async function POST(request: Request): Promise<Response> {
  const keys = providerKeys();
  if (!hasAnyKey(keys)) return Response.json({ configured: false } satisfies DiscoverChatResponse);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ configured: true, error: "Invalid request." } satisfies DiscoverChatResponse, { status: 400 });
  }
  if (!isValidBody(body)) return Response.json({ configured: true, error: "Invalid request." } satisfies DiscoverChatResponse, { status: 400 });

  if (overLimit(request)) {
    return Response.json({ configured: true, error: "You've sent a lot of messages in the last hour. Please try again a little later." } satisfies DiscoverChatResponse, { status: 429 });
  }

  const history = body.messages.slice(-MAX_MESSAGES).map((m) => ({ role: m.role, content: clip(m.content, MAX_MESSAGE_CHARS) }));

  try {
    const r = await chatText(keys, history, systemPrompt(body, true), systemPrompt(body, false));
    return Response.json({ configured: true, reply: r.text.trim(), sources: r.sources.slice(0, 6), webSearch: r.webSearch, provider: r.provider } satisfies DiscoverChatResponse);
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.warn("Discover chat failed:", detail);
    return Response.json({ configured: true, error: "I couldn't answer that just now. Please try again in a moment.", detail } satisfies DiscoverChatResponse);
  }
}
