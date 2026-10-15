import type { HeritageId, User } from "@/types";
import type { LiveSearchCategory } from "@/services/gemini/types";
import { getProfession } from "@/data/professions";
import { fetchLiveResults, fetchPeople } from "@/services/liveSearch";
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
const CONCURRENCY = 2;
const MAX_HERITAGES = 3;

interface Job {
  key: string;
  category: LiveSearchCategory;
  heritages: HeritageId[];
  query: string;
}

function jobsFor(user: User): Job[] {
  const where = `${user.location.city.trim().toLowerCase()}|${(user.location.state ?? "").trim().toLowerCase()}`;
  const jobs: Job[] = [];
  const heritages = user.heritages.slice(0, MAX_HERITAGES);
  const categories: LiveSearchCategory[] = ["community", "events", "places", "food"];

  for (const h of heritages) {
    for (const category of categories) {
      jobs.push({ key: `${category}|${h}|${where}`, category, heritages: [h], query: "" });
    }
  }

  const profession = user.profession ? getProfession(user.profession) : undefined;
  if (profession) {
    const hs = user.heritages.slice(0, 2);
    jobs.push({ key: `community|prof:${profession.id}|${hs.join(",")}|${where}`, category: "community", heritages: hs, query: `${profession.label} professionals and students` });
    jobs.push({ key: `events|prof:${profession.id}|${hs.join(",")}|${where}`, category: "events", heritages: hs, query: `${profession.label} career panels, networking, and workshops` });
  }
  return jobs;
}

async function runJob(job: Job, user: User): Promise<void> {
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
