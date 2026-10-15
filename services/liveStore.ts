import type { Community, CulturalEvent, Mentor, Place } from "@/types";
import { readStorage, writeStorage } from "@/lib/storage";

/**
 * Everything the app shows about communities, places, events, and people
 * comes from here. Entries arrive from live search after the server has
 * confirmed each one exists (see services/llm/verify), and are kept in the
 * browser so they survive reloads and so saved items stay saved.
 */
interface StoreData {
  communities: Community[];
  places: Place[];
  events: CulturalEvent[];
  people: Mentor[];
  /** When each search was last run, by key, to avoid repeating it. */
  fetched: Record<string, number>;
}

export interface SyncStatus {
  running: boolean;
  done: number;
  total: number;
  /** null until the first response; false when the server has no API keys. */
  configured: boolean | null;
  /** Set when searches failed (for example, the API key was rejected). */
  error: string | null;
}

type Kind = "communities" | "places" | "events" | "people";
type Entity = { id: string; heritages: string[] };

const STORAGE_KEY = "live-v1";

const empty = (): StoreData => ({ communities: [], places: [], events: [], people: [], fetched: {} });

let data: StoreData = empty();
let status: SyncStatus = { running: false, done: 0, total: 0, configured: null, error: null };
let version = 0;
let hydrated = false;
let persistTimer: ReturnType<typeof setTimeout> | undefined;
const listeners = new Set<() => void>();

function emit() {
  version++;
  listeners.forEach((l) => l());
}

function persistSoon() {
  if (typeof window === "undefined") return;
  clearTimeout(persistTimer);
  persistTimer = setTimeout(() => writeStorage(STORAGE_KEY, data), 400);
}

const today = () => new Date().toISOString().slice(0, 10);

export const liveStore = {
  get communities() {
    return data.communities;
  },
  get places() {
    return data.places;
  },
  get events() {
    return data.events;
  },
  get people() {
    return data.people;
  },
  get status() {
    return status;
  },
  getVersion: () => version,
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  /** Load what an earlier visit found. Called once on the client. */
  hydrate() {
    if (hydrated || typeof window === "undefined") return;
    hydrated = true;
    const saved = readStorage<StoreData | null>(STORAGE_KEY, null);
    if (saved) {
      data = { ...empty(), ...saved };
      // Events that already happened are no longer useful.
      data.events = data.events.filter((e) => (e.endDate ?? e.date) >= today());
    }
    emit();
  },

  /** Add or update entries by id, combining the heritages that surfaced them. */
  merge<T extends Entity>(kind: Kind, items: T[]) {
    if (!items.length) return;
    const current = data[kind] as unknown as T[];
    const byId = new Map(current.map((e) => [e.id, e]));
    for (const item of items) {
      const prev = byId.get(item.id);
      byId.set(item.id, prev ? { ...prev, ...item, heritages: [...new Set([...prev.heritages, ...item.heritages])] } : item);
    }
    (data as unknown as Record<Kind, T[]>)[kind] = [...byId.values()];
    emit();
    persistSoon();
  },

  wasFetched(key: string, ttlMs: number): boolean {
    const at = data.fetched[key];
    return typeof at === "number" && Date.now() - at < ttlMs;
  },

  /** `ageMs` backdates the stamp so an empty result is retried sooner than a good one. */
  markFetched(key: string, ageMs = 0) {
    data.fetched[key] = Date.now() - ageMs;
    persistSoon();
  },

  setStatus(next: Partial<SyncStatus>) {
    status = { ...status, ...next };
    emit();
  },

  clear() {
    data = empty();
    status = { running: false, done: 0, total: 0, configured: status.configured, error: null };
    emit();
    persistSoon();
  },
};
