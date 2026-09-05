import type { CommunityPlatform, CommunityType, CulturalPlaceCategory, EventCategory, FoodPlaceCategory, Timeframe } from "@/types";
import { HERITAGES } from "@/data/heritages";
import { INTERESTS } from "@/data/interests";
import { PROFESSIONS } from "@/data/professions";
import { hasWord, detectTimeframe } from "@/lib/nlp";

/**
 * Powers the "custom command" search bars on Community, Culture, and
 * Profession: typing a natural phrase like "nigerian food this weekend" or
 * "vegan indian recipes" is parsed for heritage, profession, interest,
 * dietary, timeframe, and (per-page) category/type/platform signals, which
 * each page's search then applies as real filters — not just a literal
 * substring match. Without this, a perfectly reasonable query like "discord"
 * or "cultural center" would only ever find something if that exact word
 * happened to appear in a listing's text, which is unreliable.
 *
 * This runs entirely on the local dataset (same parser AI Discovery uses).
 * It is intentionally the seam for a real search API later: a future
 * `webSearch.ts` provider can replace or augment `parseFreeText` with a
 * live query understanding call while every page keeps working unchanged.
 */
export interface FreeTextSignals {
  heritages: string[];
  professions: string[];
  interests: string[];
  dietary: string[];
  timeframe: Timeframe;
  /** Community "Type" chips — only read by the Community search bar. */
  communityTypes: CommunityType[];
  /** Community "Platform" chips — only read by the Community search bar. */
  communityPlatforms: CommunityPlatform[];
  /** Food place categories — only read by the Food Near You search bar. */
  foodCategories: FoodPlaceCategory[];
  /** Cultural place categories — only read by the Cultural Places search bar. */
  culturalCategories: CulturalPlaceCategory[];
  /** Event categories — only read by the Events search bar. */
  eventCategories: EventCategory[];
  /** True when at least one structured signal was recognized in the text. */
  matched: boolean;
}

const DIETARY_KEYWORDS: { keyword: string; label: string }[] = [
  { keyword: "vegan", label: "Vegan" },
  { keyword: "vegetarian", label: "Vegetarian" },
  { keyword: "gluten.free", label: "Gluten-free" },
  { keyword: "gluten free", label: "Gluten-free" },
  { keyword: "dairy.free", label: "Dairy-free" },
  { keyword: "dairy free", label: "Dairy-free" },
  { keyword: "halal", label: "Halal" },
];

function findByKeywords<T extends string>(text: string, map: Record<T, string[]>): T[] {
  return (Object.keys(map) as T[]).filter((id) => map[id].some((k) => hasWord(text, k)));
}

const COMMUNITY_TYPE_KEYWORDS: Record<CommunityType, string[]> = {
  social: [],
  student: ["student", "students"],
  professional: ["professional", "professionals", "professional network", "networking group"],
  cultural: ["cultural group", "cultural association"],
  religious: ["religious", "religion", "faith community", "worship group"],
  local: ["neighborhood group", "neighbors"],
};

const COMMUNITY_PLATFORM_KEYWORDS: Record<CommunityPlatform, string[]> = {
  reddit: ["reddit", "subreddit"],
  facebook: ["facebook", "fb group"],
  nextdoor: ["nextdoor"],
  discord: ["discord"],
  meetup: ["meetup", "meet up group"],
  other: [],
};

const FOOD_CATEGORY_KEYWORDS: Record<FoodPlaceCategory, string[]> = {
  restaurant: ["restaurant", "restaurants"],
  grocery: ["grocery", "groceries", "grocery store"],
  market: ["market", "markets"],
  bakery: ["bakery", "bakeries"],
  cafe: ["cafe", "café", "coffee shop"],
};

const CULTURAL_CATEGORY_KEYWORDS: Record<CulturalPlaceCategory, string[]> = {
  temple: ["temple", "temples"],
  mosque: ["mosque", "mosques"],
  church: ["church", "churches"],
  "cultural-center": ["cultural center", "cultural centre"],
  museum: ["museum", "museums"],
  "heritage-site": ["heritage site", "landmark", "landmarks"],
  "community-center": ["community center", "community centre"],
};

const EVENT_CATEGORY_KEYWORDS: Record<EventCategory, string[]> = {
  festival: ["festival", "festivals"],
  religious: ["religious event", "religious service", "religious celebration"],
  community: ["community event", "community gathering"],
  workshop: ["workshop", "workshops", "class", "classes"],
  performance: ["performance", "performances", "concert", "concerts", "live show"],
  food: ["food festival", "food event", "cook-off"],
};

export function parseFreeText(query: string): FreeTextSignals {
  const text = query.toLowerCase().trim();
  if (!text) {
    return {
      heritages: [],
      professions: [],
      interests: [],
      dietary: [],
      timeframe: null,
      communityTypes: [],
      communityPlatforms: [],
      foodCategories: [],
      culturalCategories: [],
      eventCategories: [],
      matched: false,
    };
  }

  const heritages = HERITAGES.filter((h) => h.keywords.some((k) => hasWord(text, k))).map((h) => h.id);
  const professions = PROFESSIONS.filter((p) => p.keywords.some((k) => hasWord(text, k))).map((p) => p.id);
  const interests = INTERESTS.filter((i) => i.keywords.some((k) => hasWord(text, k))).map((i) => i.id);
  const dietary = DIETARY_KEYWORDS.filter((d) => new RegExp(d.keyword, "i").test(text)).map((d) => d.label);
  const timeframe = detectTimeframe(text);
  const communityTypes = findByKeywords(text, COMMUNITY_TYPE_KEYWORDS);
  const communityPlatforms = findByKeywords(text, COMMUNITY_PLATFORM_KEYWORDS);
  const foodCategories = findByKeywords(text, FOOD_CATEGORY_KEYWORDS);
  const culturalCategories = findByKeywords(text, CULTURAL_CATEGORY_KEYWORDS);
  const eventCategories = findByKeywords(text, EVENT_CATEGORY_KEYWORDS);

  return {
    heritages,
    professions,
    interests,
    dietary,
    timeframe,
    communityTypes,
    communityPlatforms,
    foodCategories,
    culturalCategories,
    eventCategories,
    matched:
      heritages.length > 0 ||
      professions.length > 0 ||
      interests.length > 0 ||
      dietary.length > 0 ||
      timeframe !== null ||
      communityTypes.length > 0 ||
      communityPlatforms.length > 0 ||
      foodCategories.length > 0 ||
      culturalCategories.length > 0 ||
      eventCategories.length > 0,
  };
}
