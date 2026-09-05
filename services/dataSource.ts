import type { Community, CulturalEvent, Mentor, Place, Recipe } from "@/types";
import { COMMUNITIES } from "@/data/communities";
import { RECIPES } from "@/data/recipes";
import { PLACES } from "@/data/places";
import { EVENTS } from "@/data/events";
import { MENTORS } from "@/data/mentors";
import { delay } from "@/lib/utils";

/**
 * DataSource is the single seam between the UI/services and where data comes
 * from. The MVP ships with `mockDataSource`, which reads the static datasets
 * in /data and simulates network latency so loading states are exercised.
 *
 * To connect real providers, implement this interface (for example
 * `apiDataSource` calling Reddit/Meetup, a recipe API, a Places API, and an
 * events API) and swap the export at the bottom of this file. No UI changes
 * are required.
 */
export interface DataSource {
  getCommunities(): Promise<Community[]>;
  getRecipes(): Promise<Recipe[]>;
  getPlaces(): Promise<Place[]>;
  getEvents(): Promise<CulturalEvent[]>;
  getMentors(): Promise<Mentor[]>;
}

/** Simulated latency (ms) so the UI's loading states are visible in the demo. */
const MOCK_LATENCY = 350;

export const mockDataSource: DataSource = {
  async getCommunities() {
    await delay(MOCK_LATENCY);
    return COMMUNITIES;
  },
  async getRecipes() {
    await delay(MOCK_LATENCY);
    return RECIPES;
  },
  async getPlaces() {
    await delay(MOCK_LATENCY);
    return PLACES;
  },
  async getEvents() {
    await delay(MOCK_LATENCY);
    return EVENTS;
  },
  async getMentors() {
    await delay(MOCK_LATENCY);
    return MENTORS;
  },
};

/** Synchronous access for the recommendation engine (no latency). */
export const staticData = {
  communities: COMMUNITIES as Community[],
  recipes: RECIPES,
  places: PLACES,
  events: EVENTS,
  mentors: MENTORS,
};

/** The active data source. Swap this for an API-backed implementation. */
export const dataSource: DataSource = mockDataSource;
