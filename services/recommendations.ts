import type {
  Community,
  CulturalEvent,
  Mentor,
  Pillar,
  Place,
  Recipe,
  Recommendation,
  RecommendationKind,
  RecommendationReason,
  User,
} from "@/types";
import { staticData } from "./dataSource";
import { distanceMiles, formatDistance } from "@/lib/geo";
import { daysUntil } from "@/lib/format";
import { heritageLabel, heritageList } from "@/data/heritages";
import { getInterest, interestLabel } from "@/data/interests";
import { getProfession, professionLabel } from "@/data/professions";
import { isUpcoming } from "./eventService";

/**
 * Onclave recommendation engine (MVP).
 *
 * A deterministic, explainable scorer. Each item earns points from the
 * signals in the user's profile; the reasons are surfaced in the UI so users
 * can see *why* something was recommended. The weights below are the whole
 * "model" and are intentionally easy to tune. A future version can augment
 * these scores with an LLM re-ranker or collaborative signals.
 */
export const WEIGHTS = {
  heritage: 40,
  location: 30,
  profession: 30,
  industry: 15,
  interest: 12,
  interestCap: 24,
  goal: 10,
  timing: 10,
  online: 8,
} as const;

interface Scored {
  score: number;
  reasons: RecommendationReason[];
}

const add = (s: Scored, signal: RecommendationReason["signal"], label: string, points: number) => {
  if (points <= 0) return;
  s.score += points;
  s.reasons.push({ signal, label, points });
};

/* ------------------------------------------------------------------ */
/* Signal helpers                                                      */
/* ------------------------------------------------------------------ */

function heritageSignal(user: User, itemHeritages: string[]): { matched: string[]; label: string } {
  const matched = itemHeritages.filter((h) => user.heritages.includes(h));
  return {
    matched,
    label: matched.length ? `Matches your ${heritageList(matched)} heritage` : "",
  };
}

function locationPoints(user: User, geo?: { lat: number; lng: number }): { points: number; label: string } {
  if (!geo || user.location.lat == null || user.location.lng == null) return { points: 0, label: "" };
  const miles = distanceMiles({ lat: user.location.lat, lng: user.location.lng }, geo);
  let points = 0;
  if (miles <= 10) points = WEIGHTS.location;
  else if (miles <= 25) points = Math.round(WEIGHTS.location * 0.75);
  else if (miles <= 50) points = Math.round(WEIGHTS.location * 0.45);
  else if (miles <= 100) points = Math.round(WEIGHTS.location * 0.2);
  return { points, label: points ? `${formatDistance(miles)} from ${user.location.city}` : "" };
}

function interestPoints(user: User, tags: string[]): { points: number; matched: string[] } {
  const normalized = tags.map((t) => t.toLowerCase());
  const matched = user.interests.filter((i) => {
    const interest = getInterest(i);
    const label = interest?.label.toLowerCase() ?? i;
    return normalized.includes(i) || normalized.includes(label);
  });
  return { points: Math.min(WEIGHTS.interestCap, matched.length * WEIGHTS.interest), matched };
}

function interestLabelList(ids: string[]): string {
  return ids.slice(0, 2).map(interestLabel).join(" & ");
}

/* ------------------------------------------------------------------ */
/* Per-kind scorers                                                    */
/* ------------------------------------------------------------------ */

const COMMUNITY_TYPE_INTERESTS: Record<Community["type"], string[]> = {
  social: ["community"],
  student: ["students", "community"],
  professional: ["stem", "medicine", "business", "law", "education", "creative-careers"],
  cultural: ["festivals", "arts", "language", "history", "music"],
  religious: ["religion"],
  local: ["community", "volunteering"],
};

export function scoreCommunity(user: User, c: Community): Scored {
  const s: Scored = { score: 0, reasons: [] };
  const h = heritageSignal(user, c.heritages);
  if (c.heritages.length && !h.matched.length) return s; // heritage mismatch: exclude
  if (h.matched.length) add(s, "heritage", h.label, WEIGHTS.heritage);

  if (c.isOnline) add(s, "location", "Online, join from anywhere", WEIGHTS.online);
  else {
    const loc = locationPoints(user, c.geo);
    add(s, "location", loc.label, loc.points);
  }

  const typeTags = [...c.tags, ...COMMUNITY_TYPE_INTERESTS[c.type]];
  const ip = interestPoints(user, typeTags);
  if (ip.points) add(s, "interest", `You're interested in ${interestLabelList(ip.matched)}`, ip.points);

  if (c.type === "professional" && user.profession) {
    add(s, "profession", `Professional network for your field`, Math.round(WEIGHTS.profession * 0.5));
  }
  if (c.type === "professional" && user.wantsMentorship) add(s, "goal", "You asked for mentorship", WEIGHTS.goal);
  return s;
}

export function scoreRecipe(user: User, r: Recipe): Scored {
  const s: Scored = { score: 0, reasons: [] };
  const h = heritageSignal(user, r.heritages);
  if (!h.matched.length) return s;
  const primary = user.heritages.includes(r.cuisine);
  add(s, "heritage", primary ? `${heritageLabel(r.cuisine)} cuisine, part of your heritage` : h.label, primary ? WEIGHTS.heritage : Math.round(WEIGHTS.heritage * 0.7));
  const ip = interestPoints(user, r.tags);
  if (ip.points) add(s, "interest", `You're interested in ${interestLabelList(ip.matched)}`, ip.points);
  if (r.difficulty === "easy") add(s, "interest", "Quick to try", 3);
  return s;
}

export function scorePlace(user: User, p: Place): Scored {
  const s: Scored = { score: 0, reasons: [] };
  const h = heritageSignal(user, p.heritages);
  if (!h.matched.length) return s;
  add(s, "heritage", h.label, WEIGHTS.heritage);
  const loc = locationPoints(user, p.geo);
  add(s, "location", loc.label, loc.points);
  const tags = p.kind === "food" ? [...p.tags, "food"] : [...p.tags, "history", "religion", "arts"];
  const ip = interestPoints(user, tags);
  if (ip.points) add(s, "interest", `You're interested in ${interestLabelList(ip.matched)}`, ip.points);
  if (p.rating && p.rating >= 4.6) add(s, "interest", "Highly rated", 4);
  return s;
}

const EVENT_CATEGORY_INTERESTS: Record<CulturalEvent["category"], string[]> = {
  festival: ["festivals", "music", "food", "family"],
  religious: ["religion", "family"],
  community: ["community", "volunteering"],
  workshop: ["stem", "medicine", "business", "law", "language", "education", "creative-careers"],
  performance: ["music", "arts"],
  food: ["food"],
};

export function scoreEvent(user: User, e: CulturalEvent, now = new Date()): Scored {
  const s: Scored = { score: 0, reasons: [] };
  if (!isUpcoming(e, now)) return s;
  const h = heritageSignal(user, e.heritages);
  if (!h.matched.length) return s;
  add(s, "heritage", h.label, WEIGHTS.heritage);

  if (e.isVirtual) add(s, "location", "Online event", WEIGHTS.online);
  else {
    const loc = locationPoints(user, e.geo);
    add(s, "location", loc.label, loc.points);
  }

  const ip = interestPoints(user, [...e.tags, ...EVENT_CATEGORY_INTERESTS[e.category]]);
  if (ip.points) add(s, "interest", `You're interested in ${interestLabelList(ip.matched)}`, ip.points);

  if (e.category === "workshop" && user.profession) {
    const prof = getProfession(user.profession);
    const hay = `${e.name} ${e.description} ${e.tags.join(" ")}`.toLowerCase();
    if (prof && prof.keywords.some((k) => hay.includes(k))) add(s, "profession", `Relevant to ${prof.label}`, WEIGHTS.industry);
  }

  const d = daysUntil(e.date, now);
  if (d <= 2) add(s, "timing", d === 0 ? "Happening today" : "Happening this weekend", WEIGHTS.timing);
  else if (d <= 7) add(s, "timing", "Happening this week", Math.round(WEIGHTS.timing * 0.8));
  else if (d <= 30) add(s, "timing", "Coming up this month", Math.round(WEIGHTS.timing * 0.4));
  return s;
}

export function scoreMentor(user: User, m: Mentor): Scored {
  const s: Scored = { score: 0, reasons: [] };
  const h = heritageSignal(user, m.heritages);
  if (h.matched.length) add(s, "heritage", h.label, WEIGHTS.heritage);

  const loc = locationPoints(user, m.geo);
  add(s, "location", loc.label, loc.points);

  if (user.profession) {
    const userProf = getProfession(user.profession);
    if (m.profession === user.profession) {
      add(s, "profession", `Mentors in ${professionLabel(m.profession)}`, WEIGHTS.profession);
    } else if (userProf && userProf.industry === m.industry) {
      add(s, "profession", `Works in ${m.industry}, your industry`, WEIGHTS.industry);
    }
  }

  const ip = interestPoints(user, m.interests);
  if (ip.points) add(s, "interest", `Shares your interest in ${interestLabelList(ip.matched)}`, ip.points);

  if (user.wantsMentorship) {
    add(s, "goal", "You asked for mentorship", WEIGHTS.goal);
    if (m.availability === "open") add(s, "goal", "Accepting mentees now", 4);
  }
  // Require at least one strong signal so results stay relevant.
  const strong = s.reasons.some((r) => r.signal === "heritage" || r.signal === "profession");
  return strong ? s : { score: 0, reasons: [] };
}

/* ------------------------------------------------------------------ */
/* Aggregation                                                         */
/* ------------------------------------------------------------------ */

const PILLAR_OF: Record<RecommendationKind, Pillar> = {
  community: "community",
  recipe: "culture",
  "food-place": "culture",
  "cultural-place": "culture",
  event: "culture",
  mentor: "profession",
};

function wrap<T extends { id: string }>(kind: RecommendationKind, item: T, s: Scored): Recommendation<T> {
  return { id: `${kind}:${item.id}`, kind, pillar: PILLAR_OF[kind], item, score: s.score, reasons: s.reasons };
}

const byScore = (a: { score: number }, b: { score: number }) => b.score - a.score;

export function recommendCommunities(user: User, limit = 6): Recommendation<Community>[] {
  return staticData.communities
    .map((c) => wrap("community", c, scoreCommunity(user, c)))
    .filter((r) => r.score > 0)
    .sort(byScore)
    .slice(0, limit);
}

export function recommendRecipes(user: User, limit = 6): Recommendation<Recipe>[] {
  return staticData.recipes
    .map((r) => wrap("recipe", r, scoreRecipe(user, r)))
    .filter((r) => r.score > 0)
    .sort(byScore)
    .slice(0, limit);
}

export function recommendPlaces(user: User, kind: Place["kind"], limit = 6): Recommendation<Place>[] {
  return staticData.places
    .filter((p) => p.kind === kind)
    .map((p) => wrap(kind === "food" ? "food-place" : "cultural-place", p, scorePlace(user, p)))
    .filter((r) => r.score > 0)
    .sort(byScore)
    .slice(0, limit);
}

export function recommendEvents(user: User, limit = 6, now = new Date()): Recommendation<CulturalEvent>[] {
  return staticData.events
    .map((e) => wrap("event", e, scoreEvent(user, e, now)))
    .filter((r) => r.score > 0)
    .sort(byScore)
    .slice(0, limit);
}

export function recommendMentors(user: User, limit = 6): Recommendation<Mentor>[] {
  return staticData.mentors
    .map((m) => wrap("mentor", m, scoreMentor(user, m)))
    .filter((r) => r.score > 0)
    .sort(byScore)
    .slice(0, limit);
}

/**
 * Like `recommend*`, but for a query that might name something specific
 * (a dish, a mentor's specialty, an event). Profile-based scoring alone
 * can't tell "this matches your heritage" apart from "this is what you
 * actually asked for" — a request for a dish we don't have would otherwise
 * silently return unrelated items from your profile with a "Good match"
 * badge, which is misleading.
 *
 * When the raw query text literally matches some items (by name,
 * description, or tags via `matchesQuery`), only those are returned,
 * ranked by profile score for their "why" reasons. When it matches nothing,
 * this falls back to plain profile-based recommendations — and reports
 * `matchedQuery: false` so the caller can be honest that the results below
 * are a fallback, not a match.
 */
export function recommendForQuery<T extends { id: string }>(
  kind: RecommendationKind,
  items: T[],
  matchesQuery: (item: T) => boolean,
  score: (item: T) => Scored,
  hasSubject: boolean,
  limit: number,
): { results: Recommendation<T>[]; matchedQuery: boolean } {
  const literalMatches = hasSubject ? items.filter(matchesQuery) : [];
  const matchedQuery = literalMatches.length > 0;
  const pool = matchedQuery ? literalMatches : items;
  const wrapped = pool.map((item) => wrap(kind, item, score(item)));
  const results = (matchedQuery ? wrapped : wrapped.filter((r) => r.score > 0)).sort(byScore).slice(0, limit);
  return { results, matchedQuery };
}

/**
 * Balanced feed for the Home page: guarantees each pillar is represented,
 * then fills with the highest-scoring remaining items.
 */
export function recommendForHome(user: User, limit = 8): Recommendation[] {
  const communities = recommendCommunities(user, 3);
  const events = recommendEvents(user, 2);
  const food = recommendPlaces(user, "food", 2);
  const recipes = recommendRecipes(user, 2);
  const mentors = recommendMentors(user, 3);

  const guaranteed: Recommendation[] = [];
  const pick = <T>(list: Recommendation<T>[]) => {
    const first = list.shift();
    if (first) guaranteed.push(first as Recommendation);
  };
  pick(communities);
  pick(events);
  pick(food);
  pick(mentors);
  pick(recipes);

  const rest = [...communities, ...events, ...food, ...recipes, ...mentors].sort(byScore) as Recommendation[];
  const seen = new Set(guaranteed.map((g) => g.id));
  for (const r of rest) {
    if (guaranteed.length >= limit) break;
    if (!seen.has(r.id)) {
      guaranteed.push(r);
      seen.add(r.id);
    }
  }
  return guaranteed.sort(byScore);
}

/** "Because you're interested in Nigerian culture and software engineering…" */
export function explainProfile(user: User): string {
  const parts: string[] = [];
  if (user.heritages.length) parts.push(`${heritageList(user.heritages)} culture`);
  if (user.profession) parts.push(professionLabel(user.profession).toLowerCase());
  else if (user.interests.length) parts.push(interestLabel(user.interests[0]).toLowerCase());
  if (!parts.length) return "Based on your profile";
  return `Because you're interested in ${parts.join(" and ")}`;
}

/** Max possible score, used to render a relative "match strength". */
export const MAX_SCORE = WEIGHTS.heritage + WEIGHTS.location + WEIGHTS.profession + WEIGHTS.interestCap + WEIGHTS.goal + WEIGHTS.timing;

export function matchStrength(score: number): "strong" | "good" | "fair" {
  if (score >= 80) return "strong";
  if (score >= 55) return "good";
  return "fair";
}
