import { callGemini, callGeminiGrounded } from "@/services/gemini/client";
import { callGroq } from "@/services/groq/client";
import { clip, asStringArray, isNonEmptyString } from "@/services/llm/shared";
import type { PersonAssistResponse, PersonDraft, PersonMoreInfo } from "@/services/gemini/types";

export const maxDuration = 60;

interface PersonRef {
  name: string;
  title: string;
  organization: string;
  fieldFit: string;
  mentoringEvidence: string;
  evidenceUrl: string;
}

interface SenderRef {
  name: string;
  heritages: string[];
  professionLabel: string;
  interests: string[];
  city: string;
  state: string;
}

type Body = { action: "more-info"; person: PersonRef } | { action: "draft"; person: PersonRef; sender: SenderRef };

function isPerson(p: unknown): p is PersonRef {
  if (typeof p !== "object" || p === null) return false;
  const o = p as Record<string, unknown>;
  return ["name", "title", "organization", "fieldFit", "mentoringEvidence", "evidenceUrl"].every((k) => typeof o[k] === "string");
}

function isBody(b: unknown): b is Body {
  if (typeof b !== "object" || b === null) return false;
  const o = b as Record<string, unknown>;
  if (!isPerson(o.person)) return false;
  if (o.action === "more-info") return true;
  if (o.action !== "draft") return false;
  const s = o.sender as Record<string, unknown> | undefined;
  return !!s && typeof s.name === "string" && typeof s.professionLabel === "string" && Array.isArray(s.heritages) && Array.isArray(s.interests);
}

function parseObject(text: string): Record<string, unknown> | null {
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "");
  const a = cleaned.indexOf("{");
  const b = cleaned.lastIndexOf("}");
  if (a === -1 || b < a) return null;
  try {
    const v: unknown = JSON.parse(cleaned.slice(a, b + 1));
    return typeof v === "object" && v !== null && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

function moreInfoPrompt(p: PersonRef): string {
  return [
    `Find more public professional information about ${clip(p.name, 80)}, ${clip(p.title, 100)} at ${clip(p.organization, 100)}. A page that describes them: ${clip(p.evidenceUrl, 300)}.`,
    `Use only public professional pages: their organization's page, talks, publications, interviews, or a professional association listing. Make sure every fact is about this same person, not someone who shares the name; if you cannot be sure, leave it out.`,
    `Leave out anything personal: family, age, home, health, religion, politics, relationships, and personal social media. Never guess or construct contact details.`,
    `Respond with ONLY a JSON object (no markdown fences): {"summary": string (2-3 sentences on what they do and have done), "careerHighlights": string[] (up to 5), "mentoringTopics": string[] (up to 5, topics the pages say they can help with), "publicWork": [{"title": string, "where": string}] (up to 5 talks, papers, projects, or articles that exist), "contactGuidance": string (how their pages say to get in touch, in your own words, or an empty string)}.`,
  ].join("\n");
}

function draftPrompt(p: PersonRef, s: SenderRef): string {
  const first = clip(s.name, 60).split(/\s+/)[0] || "[your name]";
  return [
    `Write a first message from a student or early-career person to a professional they found on a public page. Be warm, specific, and honest.`,
    `Sender: ${clip(s.name, 60) || "[your name]"}. Interested in: ${clip(s.professionLabel, 80)}. Background: ${s.heritages.length ? s.heritages.slice(0, 4).map((h) => clip(h, 40)).join(", ") : "not stated"}. Location: ${clip(`${s.city} ${s.state}`, 80) || "not stated"}. Other interests: ${s.interests.slice(0, 5).map((i) => clip(i, 40)).join(", ") || "not stated"}.`,
    `Recipient: ${clip(p.name, 80)}, ${clip(p.title, 100)} at ${clip(p.organization, 100)}. Their work: ${clip(p.fieldFit, 200)}. What their page says about questions or mentoring: "${clip(p.mentoringEvidence, 240)}".`,
    `Rules: do not invent shared experiences, schools, mutual contacts, or accomplishments; where a detail is unknown, leave a bracketed placeholder like [your school or program]. Mention the sender's background only if it is natural and was provided. Ask for a short 15-minute conversation or answers to two specific questions, and say it is fine to decline. No flattery, no pressure. Sign off with the sender's first name (${first}).`,
    `Respond with ONLY a JSON object (no markdown fences): {"subject": string (under 70 characters), "email": string (120 to 170 words, plain text with line breaks as \\n), "linkedinNote": string (under 280 characters), "directMessage": string (under 450 characters, for a social platform)}.`,
  ].join("\n");
}

function toMoreInfo(o: Record<string, unknown>): PersonMoreInfo | null {
  if (!isNonEmptyString(o.summary)) return null;
  const publicWork = Array.isArray(o.publicWork)
    ? o.publicWork
        .filter((w): w is Record<string, unknown> => typeof w === "object" && w !== null)
        .map((w) => ({ title: isNonEmptyString(w.title) ? w.title.trim() : "", where: isNonEmptyString(w.where) ? w.where.trim() : "" }))
        .filter((w) => w.title)
        .slice(0, 5)
    : [];
  return {
    summary: o.summary.trim(),
    careerHighlights: asStringArray(o.careerHighlights, 5),
    mentoringTopics: asStringArray(o.mentoringTopics, 5),
    publicWork,
    contactGuidance: isNonEmptyString(o.contactGuidance) ? o.contactGuidance.trim() : "",
  };
}

function toDraft(o: Record<string, unknown>): PersonDraft | null {
  if (![o.subject, o.email, o.linkedinNote, o.directMessage].every(isNonEmptyString)) return null;
  return {
    subject: (o.subject as string).trim(),
    email: (o.email as string).replace(/\\n/g, "\n").trim(),
    linkedinNote: (o.linkedinNote as string).trim(),
    directMessage: (o.directMessage as string).trim(),
  };
}

export async function POST(request: Request): Promise<Response> {
  const geminiKey = process.env.GEMINI_API_KEY?.trim();
  const groqKey = process.env.GROQ_API_KEY?.trim();
  if (!geminiKey && !groqKey) return Response.json({ configured: false } satisfies PersonAssistResponse);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ configured: true, error: "Invalid request." } satisfies PersonAssistResponse, { status: 400 });
  }
  if (!isBody(body)) return Response.json({ configured: true, error: "Invalid request." } satisfies PersonAssistResponse, { status: 400 });

  if (body.action === "more-info") {
    // Needs live web access: a model answering from memory would invent a career.
    if (!geminiKey) return Response.json({ configured: true, error: "Looking up more information needs web search." } satisfies PersonAssistResponse);
    try {
      const { text, sources } = await callGeminiGrounded(geminiKey, moreInfoPrompt(body.person));
      const info = toMoreInfo(parseObject(text) ?? {});
      if (!info) return Response.json({ configured: true, error: "Couldn't find more public information." } satisfies PersonAssistResponse);
      return Response.json({ configured: true, info, sources: sources.slice(0, 8) } satisfies PersonAssistResponse);
    } catch (err) {
      console.warn("Person more-info failed:", err instanceof Error ? err.message : err);
      return Response.json({ configured: true, error: "Couldn't look that up right now." } satisfies PersonAssistResponse);
    }
  }

  const prompt = draftPrompt(body.person, body.sender);
  if (geminiKey) {
    try {
      const { text } = await callGemini(geminiKey, prompt, false);
      const draft = toDraft(parseObject(text) ?? {});
      if (draft) return Response.json({ configured: true, draft } satisfies PersonAssistResponse);
    } catch (err) {
      console.warn("Gemini draft failed, trying Groq:", err instanceof Error ? err.message : err);
    }
  }
  if (groqKey) {
    try {
      const draft = toDraft(parseObject(await callGroq(groqKey, prompt)) ?? {});
      if (draft) return Response.json({ configured: true, draft } satisfies PersonAssistResponse);
    } catch (err) {
      console.warn("Groq draft failed:", err instanceof Error ? err.message : err);
    }
  }
  return Response.json({ configured: true, error: "Couldn't write a draft right now." } satisfies PersonAssistResponse);
}

