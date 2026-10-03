import { heritageList } from "@/data/heritages";
import type { LiveResultItem, LiveSearchCategory, LiveSearchRequest } from "@/services/gemini/types";

/**
 * Parsing and prompt-schema helpers shared by every LLM provider (Gemini,
 * Groq, and any future one). Providers differ in how you call them, but they
 * all need to be told the same JSON shape and have their text response
 * parsed the same defensive way, so that logic lives here once.
 */

/** Keep user-supplied text bounded before it goes into a prompt. */
export const MAX_FIELD_LEN = 200;

export function clip(s: string, max = MAX_FIELD_LEN): string {
  return s.trim().slice(0, max);
}

export const SCHEMAS_BY_CATEGORY: Record<LiveSearchCategory, string> = {
  community:
    '{"name": string, "platform": string (e.g. "Reddit", "Facebook", "Meetup", "Discord", "Website"), "description": string (1-2 sentences), "locationLabel": string, "isOnline": boolean, "type": one of "social"|"student"|"professional"|"cultural"|"religious"|"local", "tags": string[], "externalUrl": string (optional — include it if you know the real URL, but omit it rather than guessing; a real name is still useful without one)}',
  food: '{"name": string, "category": one of "restaurant"|"grocery"|"market"|"bakery"|"cafe", "description": string (1-2 sentences), "address": string, "city": string, "state": string, "rating": number (optional, 1-5), "tags": string[], "externalUrl": string (optional, the business website or map link)}',
  places:
    '{"name": string, "category": one of "temple"|"mosque"|"church"|"cultural-center"|"museum"|"heritage-site"|"community-center", "description": string (1-2 sentences), "address": string, "city": string, "state": string, "rating": number (optional, 1-5), "tags": string[], "externalUrl": string (optional)}',
  events:
    '{"name": string, "date": string (ISO YYYY-MM-DD if known, else omit), "venue": string, "city": string, "state": string, "description": string (1-2 sentences), "category": one of "festival"|"religious"|"community"|"workshop"|"performance"|"food", "organizer": string (optional, the group or venue putting it on), "price": string (optional, e.g. "Free" or "$10"), "address": string (optional, the venue street address), "performers": string[] (optional, named performers, speakers, or hosts, only if the source lists them), "ticketInfo": string (optional, where and how to buy tickets or RSVP), "tags": string[], "externalUrl": string (optional, the official event or ticket page, only if real)}',
  recipe:
    '{"name": string, "sourceName": string (the publisher/website name, e.g. "Serious Eats"), "description": string (1-2 sentences, original wording, not copied from the source), "difficulty": one of "easy"|"medium"|"hard", "timeMinutes": number, "tags": string[], "externalUrl": string (optional — include it if you know the real recipe page URL, but omit it rather than guessing; the dish name and source website are still useful without one)}',
  mentorProgram:
    '{"name": string, "organizationType": string (e.g. "Professional association", "Mentorship program", "Student chapter"), "description": string (1-2 sentences), "locationLabel": string, "tags": string[], "externalUrl": string (optional — include it if you know the real URL, but omit it rather than guessing)}',
};

const SEARCH_SUBJECT_BY_CATEGORY: Record<LiveSearchCategory, (who: string) => string> = {
  community: (who) => `real, currently active public communities or organizations (subreddits, Facebook groups, Meetup groups, Discord servers, or local associations) for ${who}`,
  food: (who) => `real restaurants, grocery stores, bakeries, or markets connected to ${who}`,
  places: (who) => `real cultural or religious places (temples, mosques, churches, museums, cultural centers, heritage sites) connected to ${who}`,
  events: (who) => `real, upcoming or recurring cultural events, festivals, or workshops connected to ${who}`,
  recipe: (who) => `real recipes published by real cooking websites or publishers for ${who}`,
  // Deliberately organizations/programs, never named private individuals:
  // presenting a real person as an available mentor without their consent
  // would be a misuse of a real identity, not a feature.
  mentorProgram: (who) => `real professional associations, mentorship programs, or student/professional networking organizations for ${who}`,
};

export function buildSearchPrompt(req: LiveSearchRequest, grounded: boolean, maxResults: number): string {
  const heritage = req.heritages.length ? heritageList(req.heritages.slice(0, 5).map((h) => clip(h, 40))) : null;
  const place = req.city ? `near ${clip(req.city, 80)}${req.state ? `, ${clip(req.state, 40)}` : ""}` : "in the United States";
  const query = clip(req.query, MAX_FIELD_LEN);
  const who = heritage ? `${heritage} diaspora communities` : "diaspora communities";

  const groundedInstructions = grounded
    ? [
        `Search the web and find up to ${maxResults} ${SEARCH_SUBJECT_BY_CATEGORY[req.category](who)} ${place}.`,
        `Only include real, verifiable ones you can find current information about. If you find fewer than ${maxResults}, or none at all, that's fine — do not invent or guess ones you're not confident about.`,
      ]
    : [
        `You do not have live web access right now. From your own trained knowledge, name up to ${maxResults} ${SEARCH_SUBJECT_BY_CATEGORY[req.category](who)} ${place}.`,
        `Be conservative about the NAME: only include ones you are genuinely confident actually exist. It is much better to return fewer results, or none, than to invent a plausible-sounding but fake one.`,
        `The URL is a separate, lower bar: include it only if you actually know the real one, but not knowing an exact URL is not a reason to drop an otherwise-confident result — just omit that field.`,
      ];

  return [
    ...groundedInstructions,
    query ? `The person searched for: "${query}". Prioritize results relevant to that.` : "",
    `Respond with ONLY a JSON array (no markdown code fences, no commentary before or after). Each item must match this shape: ${SCHEMAS_BY_CATEGORY[req.category]}.`,
    `If you find nothing suitable, respond with exactly: []`,
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * Unlike buildSearchPrompt, this never claims the result is a real, existing
 * listing — it asks the model to synthesize one clearly-labeled example
 * (e.g. an original recipe, or a description of the kind of place someone
 * would look for) from its general knowledge. Only sensible for content
 * categories, not for claims about specific real-world entities: recipes are
 * fine (a recipe is a set of instructions, not a claim that a place exists),
 * but callers should still label generated output as an AI example, not a
 * verified listing.
 */
export function buildGeneratePrompt(req: LiveSearchRequest): string {
  const heritage = req.heritages.length ? heritageList(req.heritages.slice(0, 5).map((h) => clip(h, 40))) : null;
  const query = clip(req.query, MAX_FIELD_LEN);
  const heritageNote = heritage ? ` The person has ${heritage} heritage — lean on that cuisine/tradition if it's relevant and the query doesn't specify otherwise.` : "";

  const instructionByCategory: Record<LiveSearchCategory, string> = {
    recipe: `Write one original, authentic, respectful recipe for exactly what was asked: "${query}".${heritageNote} Use genuine culinary knowledge of the dish's real preparation — don't invent a fake variant. If "${query}" isn't a real, recognizable dish you have genuine knowledge of, say so by responding with exactly [] rather than inventing one.`,
    community: `The person asked: "${query}". Don't invent a specific real group or claim one exists. Instead, describe in 1-2 sentences the KIND of community that would match this (e.g. "a Discord server or Facebook group for X"), and suggest a concrete, generic way to find one (a specific platform and search term). Respond as one item with an empty or generic "name" like "How to find this" and put the guidance in "description".`,
    places: `The person asked: "${query}". Don't invent a specific real place or claim one exists. Instead, describe in 1-2 sentences what this kind of place typically is/looks like, and suggest a concrete way to find a real one nearby (e.g. what to search for). Respond as one item with a generic "name" like "How to find this" and put the guidance in "description".`,
    food: `The person asked: "${query}". Don't invent a specific real restaurant/shop or claim one exists. Instead, describe in 1-2 sentences what to look for, and suggest a concrete way to find a real one nearby. Respond as one item with a generic "name" like "How to find this" and put the guidance in "description".`,
    events: `The person asked: "${query}". Don't invent a specific real event, date, or venue. Instead, explain in 1-2 sentences what this occasion/celebration typically involves and when it's typically celebrated, and suggest a concrete way to find a real local one. Respond as one item with a generic "name" like "About this occasion" and put the explanation in "description".`,
    mentorProgram: `The person asked: "${query}". Don't invent a specific real organization or claim one exists. Instead, describe in 1-2 sentences what kind of professional association or program would fit, and suggest a concrete way to search for a real one. Respond as one item with a generic "name" like "How to find this" and put the guidance in "description".`,
  };

  return [
    instructionByCategory[req.category],
    `Respond with ONLY a JSON array containing exactly one item (or [] if you genuinely can't help), no markdown fences, no commentary. The item must match this shape: ${SCHEMAS_BY_CATEGORY[req.category]}.`,
    req.category === "recipe" ? `For the recipe, ALSO include: "ingredients": string[] (each a full ingredient line with quantity) and "steps": string[] (numbered-order instructions, each one sentence).` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export const isNonEmptyString = (v: unknown): v is string => typeof v === "string" && v.trim().length > 0;
export const asStringArray = (v: unknown, max = 8): string[] => (Array.isArray(v) ? v.filter(isNonEmptyString).slice(0, max) : []);

export function extractJsonArray(text: string): unknown[] {
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  const start = cleaned.indexOf("[");
  const end = cleaned.lastIndexOf("]");
  if (start === -1 || end === -1 || end < start) return [];
  try {
    const parsed: unknown = JSON.parse(cleaned.slice(start, end + 1));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

const SEARCH_HOSTS = /(^|\.)(google|bing|duckduckgo|yahoo|baidu|ecosia|startpage)\.[a-z.]+$/i;

/**
 * Only a real, specific destination counts as a link. Anything that isn't
 * plain http(s), or that is just a search-results page (a search engine, or
 * a platform's own group/event search), is dropped: a result is better off
 * with no link than with one that dumps the person on a list of search hits.
 * Model output is untrusted text, so this also keeps `javascript:` and other
 * schemes out of an href.
 */
export function realDestinationUrl(raw: unknown): string | undefined {
  if (!isNonEmptyString(raw)) return undefined;
  let u: URL;
  try {
    u = new URL(raw.trim());
  } catch {
    return undefined;
  }
  if (u.protocol !== "https:" && u.protocol !== "http:") return undefined;
  const host = u.hostname.toLowerCase();
  const path = u.pathname.toLowerCase();
  if (SEARCH_HOSTS.test(host) && (path === "/" || path.startsWith("/search") || path.startsWith("/url"))) return undefined;
  if (/(^|\.)facebook\.com$/.test(host) && /\/(search|groups\/search)/.test(path)) return undefined;
  if (/(^|\.)meetup\.com$/.test(host) && path.startsWith("/find")) return undefined;
  if (/(^|\.)reddit\.com$/.test(host) && path.startsWith("/search")) return undefined;
  if (/(^|\.)linkedin\.com$/.test(host) && path.includes("/search")) return undefined;
  if (/(^|\.)disboard\.org$/.test(host) && path.startsWith("/servers/tag")) return undefined;
  return u.toString();
}

export function toItem(raw: unknown, category: LiveSearchCategory): LiveResultItem | null {
  if (typeof raw !== "object" || raw === null) return null;
  const r = raw as Record<string, unknown>;
  if (!isNonEmptyString(r.name) || !isNonEmptyString(r.description)) return null;
  const tags = asStringArray(r.tags);
  const externalUrl = realDestinationUrl(r.externalUrl);

  switch (category) {
    case "community":
      return {
        kind: "community",
        name: r.name,
        description: r.description,
        platform: isNonEmptyString(r.platform) ? r.platform : "Website",
        locationLabel: isNonEmptyString(r.locationLabel) ? r.locationLabel : "Online",
        isOnline: r.isOnline !== false,
        type: isNonEmptyString(r.type) ? r.type : "social",
        tags,
        externalUrl,
      };
    case "food":
    case "places":
      if (!isNonEmptyString(r.address) || !isNonEmptyString(r.city)) return null;
      return {
        kind: "place",
        name: r.name,
        description: r.description,
        category: isNonEmptyString(r.category) ? r.category : category === "food" ? "restaurant" : "cultural-center",
        address: r.address,
        city: r.city,
        state: isNonEmptyString(r.state) ? r.state : "",
        rating: typeof r.rating === "number" && r.rating > 0 && r.rating <= 5 ? r.rating : undefined,
        tags,
        externalUrl,
      };
    case "events":
      if (!isNonEmptyString(r.venue)) return null;
      return {
        kind: "event",
        name: r.name,
        description: r.description,
        date: isNonEmptyString(r.date) && /^\d{4}-\d{2}-\d{2}$/.test(r.date) ? r.date : undefined,
        venue: r.venue,
        city: isNonEmptyString(r.city) ? r.city : "",
        state: isNonEmptyString(r.state) ? r.state : "",
        category: isNonEmptyString(r.category) ? r.category : "community",
        organizer: isNonEmptyString(r.organizer) ? r.organizer : undefined,
        price: isNonEmptyString(r.price) ? r.price : undefined,
        address: isNonEmptyString(r.address) ? r.address : undefined,
        performers: asStringArray(r.performers, 10),
        ticketInfo: isNonEmptyString(r.ticketInfo) ? r.ticketInfo : undefined,
        tags,
        externalUrl,
      };
    case "recipe":
      return {
        kind: "recipe",
        name: r.name,
        description: r.description,
        sourceName: isNonEmptyString(r.sourceName) ? r.sourceName : "Web",
        difficulty: r.difficulty === "easy" || r.difficulty === "medium" || r.difficulty === "hard" ? r.difficulty : undefined,
        timeMinutes: typeof r.timeMinutes === "number" && r.timeMinutes > 0 ? r.timeMinutes : undefined,
        tags,
        externalUrl,
        ingredients: asStringArray(r.ingredients, 25),
        steps: asStringArray(r.steps, 20),
      };
    case "mentorProgram":
      return {
        kind: "program",
        name: r.name,
        description: r.description,
        organizationType: isNonEmptyString(r.organizationType) ? r.organizationType : "Organization",
        locationLabel: isNonEmptyString(r.locationLabel) ? r.locationLabel : "Online",
        tags,
        externalUrl,
      };
  }
}
