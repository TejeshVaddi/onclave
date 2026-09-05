import type { GeoPoint, Mentor } from "@/types";
import { dataSource } from "./dataSource";
import { distanceMiles } from "@/lib/geo";
import { searchWithBackfill, type BackfillResult } from "@/lib/backfill";

export interface MentorFilters {
  query?: string;
  professions?: string[];
  industries?: string[];
  heritages?: string[];
  interests?: string[];
  /** Minimum years of experience. */
  minExperience?: number;
  /** Maximum years of experience. */
  maxExperience?: number;
  near?: GeoPoint;
  radiusMiles?: number;
}

export const EXPERIENCE_BANDS: { id: string; label: string; min: number; max: number }[] = [
  { id: "early", label: "0–5 yrs", min: 0, max: 5 },
  { id: "mid", label: "6–10 yrs", min: 6, max: 10 },
  { id: "senior", label: "10+ yrs", min: 11, max: 99 },
];

export function matchesMentor(m: Mentor, f: MentorFilters): boolean {
  if (f.query) {
    const q = f.query.toLowerCase();
    const hay = `${m.name} ${m.title} ${m.company} ${m.industry} ${m.heritageLabel} ${m.city} ${m.mentorsIn.join(" ")} ${m.bio}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  if (f.professions?.length && !f.professions.includes(m.profession)) return false;
  if (f.industries?.length && !f.industries.includes(m.industry)) return false;
  if (f.heritages?.length && !m.heritages.some((h) => f.heritages!.includes(h))) return false;
  if (f.interests?.length && !m.interests.some((i) => f.interests!.includes(i))) return false;
  if (typeof f.minExperience === "number" && m.yearsExperience < f.minExperience) return false;
  if (typeof f.maxExperience === "number" && m.yearsExperience > f.maxExperience) return false;
  if (f.near && f.radiusMiles && m.geo && distanceMiles(f.near, m.geo) > f.radiusMiles) return false;
  return true;
}

export async function searchMentors(filters: MentorFilters = {}, minResults = 0): Promise<BackfillResult<Mentor>> {
  const all = await dataSource.getMentors();
  return searchWithBackfill(all, filters, matchesMentor, minResults);
}

export async function getMentor(id: string): Promise<Mentor | undefined> {
  const all = await dataSource.getMentors();
  return all.find((m) => m.id === id);
}

export function availabilityLabel(a: Mentor["availability"]): string {
  switch (a) {
    case "open":
      return "Accepting mentees";
    case "limited":
      return "Limited availability";
    case "waitlist":
      return "Waitlist";
  }
}
