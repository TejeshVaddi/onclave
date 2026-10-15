import type { Community, CulturalEvent, Mentor, Place, Recipe } from "@/types";
import { upcomingCelebrations } from "@/data/culturalCalendar";
import { ONLINE_COMMUNITIES } from "@/data/onlineCommunities";
import { RECIPES } from "@/data/recipes";
import { liveStore } from "@/services/liveStore";

/**
 * DataSource is the single seam between the UI/services and where data comes
 * from. Communities, places, events, and people are real entries found by live
 * search or in OpenStreetMap and confirmed to exist (see services/liveSync,
 * services/osm, services/llm/verify), plus a list of verified large online
 * communities; recipes are Onclave's own written recipes.
 */
export interface DataSource {
  getCommunities(): Promise<Community[]>;
  getRecipes(): Promise<Recipe[]>;
  getPlaces(): Promise<Place[]>;
  getEvents(): Promise<CulturalEvent[]>;
  getMentors(): Promise<Mentor[]>;
}

/** Verified large online communities, then communities found by search, without repeating a page. */
function allCommunities(): Community[] {
  const seen = new Set<string>();
  return [...ONLINE_COMMUNITIES, ...liveStore.communities].filter((c) => {
    const key = c.externalUrl.toLowerCase().replace(/\/+$/, "");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** Events found by search, then the cultural calendar's upcoming celebrations. */
function allEvents(): CulturalEvent[] {
  return [...liveStore.events, ...upcomingCelebrations()];
}

export const liveDataSource: DataSource = {
  async getCommunities() {
    return allCommunities();
  },
  async getRecipes() {
    return RECIPES;
  },
  async getPlaces() {
    return liveStore.places;
  },
  async getEvents() {
    return allEvents();
  },
  async getMentors() {
    return liveStore.people;
  },
};

/** Synchronous access for the recommendation engine. Reads the live store each time. */
export const staticData = {
  get communities(): Community[] {
    return allCommunities();
  },
  recipes: RECIPES,
  get places(): Place[] {
    return liveStore.places;
  },
  get events(): CulturalEvent[] {
    return allEvents();
  },
  get mentors(): Mentor[] {
    return liveStore.people;
  },
};

/** The active data source. */
export const dataSource: DataSource = liveDataSource;
