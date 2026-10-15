import type { LiveCommunityItem, LivePlaceItem } from "./gemini/types";
import { isPublicHttpUrl, probePage } from "./llm/verify";

/**
 * Real places from OpenStreetMap, a community-maintained map database. Unlike
 * a language model, it cannot invent a business: every entry is a mapped
 * feature with coordinates. Used for restaurants and shops, cultural and
 * religious places, and community organizations near a person, with no API
 * key. Data (c) OpenStreetMap contributors, under the ODbL.
 *
 * Server-only: it makes outbound requests from a Route Handler.
 */

export type OsmKind = "food" | "places" | "community";

export interface OsmRequest {
  kind: OsmKind;
  heritages: string[];
  lat: number;
  lng: number;
  radiusMeters?: number;
}

// The two public servers run by the Overpass project. Other mirrors were refusing or timing out when checked.
const ENDPOINTS = ["https://overpass-api.de/api/interpreter", "https://z.overpass-api.de/api/interpreter"];
const QUERY_TIMEOUT_S = 20;
const FETCH_TIMEOUT_MS = 25_000;
const MAX_ITEMS = 24;

/** Words that, standing alone in a place's name, tie it to a heritage. */
const NAME_TERMS: Record<string, string[]> = {
  indian: ["india", "indian", "desi", "hindu", "mandir", "bharat", "punjabi", "gujarati", "tamil", "telugu", "bengali", "kerala", "malayali", "swaminarayan", "gurdwara", "sikh"],
  nigerian: ["nigeria", "nigerian", "naija", "igbo", "yoruba", "hausa", "lagos", "abuja"],
  mexican: ["mexico", "mexican", "mexicano", "latino", "latina", "hispanic", "chicano"],
  vietnamese: ["vietnam", "vietnamese", "viet", "saigon", "hanoi"],
  ethiopian: ["ethiopia", "ethiopian", "habesha", "addis", "eritrean", "tigray", "amhara", "oromo"],
  pakistani: ["pakistan", "pakistani", "urdu", "karachi", "lahore", "sindhi"],
  filipino: ["filipino", "philippine", "philippines", "pinoy", "manila", "tagalog", "filam"],
  chinese: ["china", "chinese", "cantonese", "mandarin", "taiwan", "taiwanese", "sichuan", "chinatown"],
  colombian: ["colombia", "colombian", "bogota", "medellin", "paisa"],
  korean: ["korea", "korean", "seoul"],
  ghanaian: ["ghana", "ghanaian", "accra", "kumasi", "akan"],
  salvadoran: ["salvador", "salvadoran", "salvadorean", "pupuseria", "pupusa"],
  bangladeshi: ["bangladesh", "bangladeshi", "bengali", "dhaka", "sylhet", "bangla"],
  iranian: ["iran", "iranian", "persian", "farsi", "tehran", "shiraz"],
  jamaican: ["jamaica", "jamaican", "caribbean", "west indian", "irie", "kingston"],
  egyptian: ["egypt", "egyptian", "coptic", "cairo"],
  lebanese: ["lebanon", "lebanese", "maronite", "beirut", "levant"],
  peruvian: ["peru", "peruvian", "lima", "inca"],
  turkish: ["turkey", "turkish", "istanbul", "anatolia", "ottoman"],
  "sri-lankan": ["sri lanka", "sri lankan", "lankan", "ceylon", "sinhala", "colombo"],
};

/** OpenStreetMap `cuisine` values that belong to a heritage's food. */
const CUISINES: Record<string, string[]> = {
  indian: ["indian", "south_indian", "north_indian", "punjabi", "gujarati", "bengali", "hyderabadi", "kerala", "tamil", "dosa", "chaat"],
  nigerian: ["nigerian", "west_african"],
  mexican: ["mexican", "tex-mex", "taco", "tacos", "tortilla"],
  vietnamese: ["vietnamese", "pho", "banh_mi"],
  ethiopian: ["ethiopian", "eritrean", "ethiopian_eritrean"],
  pakistani: ["pakistani"],
  filipino: ["filipino", "philippine"],
  chinese: ["chinese", "sichuan", "szechuan", "cantonese", "dim_sum", "taiwanese", "hotpot", "hot_pot"],
  colombian: ["colombian"],
  korean: ["korean", "korean_bbq"],
  ghanaian: ["ghanaian", "west_african"],
  salvadoran: ["salvadoran", "pupusa"],
  bangladeshi: ["bangladeshi", "bengali"],
  iranian: ["persian", "iranian"],
  jamaican: ["jamaican", "caribbean", "jerk"],
  egyptian: ["egyptian"],
  lebanese: ["lebanese"],
  peruvian: ["peruvian"],
  turkish: ["turkish", "kebab", "turkish_kebab"],
  "sri-lankan": ["sri_lankan", "srilankan"],
};

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Plain alternation for the server query. Substring matching is much cheaper than word-boundary patterns; the exact word check happens afterwards. */
const alternation = (terms: string[]) => terms.map(esc).join("|");

/** One statement per exact tag value: the map index answers these far faster than a pattern over many values. */
function each(key: string, values: string[], name: string, around: string): string[] {
  return values.map((v) => `nwr["${key}"="${v}"]["name"~"${name}",i]${around};`);
}

function buildQuery(req: OsmRequest): string {
  const r = req.radiusMeters ?? 20_000;
  const wide = `(around:${r},${req.lat},${req.lng})`;
  // Pattern matches on names scan every candidate, so they search a smaller area than tag matches.
  const near = `(around:${Math.round(r * 0.6)},${req.lat},${req.lng})`;
  const names = [...new Set(req.heritages.flatMap((h) => NAME_TERMS[h] ?? []))];
  const cuisines = [...new Set(req.heritages.flatMap((h) => CUISINES[h] ?? []))];
  const nameRe = names.length ? alternation(names) : "";
  const cuisineRe = cuisines.length ? alternation(cuisines) : "";
  const parts: string[] = [];

  if (req.kind === "food") {
    if (cuisineRe) parts.push(`nwr["cuisine"~"${cuisineRe}",i]["name"]${wide};`);
    if (nameRe) {
      parts.push(...each("amenity", ["restaurant", "cafe"], nameRe, near));
      parts.push(...each("shop", ["supermarket", "convenience", "bakery"], nameRe, near));
    }
  } else if (req.kind === "places") {
    if (nameRe) {
      parts.push(...each("amenity", ["place_of_worship", "community_centre", "arts_centre"], nameRe, wide));
      parts.push(...each("tourism", ["museum"], nameRe, wide));
    }
  } else if (nameRe) {
    parts.push(...each("office", ["association", "ngo"], nameRe, wide));
    parts.push(...each("amenity", ["community_centre", "social_centre"], nameRe, wide));
  }
  if (!parts.length) return "";
  return `[out:json][timeout:${QUERY_TIMEOUT_S}][maxsize:33554432];(${parts.join("")});out center tags ${MAX_ITEMS * 4};`;
}

interface OsmElement {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

async function runOverpass(query: string): Promise<OsmElement[]> {
  let lastError = "no endpoint answered";
  // Two passes: a 429 means the server is busy with other callers, and a short wait usually clears it.
  for (let pass = 0; pass < 2; pass++) {
    let busy = false;
    for (const endpoint of ENDPOINTS) {
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "Onclave/1.0 (https://onclave.vercel.app)" },
          body: `data=${encodeURIComponent(query)}`,
          signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        });
        if (res.status === 429) busy = true;
        if (!res.ok) {
          lastError = `${endpoint} answered ${res.status}`;
          continue;
        }
        const data = (await res.json()) as { elements?: OsmElement[] };
        return data.elements ?? [];
      } catch (err) {
        lastError = `${endpoint}: ${err instanceof Error ? err.message : String(err)}`;
      }
    }
    if (!busy) break;
    await new Promise((r) => setTimeout(r, 6_000));
  }
  throw new Error(`Overpass unavailable. ${lastError}`);
}

const titleCase = (s: string) => s.replace(/[_;]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()).trim();

function addressOf(t: Record<string, string>): string {
  const street = [t["addr:housenumber"], t["addr:street"]].filter(Boolean).join(" ");
  return street;
}

function websiteOf(t: Record<string, string>): string | undefined {
  const raw = t.website || t["contact:website"] || t.url;
  if (!raw) return undefined;
  const url = /^https?:\/\//i.test(raw) ? raw.trim() : `https://${raw.trim()}`;
  return isPublicHttpUrl(url) ? url : undefined;
}

function matchedHeritages(t: Record<string, string>, heritages: string[]): string[] {
  const name = (t.name ?? "").toLowerCase();
  const cuisine = (t.cuisine ?? "").toLowerCase().split(";");
  return heritages.filter((h) => (CUISINES[h] ?? []).some((c) => cuisine.includes(c)) || (NAME_TERMS[h] ?? []).some((w) => new RegExp(`(^|[^a-z])${esc(w)}([^a-z]|$)`).test(name)));
}

function placeCategory(t: Record<string, string>, kind: "food" | "places"): string {
  if (kind === "food") {
    if (t.shop === "bakery" || t.shop === "pastry" || t.shop === "confectionery") return "bakery";
    if (["supermarket", "convenience", "butcher", "greengrocer", "deli"].includes(t.shop ?? "")) return "grocery";
    if (t.amenity === "cafe" || t.amenity === "ice_cream") return "cafe";
    return "restaurant";
  }
  if (t.amenity === "place_of_worship") {
    if (t.religion === "muslim") return "mosque";
    if (t.religion === "christian" || t.religion === "jewish") return "church";
    return "temple";
  }
  if (t.tourism === "museum" || t.tourism === "gallery") return "museum";
  if (t.historic || t.tourism === "attraction") return "heritage-site";
  if (t.amenity === "community_centre" || t.amenity === "social_centre") return "community-center";
  return "cultural-center";
}

function describePlace(t: Record<string, string>, category: string, city: string): string {
  const cuisine = t.cuisine ? titleCase(t.cuisine.split(";")[0]) : "";
  const religion = t.religion ? titleCase(t.religion) : "";
  const label = category.replace("-", " ");
  const base = cuisine ? `${cuisine} ${label}` : religion && t.amenity === "place_of_worship" ? `${religion} ${label}` : titleCase(label);
  return `${base}${city ? ` in ${city}` : ""}.`;
}

/** Real places near a point, as live items. Websites are kept only if they load. */
export async function searchOsm(req: OsmRequest): Promise<(LivePlaceItem | LiveCommunityItem)[]> {
  const query = buildQuery(req);
  if (!query) return [];
  const elements = await runOverpass(query);

  const seen = new Set<string>();
  const ranked = elements
    .filter((e) => e.tags?.name && (e.lat != null || e.center))
    .map((e) => {
      const t = e.tags as Record<string, string>;
      const heritages = matchedHeritages(t, req.heritages);
      return { e, t, heritages, hasSite: Boolean(websiteOf(t)), cuisineHit: heritages.some((h) => (CUISINES[h] ?? []).some((c) => (t.cuisine ?? "").toLowerCase().split(";").includes(c))) };
    })
    .filter((x) => x.heritages.length > 0)
    // Entries with a website and a direct cuisine match first: they are the most useful and the most certain.
    .sort((a, b) => Number(b.hasSite) - Number(a.hasSite) || Number(b.cuisineHit) - Number(a.cuisineHit))
    .filter((x) => {
      const key = `${x.t.name.toLowerCase()}|${addressOf(x.t).toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, MAX_ITEMS);

  // A mapped website can be stale, so a link is only shown if its page still loads.
  const sites = await Promise.all(
    ranked.map(async ({ t }) => {
      const url = websiteOf(t);
      if (!url) return undefined;
      const probe = await probePage(url, false);
      return probe.readable || probe.blocked ? probe.finalUrl || url : undefined;
    }),
  );

  const out: (LivePlaceItem | LiveCommunityItem)[] = [];
  ranked.forEach(({ e, t, heritages }, i) => {
    const lat = e.lat ?? e.center?.lat;
    const lng = e.lon ?? e.center?.lon;
    if (lat == null || lng == null) return;
    const city = t["addr:city"] ?? "";
    const state = t["addr:state"] ?? "";
    const site = sites[i];

    if (req.kind === "community") {
      // A community needs a page to point people to.
      if (!site) return;
      out.push({
        kind: "community",
        name: t.name,
        description: `${titleCase(t.office || t.club || t.amenity || "organization")}${city ? ` in ${city}` : ""}.`,
        platform: "Website",
        locationLabel: [city, state].filter(Boolean).join(", ") || "Nearby",
        isOnline: false,
        type: t.office || t.club ? "cultural" : "local",
        tags: [],
        externalUrl: site,
        lat,
        lng,
        heritages,
        source: "openstreetmap",
      });
      return;
    }

    const category = placeCategory(t, req.kind);
    out.push({
      kind: "place",
      name: t.name,
      description: describePlace(t, category, city),
      category,
      address: addressOf(t),
      city,
      state,
      tags: t.cuisine ? t.cuisine.split(";").map(titleCase).slice(0, 3) : [],
      hours: t.opening_hours,
      knownFor: t.cuisine ? t.cuisine.split(";").map(titleCase).slice(0, 4) : undefined,
      externalUrl: site,
      lat,
      lng,
      heritages,
      source: "openstreetmap",
    });
  });
  return out;
}
