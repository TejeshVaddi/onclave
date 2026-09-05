/**
 * Seam for a real live web/AI search provider — NOT wired to anything live
 * yet, and this file must never claim otherwise.
 *
 * The search bars on Community, Culture, and Profession, and the AI
 * Discovery page, currently run entirely on `parseFreeText` (services/
 * smartSearch.ts) against Onclave's local dataset. That is a genuine,
 * working feature — natural-language queries really do get parsed for
 * heritage/profession/interest/dietary/timeframe and turned into real
 * filters — but it is not "scanning Google" or calling an LLM, and it can
 * only ever surface what's already in /data.
 *
 * To go from "smart local search" to "actually searches the live web",
 * three things are needed that this codebase cannot supply on its own:
 *
 * 1. An API key for an actual search backend, e.g.:
 *    - Google Programmable Search Engine (Custom Search JSON API)
 *    - Bing Web Search API
 *    - SerpAPI (wraps Google results)
 *    - Or an LLM provider with browsing/tool-use (e.g. an Anthropic or
 *      OpenAI key wired through a server-side agent loop)
 * 2. A server-side route (e.g. `app/api/web-search/route.ts`) so the key
 *    never ships to the browser.
 * 3. A mapping from that provider's raw results back into Onclave's typed
 *    shapes (Community, Place, CulturalEvent, Mentor), or a decision to show
 *    live results in their own "From the web" section instead of merging
 *    them into the existing cards.
 *
 * Implement `WebSearchProvider.search` below, point `webSearchProvider` at
 * it, and every page that calls `parseFreeText`/`searchCommunities`/etc. can
 * layer live results on top without any UI rewrite — this interface is the
 * intended extension point.
 */

export interface WebSearchResult {
  title: string;
  url: string;
  snippet: string;
}

export interface WebSearchProvider {
  /** True once a real provider (with a configured API key) is wired in. */
  readonly isLive: boolean;
  search(query: string): Promise<WebSearchResult[]>;
}

/**
 * Default provider: always returns no results and says so, rather than
 * silently pretending to search. Swap `webSearchProvider` below for a real
 * implementation once an API key and server route exist.
 */
export const unconfiguredWebSearchProvider: WebSearchProvider = {
  isLive: false,
  async search() {
    return [];
  },
};

export const webSearchProvider: WebSearchProvider = unconfiguredWebSearchProvider;
