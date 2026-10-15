import type { HeritageId, User } from "@/types";
import type { LiveSearchCategory } from "@/services/gemini/types";
import { getProfession } from "@/data/professions";
import { fetchLiveResults, fetchOsmPlaces, fetchPeople } from "@/services/liveSearch";
import { liveStore } from "@/services/liveStore";
import { communityFromLive, eventFromLive, mentorFromLive, placeFromLive, type ConvertContext } from "@/services/liveConvert";

/**
 * Fills the live store for a person's profile: for each heritage they chose,
 * the communities, food, cultural places, and events near where they live;
 * and for their field, professional communities and career events. Every
 * result has already been confirmed to exist by the server.
 */
const TTL_MS = 24 * 60 * 60 * 1000;
const EMPTY_RETRY_MS = 2 * 60 * 60 * 1000;
// One at a time: bursts of simultaneous searches are what trip per-minute rate limits.
const CONCURRENCY = 1;
const MAX_HERITAGES = 2;

interface Job {
  key: string;
  category: LiveSearchCategory;
  heritages: HeritageId[];
  query: string;
  /** "osm" asks OpenStreetMap (no key needed); "ai" asks a web-searching model. */
  source: "osm" | "ai";
}

function jobsFor(user: User): Job[] {
  const where = `${user.location.city.trim().toLowerCase()}|${(user.location.state ?? "").trim().toLowerCase()}`;
  const heritages = user.heritages.slice(0, MAX_HERITAGES);
  const h = [...heritages].sort().join(",");
  const categories: LiveSearchCategory[] = ["community", "events", "places", "food"];

  // Map data first: it needs no API key and cannot invent a place, so these lists fill even when AI search is unavailable.
  const jobs: Job[] = (["food", "places", "community"] as const).map((category) => ({
    key: `osm|${category}|${h}|${where}`,
    category: category === "places" ? "places" : category,
    heritages,
    query: "",
    source: "osm" as const,
  }));

  // One AI search per category covering the chosen heritages together: every search
  // spends API quota, so a profile costs a handful of searches, not dozens.
  jobs.push(...categories.map((category) => ({ key: `${category}|${h}|${where}`, category, heritages, query: "", source: "ai" as const })));

  const profession = user.profession ? getProfession(user.profession) : undefined;
  if (profession) {
    jobs.push({ key: `community|prof:${profession.id}|${h}|${where}`, category: "community", heritages, query: `${profession.label} professionals and students`, source: "ai" });
    jobs.push({ key: `events|prof:${profession.id}|${h}|${where}`, category: "events", heritages, query: `${profession.label} career panels, networking, and workshops`, source: "ai" });
  }
  return jobs;
}

async function runOsmJob(job: Job, user: User): Promise<void> {
  const res = await fetchOsmPlaces({
    kind: job.category === "food" ? "food" : job.category === "community" ? "community" : "places",
    heritages: job.heritages,
    city: user.location.city,
    state: user.location.state ?? "",
    lat: user.location.lat,
    lng: user.location.lng,
  });
  if (res.error && !res.results.length) return; // busy or unreachable: try again next time

  const ctx: ConvertContext = { heritages: job.heritages, user };
  if (job.category === "food") {
    liveStore.merge("places", res.results.flatMap((r) => (r.kind === "place" ? [placeFromLive(r, "food", ctx)] : [])));
  } else if (job.category === "places") {
    liveStore.merge("places", res.results.flatMap((r) => (r.kind === "place" ? [placeFromLive(r, "cultural", ctx)] : [])));
  } else {
    liveStore.merge("communities", res.results.flatMap((r) => (r.kind === "community" ? [communityFromLive(r, ctx)] : [])).filter((c) => c !== null));
  }
  liveStore.markFetched(job.key, res.results.length ? 0 : TTL_MS - EMPTY_RETRY_MS);
}

async function runJob(job: Job, user: User): Promise<void> {
  if (job.source === "osm") return runOsmJob(job, user);
  const res = await fetchLiveResults({
    category: job.category,
    query: job.query,
    heritages: job.heritages,
    city: user.location.city,
    state: user.location.state ?? "",
  });

  if (!res.configured) {
    liveStore.setStatus({ configured: false });
    throw new Error("not-configured");
  }
  liveStore.setStatus({ configured: true });
  if (res.error && !res.results.length) {
    // Not remembered as fetched, so the next visit tries again.
    liveStore.setStatus({ error: res.error });
    return;
  }

  const ctx: ConvertContext = { heritages: job.heritages, user };
  switch (job.category) {
    case "community":
      liveStore.merge("communities", res.results.flatMap((r) => (r.kind === "community" ? [communityFromLive(r, ctx)] : [])).filter((c) => c !== null));
      break;
    case "food":
      liveStore.merge("places", res.results.flatMap((r) => (r.kind === "place" ? [placeFromLive(r, "food", ctx)] : [])));
      break;
    case "places":
      liveStore.merge("places", res.results.flatMap((r) => (r.kind === "place" ? [placeFromLive(r, "cultural", ctx)] : [])));
      break;
    case "events":
      liveStore.merge("events", res.results.flatMap((r) => (r.kind === "event" ? [eventFromLive(r, ctx)] : [])).filter((e) => e !== null));
      break;
    default:
      break;
  }
  liveStore.markFetched(job.key, res.results.length ? 0 : TTL_MS - EMPTY_RETRY_MS);
}

let inFlight: Promise<void> | null = null;

/** Runs any searches this profile has not had results for recently. Safe to call repeatedly. */
export function syncProfileData(user: User, force = false): Promise<void> {
  if (!user.onboardingComplete || !user.location.city.trim() || !user.heritages.length) return Promise.resolve();
  if (inFlight) return inFlight;

  const pending = jobsFor(user).filter((j) => force || !liveStore.wasFetched(j.key, TTL_MS));
  if (!pending.length) return Promise.resolve();

  liveStore.setStatus({ running: true, done: 0, total: pending.length, error: null });
  const queue = [...pending];
  let stopped = false;

  const worker = async () => {
    while (queue.length && !stopped) {
      const job = queue.shift()!;
      try {
        await runJob(job, user);
      } catch (err) {
        if (err instanceof Error && err.message === "not-configured") stopped = true;
      }
      liveStore.setStatus({ done: liveStore.status.done + 1 });
    }
  };

  inFlight = Promise.all(Array.from({ length: CONCURRENCY }, worker))
    .then(() => undefined)
    .finally(() => {
      inFlight = null;
      liveStore.setStatus({ running: false });
    });
  return inFlight;
}

export interface PeopleOutcome {
  configured: boolean;
  count: number;
  error?: string;
}

/** Looks for real people in the person's field, tailored to their background. Results are added to the store. */
export async function syncPeople(user: User, query = "", force = false): Promise<PeopleOutcome> {
  const profession = user.profession ? getProfession(user.profession) : undefined;
  if (!profession) return { configured: true, count: 0, error: "Choose a field in your profile to find people." };

  const heritages = user.heritages.slice(0, 3);
  const key = `people|${profession.id}|${[...heritages].sort().join(",")}|${user.location.city.toLowerCase()}|${(user.location.state ?? "").toLowerCase()}|${query.trim().toLowerCase()}`;
  if (!force && liveStore.wasFetched(key, TTL_MS)) return { configured: true, count: liveStore.people.length };

  const res = await fetchPeople({
    professionLabel: profession.label,
    industry: profession.industry,
    heritages,
    city: user.location.city,
    state: user.location.state ?? "",
    query,
  });
  if (!res.configured) return { configured: false, count: 0 };

  const ctx = { heritages, user, professionId: profession.id, industry: profession.industry };
  liveStore.merge("people", res.people.map((p) => mentorFromLive(p, ctx)));
  if (!res.error) liveStore.markFetched(key, res.people.length ? 0 : TTL_MS - EMPTY_RETRY_MS);
  return { configured: true, count: res.people.length, error: res.error };
}
