/**
 * Shared types for the optional Gemini-backed live search. These are
 * intentionally separate from the core Community/Place/CulturalEvent types
 * in /types: live results come from an LLM reading real web pages (or, when
 * grounding is unavailable, its own trained knowledge), not our curated
 * dataset, so they carry fewer guaranteed fields and are always rendered in
 * their own clearly-labeled section rather than merged into local results.
 *
 * Mentors are deliberately NOT a category here: presenting a real, named
 * private individual found via web search as an available mentor would use
 * their identity without consent. `mentorProgram` instead finds real
 * organizations and programs for the Profession page.
 */
export type LiveSearchCategory = "community" | "food" | "places" | "events" | "recipe" | "mentorProgram";

export interface LiveSearchRequest {
  category: LiveSearchCategory;
  /** Free-text query the user typed, e.g. "nigerian students" or "this weekend". */
  query: string;
  heritages: string[];
  city: string;
  state: string;
}

export interface LiveSource {
  title: string;
  url: string;
}

interface LiveItemBase {
  name: string;
  description: string;
  tags: string[];
  externalUrl?: string;
}

export interface LiveCommunityItem extends LiveItemBase {
  kind: "community";
  platform: string;
  locationLabel: string;
  isOnline: boolean;
  type: string;
}

export interface LivePlaceItem extends LiveItemBase {
  kind: "place";
  category: string;
  address: string;
  city: string;
  state: string;
  rating?: number;
}

export interface LiveEventItem extends LiveItemBase {
  kind: "event";
  date?: string;
  venue: string;
  city: string;
  state: string;
  category: string;
  organizer?: string;
  price?: string;
  /** Street address of the venue, when the source states it. */
  address?: string;
  /** Named performers, speakers, or hosts the source lists. */
  performers?: string[];
  /** Where and how to buy tickets or RSVP, in the source's terms. */
  ticketInfo?: string;
}

export interface LiveRecipeItem extends LiveItemBase {
  kind: "recipe";
  sourceName: string;
  difficulty?: "easy" | "medium" | "hard";
  timeMinutes?: number;
  /** Only present for AI-generated recipes (see /api/ai-generate), not real-recipe search results. */
  ingredients?: string[];
  steps?: string[];
}

export interface LiveMentorProgramItem extends LiveItemBase {
  kind: "program";
  organizationType: string;
  locationLabel: string;
}

export type LiveResultItem = LiveCommunityItem | LivePlaceItem | LiveEventItem | LiveRecipeItem | LiveMentorProgramItem;

export interface LiveSearchResponse {
  /** False when no GEMINI_API_KEY is set on the server — callers should render nothing, not an error. */
  configured: boolean;
  results: LiveResultItem[];
  sources?: LiveSource[];
  /** False when Google Search grounding failed (e.g. account quota/billing) and results came from the model's own knowledge instead — not independently verified. */
  grounded?: boolean;
  error?: string;
}

/**
 * Response from /api/ai-generate: synthesizes ONE example when nothing real
 * matched in the local dataset or the live web search. Never claims to be a
 * verified, real listing — `provider` and `item` together let the UI label
 * it honestly ("AI-generated example, via Gemini/Groq — not verified").
 */
export interface AiGenerateResponse {
  /** False when neither GEMINI_API_KEY nor GROQ_API_KEY is set — callers should render nothing. */
  configured: boolean;
  generated: boolean;
  item?: LiveResultItem;
  provider?: "gemini" | "groq";
  error?: string;
}
