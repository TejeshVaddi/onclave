import type { DiscoveryIntent, DiscoveryResult, DiscoveryScope, User } from "@/types";
import { HERITAGES, heritageList } from "@/data/heritages";
import { INTERESTS, interestLabel } from "@/data/interests";
import { PROFESSIONS, professionLabel } from "@/data/professions";
import { matchesEvent } from "./eventService";
import { matchesCommunity } from "./communityService";
import { matchesPlace } from "./placeService";
import { matchesRecipe } from "./recipeService";
import { matchesMentor } from "./mentorService";
import { staticData } from "./dataSource";
import { recommendForQuery, scoreCommunity, scoreEvent, scoreMentor, scorePlace, scoreRecipe } from "./recommendations";
import { delay, uniq } from "@/lib/utils";
import { hasWord, detectTimeframe } from "@/lib/nlp";

/**
 * AI-style discovery (MVP).
 *
 * `interpretQuery` is a transparent, rule-based parser that extracts the
 * signals a language model would extract: heritage, interests, profession,
 * timeframe, and what kinds of results the person wants. `runDiscovery` then
 * feeds those signals into the same recommendation engine used elsewhere.
 *
 * It runs entirely on the local dataset and never claims to search the web.
 * `DiscoveryProvider` is the seam where an LLM-backed provider can be plugged
 * in later (e.g. call a model to produce a DiscoveryIntent, then reuse
 * runDiscovery, or let the model rank results).
 */
export interface DiscoveryProvider {
  discover(query: string, user: User, scope?: DiscoveryScope): Promise<DiscoveryResult>;
}

export function interpretQuery(rawQuery: string, user: User, scope: DiscoveryScope = null): DiscoveryIntent {
  const text = rawQuery.toLowerCase().replace(/[’']/g, "'");

  const heritages = HERITAGES.filter((h) => h.keywords.some((k) => hasWord(text, k))).map((h) => h.id);
  const interests = INTERESTS.filter((i) => i.keywords.some((k) => hasWord(text, k))).map((i) => i.id);
  const professions = PROFESSIONS.filter((p) => p.keywords.some((k) => hasWord(text, k))).map((p) => p.id);

  const timeframe = detectTimeframe(text);
  const wantsMentor =
    /\b(mentor|mentors|mentorship|advice|guidance|career|careers|professional|professionals|shadow|someone who|talk to a|internship|job)\b/.test(text) ||
    professions.length > 0;
  const wantsRecipes = /\b(recipe|recipes|cook|cooking|make|bake|dish|dishes)\b/.test(text);
  const wantsFood =
    /\b(restaurant|restaurants|eat|eating|food|hungry|grocery|groceries|ingredient|ingredients|market|snack|dinner|lunch)\b/.test(text);
  const wantsEvents =
    timeframe !== null ||
    /\b(event|events|festival|festivals|celebration|celebrate|concert|happening|things to do|show|workshop|class|performance)\b/.test(text);
  const wantsPlaces =
    /\b(temple|mosque|church|gurdwara|museum|museums|cultural center|center|centre|places|place|visit|heritage site|pray|worship|landmark)\b/.test(text);
  const wantsCommunity =
    /\b(community|communities|people|friends|meet|meetup|group|groups|connect|belong|students|association|network|club)\b/.test(text);

  // "connect with my culture" style queries imply a broad cultural sweep.
  const cultureSweep = /\b(culture|roots|heritage|traditions)\b/.test(text);

  let intent: DiscoveryIntent = {
    rawQuery,
    heritages: heritages.length ? heritages : user.heritages,
    interests,
    professions,
    timeframe,
    wantsMentor,
    wantsFood: wantsFood || cultureSweep,
    wantsEvents: wantsEvents || cultureSweep,
    wantsPlaces: wantsPlaces || cultureSweep,
    wantsRecipes: wantsRecipes || (wantsFood && !wantsEvents),
    wantsCommunity: wantsCommunity || cultureSweep,
    usedProfileFallback: heritages.length === 0,
  };

  const anyKind =
    intent.wantsMentor || intent.wantsFood || intent.wantsEvents || intent.wantsPlaces || intent.wantsRecipes || intent.wantsCommunity;
  if (!anyKind) {
    intent = { ...intent, wantsMentor: true, wantsFood: true, wantsEvents: true, wantsPlaces: true, wantsRecipes: true, wantsCommunity: true };
  }

  // The scope dropdown is an explicit, deliberate choice — it overrides
  // whatever the text itself implied, so "temple" typed while scoped to
  // "Profession" doesn't also pull in places.
  if (scope === "community") {
    intent = { ...intent, wantsCommunity: true, wantsFood: false, wantsPlaces: false, wantsRecipes: false, wantsEvents: false, wantsMentor: false };
  } else if (scope === "culture") {
    intent = { ...intent, wantsCommunity: false, wantsFood: true, wantsPlaces: true, wantsRecipes: true, wantsEvents: true, wantsMentor: false };
  } else if (scope === "profession") {
    intent = { ...intent, wantsCommunity: false, wantsFood: false, wantsPlaces: false, wantsRecipes: false, wantsEvents: false, wantsMentor: true };
  }

  return intent;
}

/**
 * Words that are either grammatical filler or already-recognized structural
 * signals (a heritage, a timeframe, a category trigger like "recipe" or
 * "event"). What's left after stripping these is the actual *subject* of the
 * request, e.g. "falooda" out of "make a falooda recipe" — the part that
 * needs to literally match something, not just fit the user's profile.
 */
const STOPWORDS = new Set([
  // Grammatical filler
  "a", "an", "the", "some", "please", "for", "me", "my", "mine", "of", "to", "with", "and", "or", "i", "im",
  "want", "wanna", "find", "show", "get", "can", "you", "is", "are", "in", "near", "this", "that", "these",
  "those", "looking", "look", "help", "need", "would", "like", "love", "about", "around", "us", "our", "we",
  "who", "someone", "there", "been", "has", "have", "on", "at", "it", "its", "your", "yours", "want", "and",
  "american", "americans", "diaspora",
  // Timeframe words (services/eventService.ts / lib/nlp.ts detectTimeframe)
  "weekend", "today", "tonight", "week", "month", "saturday", "sunday", "soon", "upcoming",
  // Category trigger words (interpretQuery's wants* regexes below) — kept in
  // sync by hand; if those regexes change, update this list too.
  "recipe", "recipes", "dish", "dishes", "cook", "cooking", "make", "made", "making", "bake", "baking",
  "food", "foods", "eat", "eating", "hungry", "restaurant", "restaurants", "grocery", "groceries",
  "ingredient", "ingredients", "market", "snack", "dinner", "lunch",
  "event", "events", "festival", "festivals", "celebration", "celebrate", "concert", "happening", "things",
  "do", "workshop", "class", "performance",
  "temple", "mosque", "church", "gurdwara", "museum", "museums", "center", "centre", "place", "places",
  "visit", "site", "pray", "worship", "landmark",
  "community", "communities", "people", "friends", "meet", "meetup", "group", "groups", "connect", "belong",
  "students", "association", "network", "club",
  "mentor", "mentors", "mentorship", "advice", "guidance", "career", "careers", "professional",
  "professionals", "shadow", "talk", "internship", "job",
  "culture", "cultures", "roots", "heritage", "heritages", "traditions", "tradition",
  "interested", "interest", "interests",
]);

function extractSubjectTokens(rawQuery: string, exclude: string[]): string[] {
  const excludeSet = new Set(exclude.map((w) => w.toLowerCase()));
  return Array.from(
    new Set(
      rawQuery
        .toLowerCase()
        .replace(/[’']/g, "")
        .split(/[^a-z]+/)
        .filter((w) => w.length >= 3 && !STOPWORDS.has(w) && !excludeSet.has(w)),
    ),
  );
}

function describeIntent(intent: DiscoveryIntent, user: User): string {
  const who = intent.heritages.length ? `someone with ${heritageList(intent.heritages)} roots` : "you";
  const bits: string[] = [];
  if (intent.professions.length) bits.push(`interested in ${professionLabel(intent.professions[0]).toLowerCase()}`);
  else if (intent.interests.length) bits.push(`interested in ${intent.interests.slice(0, 2).map((i) => interestLabel(i).toLowerCase()).join(" and ")}`);
  const when =
    intent.timeframe === "weekend"
      ? " this weekend"
      : intent.timeframe === "today"
        ? " today"
        : intent.timeframe === "week"
          ? " this week"
          : intent.timeframe === "month"
            ? " this month"
            : "";
  const near = user.location.city ? ` near ${user.location.city}` : "";
  return `Results for ${who}${bits.length ? `, ${bits.join(", ")}` : ""}${near}${when}.`;
}

export function runDiscovery(intent: DiscoveryIntent, user: User, now = new Date()): DiscoveryResult {
  // Build a temporary profile that blends the query with the saved profile.
  const virtualUser: User = {
    ...user,
    heritages: intent.heritages.length ? intent.heritages : user.heritages,
    interests: uniq([...intent.interests, ...user.interests]),
    profession: intent.professions[0] ?? user.profession,
    wantsMentorship: intent.wantsMentor || user.wantsMentorship,
  };

  // Everything already recognized (heritage names, "recipe", "weekend", etc.)
  // doesn't need to also literally appear in a result — only what's left
  // over, the actual subject of the request, does.
  const recognizedWords = [
    ...HERITAGES.flatMap((h) => h.keywords),
    ...INTERESTS.flatMap((i) => i.keywords),
    ...PROFESSIONS.flatMap((p) => p.keywords),
  ];
  const subjectTokens = extractSubjectTokens(intent.rawQuery, recognizedWords);
  const hasSubject = subjectTokens.length > 0;
  const subjectLabel = subjectTokens.join(" ");

  const notes: string[] = [];
  const noteIfFallback = (wanted: boolean, matchedQuery: boolean, count: number, what: string) => {
    if (wanted && hasSubject && !matchedQuery && count > 0) {
      notes.push(`No ${what} matching "${subjectLabel}" in the demo dataset yet — showing ${what} based on your profile instead.`);
    }
  };

  const communityResult = intent.wantsCommunity
    ? recommendForQuery(
        "community",
        staticData.communities,
        (c) => subjectTokens.some((tok) => matchesCommunity(c, { query: tok })),
        (c) => scoreCommunity(virtualUser, c),
        hasSubject,
        5,
      )
    : { results: [], matchedQuery: true };
  noteIfFallback(intent.wantsCommunity, communityResult.matchedQuery, communityResult.results.length, "communities");

  const foodResult = intent.wantsFood
    ? recommendForQuery(
        "food-place",
        staticData.places.filter((p) => p.kind === "food"),
        (p) => subjectTokens.some((tok) => matchesPlace(p, { query: tok })),
        (p) => scorePlace(virtualUser, p),
        hasSubject,
        5,
      )
    : { results: [], matchedQuery: true };
  noteIfFallback(intent.wantsFood, foodResult.matchedQuery, foodResult.results.length, "places to eat");

  const culturalResult = intent.wantsPlaces
    ? recommendForQuery(
        "cultural-place",
        staticData.places.filter((p) => p.kind === "cultural"),
        (p) => subjectTokens.some((tok) => matchesPlace(p, { query: tok })),
        (p) => scorePlace(virtualUser, p),
        hasSubject,
        5,
      )
    : { results: [], matchedQuery: true };
  noteIfFallback(intent.wantsPlaces, culturalResult.matchedQuery, culturalResult.results.length, "cultural places");

  const places = [...foodResult.results, ...culturalResult.results].sort((a, b) => b.score - a.score);

  const recipeResult = intent.wantsRecipes
    ? recommendForQuery(
        "recipe",
        staticData.recipes,
        (r) => subjectTokens.some((tok) => matchesRecipe(r, { query: tok })),
        (r) => scoreRecipe(virtualUser, r),
        hasSubject,
        5,
      )
    : { results: [], matchedQuery: true };
  noteIfFallback(intent.wantsRecipes, recipeResult.matchedQuery, recipeResult.results.length, "recipes");

  const upcomingInTimeframe = staticData.events.filter((e) => matchesEvent(e, { timeframe: intent.timeframe, now }));
  const eventResult = intent.wantsEvents
    ? recommendForQuery(
        "event",
        upcomingInTimeframe,
        (e) => subjectTokens.some((tok) => matchesEvent(e, { query: tok })),
        (e) => scoreEvent(virtualUser, e, now),
        hasSubject,
        5,
      )
    : { results: [], matchedQuery: true };
  noteIfFallback(intent.wantsEvents, eventResult.matchedQuery, eventResult.results.length, "events");

  const mentorResult = intent.wantsMentor
    ? recommendForQuery(
        "mentor",
        staticData.mentors,
        (m) => subjectTokens.some((tok) => matchesMentor(m, { query: tok })),
        (m) => scoreMentor(virtualUser, m),
        hasSubject,
        5,
      )
    : { results: [], matchedQuery: true };
  noteIfFallback(intent.wantsMentor, mentorResult.matchedQuery, mentorResult.results.length, "mentors");

  const community = communityResult.results;
  const recipes = recipeResult.results;
  const events = eventResult.results;
  const profession = mentorResult.results;

  const totalResults = community.length + places.length + recipes.length + events.length + profession.length;

  return {
    intent,
    summary: describeIntent(intent, user),
    notes,
    community,
    culture: { places, recipes, events },
    profession,
    totalResults,
    matched: {
      hasSubject,
      community: communityResult.matchedQuery,
      food: foodResult.matchedQuery,
      places: culturalResult.matchedQuery,
      recipes: recipeResult.matchedQuery,
      events: eventResult.matchedQuery,
      mentor: mentorResult.matchedQuery,
    },
  };
}

/** Local provider: parses the query with rules and scores against the dataset. */
export const localDiscoveryProvider: DiscoveryProvider = {
  async discover(query, user, scope = null) {
    await delay(650); // simulate model latency so the UI's "thinking" state is visible
    const intent = interpretQuery(query, user, scope);
    return runDiscovery(intent, user);
  },
};

export const discoveryProvider: DiscoveryProvider = localDiscoveryProvider;

export const EXAMPLE_QUERIES = [
  "I'm Nigerian-American, interested in medicine, and want to connect with my culture this weekend.",
  "Where can I find Ethiopian food and a coffee ceremony near me?",
  "Mexican-American student looking for a mentor in engineering",
  "Vietnamese festivals and recipes for Mid-Autumn",
  "Indian pre-med student who wants community and a temple nearby",
];
