import type { Community, CulturalEvent, Mentor, Place, Recipe } from "@/types";
import { RECIPES } from "@/data/recipes";
import { liveStore } from "@/services/liveStore";

/**
 * DataSource is the single seam between the UI/services and where data comes
 * from. Communities, places, events, and people are real entries found by live
 * search and confirmed to exist (see services/liveSearch, services/liveSync,
 * services/llm/verify); recipes are Onclave's own written recipes.
 */
export interface DataSource {
  getCommunities(): Promise<Community[]>;
  getRecipes(): Promise<Recipe[]>;
  getPlaces(): Promise<Place[]>;
  getEvents(): Promise<CulturalEvent[]>;
  getMentors(): Promise<Mentor[]>;
}

export const liveDataSource: DataSource = {
  async getCommunities() {
    return liveStore.communities;
  },
  async getRecipes() {
    return RECIPES;
  },
  async getPlaces() {
    return liveStore.places;
  },
  async getEvents() {
    return liveStore.events;
  },
  async getMentors() {
    return liveStore.people;
  },
};

/** Synchronous access for the recommendation engine. Reads the live store each time. */
export const staticData = {
  get communities(): Community[] {
    return liveStore.communities;
  },
  recipes: RECIPES,
  get places(): Place[] {
    return liveStore.places;
  },
  get events(): CulturalEvent[] {
    return liveStore.events;
  },
  get mentors(): Mentor[] {
    return liveStore.people;
  },
};

/** The active data source. */
export const dataSource: DataSource = liveDataSource;
