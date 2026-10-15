import type {
  ArtTone,
  AvatarTone,
  Community,
  CommunityPlatform,
  CommunityType,
  CulturalEvent,
  CulturalPlaceCategory,
  EventCategory,
  FoodPlaceCategory,
  GeoPoint,
  HeritageId,
  Mentor,
  Place,
  User,
} from "@/types";
import type { LiveCommunityItem, LiveEventItem, LivePerson, LivePlaceItem } from "@/services/gemini/types";
import { geocode } from "@/services/geocodeService";
import { initialsOf } from "@/lib/utils";

/**
 * Turns verified live results into the app's own types, so the cards,
 * filters, and recommendation engine work on them unchanged.
 */

const ART: ArtTone[] = ["berry", "terracotta", "green", "gold", "clay", "olive", "plum", "sand"];
const AVATARS: AvatarTone[] = ["berry", "terracotta", "green", "brown"];

function hash(...parts: string[]): number {
  const s = parts.join("|").toLowerCase();
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function stableId(prefix: string, ...parts: string[]): string {
  return `${prefix}-${hash(...parts).toString(36)}`;
}

const pick = <T,>(list: T[], seed: number): T => list[seed % list.length];

const FOOD_CATEGORIES: FoodPlaceCategory[] = ["restaurant", "grocery", "market", "bakery", "cafe"];
const CULTURAL_CATEGORIES: CulturalPlaceCategory[] = ["temple", "mosque", "church", "cultural-center", "museum", "heritage-site", "community-center"];
const EVENT_CATEGORIES: EventCategory[] = ["festival", "religious", "community", "workshop", "performance", "food"];
const COMMUNITY_TYPES: CommunityType[] = ["social", "student", "professional", "cultural", "religious", "local"];

function oneOf<T extends string>(value: string, allowed: T[], fallback: T): T {
  const v = value.trim().toLowerCase();
  return (allowed.find((a) => a === v) ?? fallback) as T;
}

export interface ConvertContext {
  /** Heritages the search was run for; results are filed under them. */
  heritages: HeritageId[];
  user: User;
}

/** Best available coordinates for a result: its city if we know it, otherwise where the user searched. */
function geoFor(city: string, state: string, user: User): GeoPoint {
  const g = city ? geocode({ city, state }) : undefined;
  if (g?.lat != null && g.lng != null) return { lat: g.lat, lng: g.lng };
  if (user.location.lat != null && user.location.lng != null) return { lat: user.location.lat, lng: user.location.lng };
  return { lat: 0, lng: 0 };
}

export function placeFromLive(item: LivePlaceItem, kind: "food" | "cultural", ctx: ConvertContext): Place {
  const category = kind === "food" ? oneOf<FoodPlaceCategory>(item.category, FOOD_CATEGORIES, "restaurant") : oneOf<CulturalPlaceCategory>(item.category, CULTURAL_CATEGORIES, "cultural-center");
  const city = item.city || ctx.user.location.city;
  const state = item.state || ctx.user.location.state || "";
  return {
    id: stableId("lp", item.name, item.externalUrl ?? ""),
    name: item.name,
    kind,
    category,
    heritages: ctx.heritages,
    description: item.description,
    address: item.address,
    city,
    state,
    geo: geoFor(city, state, ctx.user),
    rating: item.rating,
    tags: item.tags,
    hours: item.hours,
    knownFor: item.knownFor?.length ? item.knownFor : undefined,
    externalUrl: item.externalUrl,
    art: pick(ART, hash(item.name)),
  };
}

export function eventFromLive(item: LiveEventItem, ctx: ConvertContext): CulturalEvent | null {
  if (!item.date || !item.externalUrl) return null;
  const isVirtual = /online|virtual|zoom|webinar|livestream/i.test(`${item.venue} ${item.city}`);
  const city = item.city || (isVirtual ? "Online" : ctx.user.location.city);
  const state = item.state || (isVirtual ? "" : ctx.user.location.state || "");
  return {
    id: stableId("le", item.name, item.date, item.externalUrl),
    name: item.name,
    date: item.date,
    timeLabel: item.time,
    venue: item.venue,
    city,
    state,
    geo: isVirtual ? undefined : geoFor(city, state, ctx.user),
    isVirtual,
    description: item.description,
    category: oneOf<EventCategory>(item.category, EVENT_CATEGORIES, "community"),
    heritages: ctx.heritages,
    tags: item.tags,
    organizer: item.organizer ?? item.venue,
    price: item.price ?? "See the event page",
    address: item.address,
    performers: item.performers?.length ? item.performers : undefined,
    ticketInfo: item.ticketInfo,
    externalUrl: item.externalUrl,
    art: pick(ART, hash(item.name)),
  };
}

function platformOf(raw: string): CommunityPlatform {
  const p = raw.trim().toLowerCase();
  if (p.includes("reddit")) return "reddit";
  if (p.includes("facebook")) return "facebook";
  if (p.includes("nextdoor")) return "nextdoor";
  if (p.includes("discord")) return "discord";
  if (p.includes("meetup")) return "meetup";
  return "other";
}

export function communityFromLive(item: LiveCommunityItem, ctx: ConvertContext): Community | null {
  if (!item.externalUrl) return null;
  const [city, state] = item.locationLabel.split(",").map((s) => s.trim());
  const g = !item.isOnline && city ? geocode({ city, state }) : undefined;
  return {
    id: stableId("lc", item.name, item.externalUrl),
    name: item.name,
    platform: platformOf(item.platform),
    description: item.description,
    locationLabel: item.isOnline ? "Online" : item.locationLabel,
    geo: g?.lat != null && g.lng != null ? { lat: g.lat, lng: g.lng } : undefined,
    isOnline: item.isOnline,
    heritages: ctx.heritages,
    type: oneOf<CommunityType>(item.type, COMMUNITY_TYPES, "social"),
    tags: item.tags,
    externalUrl: item.externalUrl,
  };
}

export function mentorFromLive(p: LivePerson, ctx: ConvertContext & { professionId: string; industry: string }): Mentor {
  const [city = "", state = ""] = (p.location ?? "").split(",").map((s) => s.trim());
  const g = city ? geocode({ city, state }) : undefined;
  return {
    id: stableId("lm", p.name, p.evidenceUrl),
    name: p.name,
    initials: initialsOf(p.name),
    avatarTone: pick(AVATARS, hash(p.name)),
    title: p.title,
    company: p.organization,
    industry: ctx.industry,
    profession: ctx.professionId,
    // Only claim a cultural link when the page itself states one.
    heritages: p.culturalFit ? ctx.heritages : [],
    heritageLabel: p.culturalFit ?? "",
    city,
    state,
    geo: g?.lat != null && g.lng != null ? { lat: g.lat, lng: g.lng } : undefined,
    yearsExperience: 0,
    bio: p.fieldFit,
    interests: [],
    mentorsIn: [],
    openTo: p.mentoringEvidence,
    availability: "open",
    languages: [],
    fieldFit: p.fieldFit,
    culturalFit: p.culturalFit,
    evidenceUrl: p.evidenceUrl,
    sourceTitle: p.sourceTitle,
    contacts: p.contacts,
  };
}
