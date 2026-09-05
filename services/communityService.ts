import type { Community, CommunityPlatform, CommunityType, GeoPoint } from "@/types";
import { dataSource } from "./dataSource";
import { distanceMiles } from "@/lib/geo";
import { searchWithBackfill, type BackfillResult } from "@/lib/backfill";

export interface CommunityFilters {
  query?: string;
  heritages?: string[];
  types?: CommunityType[];
  platforms?: CommunityPlatform[];
  /** "online" | "local" | "all" */
  locationMode?: "all" | "online" | "local";
  /** When provided with radiusMiles, local communities are limited to that radius. */
  near?: GeoPoint;
  radiusMiles?: number;
}

export const COMMUNITY_TYPES: { id: CommunityType; label: string }[] = [
  { id: "social", label: "Social" },
  { id: "student", label: "Student" },
  { id: "professional", label: "Professional" },
  { id: "cultural", label: "Cultural" },
  { id: "religious", label: "Religious" },
  { id: "local", label: "Local organization" },
];

export const PLATFORMS: { id: CommunityPlatform; label: string }[] = [
  { id: "reddit", label: "Reddit" },
  { id: "facebook", label: "Facebook" },
  { id: "nextdoor", label: "Nextdoor" },
  { id: "discord", label: "Discord" },
  { id: "meetup", label: "Meetup" },
  { id: "other", label: "Other" },
];

export function platformLabel(id: CommunityPlatform): string {
  return PLATFORMS.find((p) => p.id === id)?.label ?? "Other";
}

export function communityTypeLabel(id: CommunityType): string {
  return COMMUNITY_TYPES.find((t) => t.id === id)?.label ?? id;
}

export function matchesCommunity(c: Community, f: CommunityFilters): boolean {
  if (f.query) {
    const q = f.query.toLowerCase();
    const hay = `${c.name} ${c.description} ${c.locationLabel} ${c.tags.join(" ")}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  if (f.heritages?.length) {
    // Communities without heritages (e.g. local subreddits) match everyone.
    if (c.heritages.length && !c.heritages.some((h) => f.heritages!.includes(h))) return false;
  }
  if (f.types?.length && !f.types.includes(c.type)) return false;
  if (f.platforms?.length && !f.platforms.includes(c.platform)) return false;
  if (f.locationMode === "online" && !c.isOnline) return false;
  if (f.locationMode === "local" && c.isOnline) return false;
  if (f.near && f.radiusMiles && !c.isOnline && c.geo) {
    if (distanceMiles(f.near, c.geo) > f.radiusMiles) return false;
  }
  return true;
}

export async function searchCommunities(filters: CommunityFilters = {}, minResults = 0): Promise<BackfillResult<Community>> {
  const all = await dataSource.getCommunities();
  return searchWithBackfill(all, filters, matchesCommunity, minResults);
}

export async function getCommunity(id: string): Promise<Community | undefined> {
  const all = await dataSource.getCommunities();
  return all.find((c) => c.id === id);
}
