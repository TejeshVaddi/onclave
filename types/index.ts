/**
 * Core domain types for Onclave.
 *
 * Every entity that the UI renders is typed here so that the mock data layer
 * (in /data) and the future API-backed layer (in /services) share one contract.
 */

/** The three pillars of the product. */
export type Pillar = "community" | "culture" | "profession";

/** Heritage identifiers are lowercase slugs (e.g. "nigerian"). */
export type HeritageId = string;
/** Interest identifiers are lowercase slugs (e.g. "food", "stem"). */
export type InterestId = string;
/** Profession identifiers are lowercase slugs (e.g. "software-engineering"). */
export type ProfessionId = string;

export interface Heritage {
  id: HeritageId;
  /** Display label, e.g. "Nigerian" */
  label: string;
  /** Country or region of origin used in copy, e.g. "Nigeria" */
  origin: string;
  /** Broad region, used for grouping in the UI */
  region:
    | "South Asia"
    | "East Asia"
    | "Southeast Asia"
    | "West Africa"
    | "East Africa"
    | "North Africa"
    | "Middle East"
    | "Latin America"
    | "Caribbean"
    | "Europe";
  /** Keywords the natural-language discovery parser looks for. */
  keywords: string[];
  /** Cuisine label used on recipe cards, e.g. "Nigerian" */
  cuisine: string;
}

export interface Interest {
  id: InterestId;
  label: string;
  /** Which pillar this interest mostly informs. */
  pillar: Pillar;
  keywords: string[];
}

export interface Profession {
  id: ProfessionId;
  label: string;
  industry: string;
  keywords: string[];
}

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface UserLocation extends Partial<GeoPoint> {
  city: string;
  state?: string;
  country: string;
}

export interface User {
  id: string;
  name: string;
  /** Short handle for avatars when no photo is set. */
  initials: string;
  avatarTone: AvatarTone;
  heritages: HeritageId[];
  location: UserLocation;
  interests: InterestId[];
  profession: ProfessionId | null;
  wantsMentorship: boolean;
  bio?: string;
  onboardingComplete: boolean;
  /** ISO timestamp of the last profile update. */
  updatedAt: string;
}

export type AvatarTone = "berry" | "terracotta" | "green" | "brown";

/* ------------------------------------------------------------------ */
/* Community                                                           */
/* ------------------------------------------------------------------ */

export type CommunityType =
  | "social"
  | "student"
  | "professional"
  | "cultural"
  | "religious"
  | "local";

export type CommunityPlatform =
  | "reddit"
  | "facebook"
  | "nextdoor"
  | "discord"
  | "meetup"
  | "other";

export interface Community {
  id: string;
  name: string;
  platform: CommunityPlatform;
  description: string;
  /** Human-readable location label, e.g. "Northern Virginia" or "Online" */
  locationLabel: string;
  /** Approximate coordinates for local communities; omitted for online ones. */
  geo?: GeoPoint;
  isOnline: boolean;
  heritages: HeritageId[];
  type: CommunityType;
  tags: string[];
  /** Approximate size, for display only. */
  memberEstimate?: string;
  /** Link to the community on its home platform. Onclave never hosts communities. Absent for demo listings with no verified page. */
  externalUrl?: string;
}

/** Everything the "Learn more" panel shows beyond the card, keyed by community id in data/communityDetails. */
export interface CommunityDetail {
  /** Who the group is for. */
  whoFor: string;
  /** How often it meets or how active it is. */
  cadence: string;
  /** What members actually do together. */
  activities: string[];
  /** Concrete steps to join. */
  howToJoin: string[];
}

/* ------------------------------------------------------------------ */
/* Culture                                                             */
/* ------------------------------------------------------------------ */

export type Difficulty = "easy" | "medium" | "hard";

export interface Recipe {
  id: string;
  name: string;
  /** Heritage id whose cuisine this belongs to. */
  cuisine: HeritageId;
  heritages: HeritageId[];
  description: string;
  difficulty: Difficulty;
  timeMinutes: number;
  servings: number;
  /** Interest ids and free-form tags. */
  tags: string[];
  dietary: string[];
  /** Name of the source the recipe is attributed to. */
  sourceName: string;
  /** Link to the original source. Null while using demo data. */
  sourceUrl: string | null;
  /** Visual tone for generated cover art. */
  art: ArtTone;
  /** Short, original summary of key ingredients (not a full recipe). */
  ingredientsPreview: string[];
  /** Short, original outline of the method (not a full recipe). */
  stepsPreview: string[];
  occasion?: string;
}

/** The complete recipe shown on a recipe's page, keyed by recipe id in data/recipeDetails. */
export interface RecipeDetail {
  /** Full ingredient lines with quantities, scaled to the recipe's `servings`. */
  ingredients: string[];
  /** The complete method, one action per step. */
  steps: string[];
}

export type ArtTone =
  | "berry"
  | "terracotta"
  | "green"
  | "gold"
  | "clay"
  | "olive"
  | "plum"
  | "sand";

export type FoodPlaceCategory =
  | "restaurant"
  | "grocery"
  | "market"
  | "bakery"
  | "cafe";

export type CulturalPlaceCategory =
  | "temple"
  | "mosque"
  | "church"
  | "cultural-center"
  | "museum"
  | "heritage-site"
  | "community-center";

export type PlaceCategory = FoodPlaceCategory | CulturalPlaceCategory;

export interface Place {
  id: string;
  name: string;
  kind: "food" | "cultural";
  category: PlaceCategory;
  heritages: HeritageId[];
  description: string;
  address: string;
  city: string;
  state: string;
  geo: GeoPoint;
  rating?: number;
  reviewCount?: number;
  priceLevel?: 1 | 2 | 3 | 4;
  tags: string[];
  /** Deep link to a map provider. Generated from the address when absent. */
  externalUrl?: string;
  art: ArtTone;
  /**
   * A real, freely-licensed photo (e.g. Wikimedia Commons) for well-known,
   * real institutions only. Fictional demo restaurants and shops intentionally
   * have no imageUrl and fall back to generated CoverArt, so nothing implies
   * a real photo of a place that doesn't exist.
   */
  imageUrl?: string;
}

/** Everything the "Learn more" panel shows beyond the card, keyed by place id in data/placeDetails. */
export interface PlaceDetail {
  /** Typical opening hours, in plain words. */
  hours: string;
  /** What to order, see, or do there, most notable first. */
  knownFor: string[];
  /** Who or what it suits, e.g. "Families", "Late night". */
  goodFor: string[];
  /** Practical notes: parking, cash only, best time to go. */
  visitTips: string[];
  /** The place's own website, only when it is real and known. */
  website?: string;
}

export type EventCategory =
  | "festival"
  | "religious"
  | "community"
  | "workshop"
  | "performance"
  | "food";

export interface CulturalEvent {
  id: string;
  name: string;
  /** ISO date (YYYY-MM-DD) */
  date: string;
  endDate?: string;
  timeLabel?: string;
  venue: string;
  city: string;
  state: string;
  geo?: GeoPoint;
  isVirtual: boolean;
  description: string;
  category: EventCategory;
  heritages: HeritageId[];
  tags: string[];
  organizer: string;
  price: string;
  externalUrl?: string;
  art: ArtTone;
}

/** Everything the "Learn more" panel shows beyond the card, keyed by event id in data/eventDetails. */
export interface EventDetail {
  /** Street address of the venue, when known. */
  address?: string;
  /** Performers, speakers, hosts, or vendors, most prominent first. */
  lineup: { name: string; role: string }[];
  /** A rough run of show. */
  schedule: { time: string; item: string }[];
  /** A sentence or two on who is putting the event on. */
  organizerNote?: string;
  tickets: {
    /** How people get in, in plain words. */
    how: string;
    /** Where tickets are sold or the RSVP lives, when one is needed. */
    where?: string;
  };
  /** Practical notes: parking, ages, what to bring, accessibility. */
  goodToKnow: string[];
  /** The venue's own website, when we know the real one. */
  venueUrl?: string;
}

/* ------------------------------------------------------------------ */
/* Profession                                                          */
/* ------------------------------------------------------------------ */

export interface Mentor {
  id: string;
  name: string;
  initials: string;
  avatarTone: AvatarTone;
  title: string;
  company: string;
  industry: string;
  profession: ProfessionId;
  heritages: HeritageId[];
  /** How the mentor describes their background, e.g. "Chinese-American". */
  heritageLabel: string;
  city: string;
  state: string;
  geo?: GeoPoint;
  yearsExperience: number;
  bio: string;
  interests: InterestId[];
  /** Topics the mentor can help with. */
  mentorsIn: string[];
  /** One-sentence statement of who they are open to mentoring. */
  openTo: string;
  availability: "open" | "limited" | "waitlist";
  languages: string[];
  education?: string;
}

/* ------------------------------------------------------------------ */
/* Recommendation engine                                               */
/* ------------------------------------------------------------------ */

export type RecommendationKind =
  | "community"
  | "recipe"
  | "food-place"
  | "cultural-place"
  | "event"
  | "mentor";

export interface RecommendationReason {
  /** Which signal produced this reason. */
  signal: "heritage" | "location" | "profession" | "interest" | "goal" | "timing";
  label: string;
  points: number;
}

export interface Recommendation<T = RecommendationItem> {
  id: string;
  kind: RecommendationKind;
  pillar: Pillar;
  item: T;
  score: number;
  reasons: RecommendationReason[];
}

export type RecommendationItem =
  | Community
  | Recipe
  | Place
  | CulturalEvent
  | Mentor;

/* ------------------------------------------------------------------ */
/* Discovery (natural-language search)                                 */
/* ------------------------------------------------------------------ */

export type Timeframe = "today" | "weekend" | "week" | "month" | null;

/** The dropdown on AI Discovery that narrows which pillar(s) a query targets. */
export type DiscoveryScope = "community" | "culture" | "profession" | null;

export interface DiscoveryIntent {
  rawQuery: string;
  heritages: HeritageId[];
  interests: InterestId[];
  professions: ProfessionId[];
  timeframe: Timeframe;
  wantsMentor: boolean;
  wantsFood: boolean;
  wantsEvents: boolean;
  wantsPlaces: boolean;
  wantsRecipes: boolean;
  wantsCommunity: boolean;
  /** True when the query gave no explicit signals and we fell back to the profile. */
  usedProfileFallback: boolean;
}

/**
 * Per-category "did the literal subject of the query actually match
 * something real in the dataset" flags. `hasSubject` is false for queries
 * that are pure profile description ("I'm Nigerian and like music") with
 * nothing specific to look up — in that case a AI-generation offer doesn't
 * make sense, since there's no specific thing to generate.
 */
export interface DiscoveryMatchFlags {
  hasSubject: boolean;
  community: boolean;
  food: boolean;
  places: boolean;
  recipes: boolean;
  events: boolean;
  mentor: boolean;
}

export interface DiscoveryResult {
  intent: DiscoveryIntent;
  summary: string;
  /** Honest call-outs, e.g. when a specific request (a dish, a place) had no match and results below are a profile-based fallback instead. */
  notes: string[];
  community: Recommendation<Community>[];
  culture: {
    places: Recommendation<Place>[];
    recipes: Recommendation<Recipe>[];
    events: Recommendation<CulturalEvent>[];
  };
  profession: Recommendation<Mentor>[];
  totalResults: number;
  matched: DiscoveryMatchFlags;
}
