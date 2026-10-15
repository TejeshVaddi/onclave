import type { LivePerson, LiveSource, PeopleSearchRequest } from "@/services/gemini/types";
import { heritageList } from "@/data/heritages";
import { clip, extractJsonArray, isNonEmptyString, asStringArray } from "@/services/llm/shared";
import { hostOf, isPublicHttpUrl, nameScore, normalizeText, probePage } from "@/services/llm/verify";

/**
 * Finding real people to learn from. This is held to a stricter standard than
 * places or events: a person is shown only if a public page the server opened
 * names them, connects them to their organization, and shows that they
 * welcome questions or mentoring. Contact details are kept only when they are
 * printed on that same page, so nothing is guessed or constructed.
 */

export function buildPeoplePrompt(req: PeopleSearchRequest, maxResults: number): string {
  const heritage = req.heritages.length ? heritageList(req.heritages.slice(0, 4).map((h) => clip(h, 40))) : null;
  const place = req.city ? `in or near ${clip(req.city, 80)}${req.state ? `, ${clip(req.state, 40)}` : ""}, or working remotely` : "anywhere in the United States";
  const query = clip(req.query, 200);

  return [
    `Search the web and find up to ${maxResults} real adults in public-facing professional roles who work in ${clip(req.professionLabel, 80)} (${clip(req.industry, 60)}) and whom a student or early-career person${heritage ? ` from a ${heritage} background` : ""} could contact for advice, ${place}.`,
    `Prefer people who are (a) listed as mentors, advisors, or speakers by a professional association, a university program, a company mentoring program, or a mentoring platform; (b) faculty or program staff whose own page invites students to get in touch; or (c) leaders of professional or cultural association chapters${heritage ? `, for example ${heritage} professional groups` : ""}.`,
    `Only include a person if a public page you found says they offer mentoring or office hours, welcome questions from students or early-career people, or invites contact.`,
    `Rules:`,
    `- Use only what that page states. Never infer a person's ethnicity, heritage, religion, age, or anything personal from their name, photo, or appearance. Fill "culturalFit" only if the page itself states a cultural background, membership in a cultural professional association, or leadership of a community organization.`,
    `- Never guess, derive, or construct an email address, LinkedIn URL, or username. Include "email" only if it is printed on that page as a way to contact them professionally, and "linkedin" only if that page links to their profile.`,
    `- No phone numbers, home addresses, family details, or personal social accounts. No private individuals and no one under 18.`,
    `- "evidenceUrl" must be the exact URL of the page you read about this person. A server will open it and discard the person if the page does not name them, their organization, and their openness to questions.`,
    query ? `The person also said: "${query}". Prioritize people relevant to that.` : "",
    `Respond with ONLY a JSON array (no markdown fences, no commentary). Each item: {"name": string (full name exactly as on the page), "title": string, "organization": string, "location": string (optional), "fieldFit": string (one sentence on how their work matches ${clip(req.professionLabel, 80)}), "culturalFit": string (optional, per the rule above), "mentoringEvidence": string (a short phrase from the page showing they welcome questions or mentoring), "evidenceUrl": string, "linkedin": string (optional), "email": string (optional), "website": string (optional), "social": string[] (optional, professional profile URLs the page links to)}.`,
    `If you find nothing that meets every rule, respond with exactly: []`,
  ]
    .filter(Boolean)
    .join("\n");
}

const TITLE_WORDS = new Set(["dr", "prof", "professor", "mr", "ms", "mrs", "mx", "phd", "md", "jr", "sr", "ii", "iii"]);

function nameTokens(name: string): string[] {
  return normalizeText(name)
    .replace(/[^a-z\s'-]/g, " ")
    .split(/\s+/)
    .map((t) => t.replace(/^['-]+|['-]+$/g, ""))
    .filter((t) => t.length > 1 && !TITLE_WORDS.has(t));
}

const MENTORING_WORDS =
  /mentor|office hours|happy to (answer|help|chat|talk|share|connect)|feel free to (reach|contact|email|get in touch)|reach out|get in touch|contact me|ask me|advis(e|er|or|ing)|coach|students? (are )?(welcome|encouraged)|questions? (are )?welcome/;

function significantWords(s: string): string[] {
  return normalizeText(s)
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3);
}

function overlap(snippet: string, pageText: string): number {
  const words = significantWords(snippet);
  if (!words.length) return 0;
  return words.filter((w) => pageText.includes(w)).length / words.length;
}

const EMAIL_RE = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
const LINKEDIN_RE = /^https?:\/\/([a-z]{2,3}\.)?linkedin\.com\/in\/([a-z0-9\-_%]+)\/?$/i;
const SOCIAL_HOSTS = ["x.com", "twitter.com", "instagram.com", "github.com", "threads.net", "youtube.com", "medium.com", "substack.com"];

/** Keeps the people the page actually supports, with only the contact details printed on it. */
export async function verifyPeople(raw: unknown[]): Promise<LivePerson[]> {
  const candidates = raw.filter((r): r is Record<string, unknown> => typeof r === "object" && r !== null);

  const checked = await Promise.all(
    candidates.slice(0, 14).map(async (r): Promise<LivePerson | null> => {
      if (![r.name, r.title, r.organization, r.fieldFit, r.mentoringEvidence, r.evidenceUrl].every(isNonEmptyString)) return null;
      const name = r.name as string;
      const organization = r.organization as string;
      const evidenceUrl = r.evidenceUrl as string;
      if (!isPublicHttpUrl(evidenceUrl)) return null;
      // Pages that block checks (LinkedIn, Facebook) cannot prove anything, so they cannot be the evidence.
      const probe = await probePage(evidenceUrl, false);
      if (!probe.readable) return null;

      const tokens = nameTokens(name);
      if (tokens.length < 2 || !tokens.every((t) => probe.text.includes(t))) return null;
      if (nameScore(organization, probe.text) < 0.5) return null;
      if (!MENTORING_WORDS.test(probe.text)) return null;
      if (overlap(r.mentoringEvidence as string, probe.text) < 0.4) return null;

      const html = probe.html.toLowerCase();
      const contacts: LivePerson["contacts"] = {};

      if (isNonEmptyString(r.email) && EMAIL_RE.test(r.email.trim()) && html.includes(r.email.trim().toLowerCase())) {
        contacts.email = r.email.trim();
      }
      if (isNonEmptyString(r.linkedin)) {
        const m = r.linkedin.trim().match(LINKEDIN_RE);
        if (m && html.includes(`/in/${m[2].toLowerCase()}`)) contacts.linkedin = `linkedin.com/in/${m[2]}`;
      }
      if (isNonEmptyString(r.website) && isPublicHttpUrl(r.website)) {
        const host = hostOf(r.website);
        if (host && (host === hostOf(probe.finalUrl) || html.includes(host))) contacts.website = r.website.trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
      }
      const social = asStringArray(r.social, 4)
        .filter((u) => isPublicHttpUrl(u) && SOCIAL_HOSTS.some((h) => hostOf(u) === h || hostOf(u).endsWith(`.${h}`)) && html.includes(hostOf(u)))
        .map((u) => u.trim().replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, ""));
      if (social.length) contacts.social = social;

      return {
        name: name.trim(),
        title: (r.title as string).trim(),
        organization: organization.trim(),
        location: isNonEmptyString(r.location) ? r.location.trim() : undefined,
        fieldFit: (r.fieldFit as string).trim(),
        culturalFit: isNonEmptyString(r.culturalFit) ? r.culturalFit.trim() : undefined,
        mentoringEvidence: (r.mentoringEvidence as string).trim(),
        evidenceUrl: probe.finalUrl,
        sourceTitle: probe.title || hostOf(probe.finalUrl),
        contacts,
      };
    }),
  );

  const seen = new Set<string>();
  return checked.filter((p): p is LivePerson => {
    if (!p) return false;
    const key = normalizeText(p.name);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function parsePeople(text: string): unknown[] {
  return extractJsonArray(text);
}

export type { LiveSource };
