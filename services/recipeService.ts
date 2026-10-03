import type { Difficulty, Recipe } from "@/types";
import { dataSource } from "./dataSource";
import { searchWithBackfill, type BackfillResult } from "@/lib/backfill";

export interface RecipeFilters {
  query?: string;
  heritages?: string[];
  difficulty?: Difficulty[];
  maxMinutes?: number;
  dietary?: string[];
}

export const DIFFICULTIES: { id: Difficulty; label: string }[] = [
  { id: "easy", label: "Easy" },
  { id: "medium", label: "Medium" },
  { id: "hard", label: "Advanced" },
];

export function matchesRecipe(r: Recipe, f: RecipeFilters): boolean {
  if (f.query) {
    const q = f.query.toLowerCase();
    const hay = `${r.name} ${r.description} ${r.cuisine} ${r.tags.join(" ")} ${r.ingredientsPreview.join(" ")}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  if (f.heritages?.length && !r.heritages.some((h) => f.heritages!.includes(h))) return false;
  if (f.difficulty?.length && !f.difficulty.includes(r.difficulty)) return false;
  if (f.maxMinutes && r.timeMinutes > f.maxMinutes) return false;
  if (f.dietary?.length && !f.dietary.every((d) => r.dietary.some((x) => x.toLowerCase().includes(d.toLowerCase())))) return false;
  return true;
}

/**
 * `minResults` (default 0 = off) backfills thin heritage-filtered searches
 * with the next-best heritage-relaxed matches so a narrow combination (e.g.
 * one heritage + a rare difficulty) doesn't strand the user with one or two
 * results. See lib/backfill.ts.
 */
export async function searchRecipes(filters: RecipeFilters = {}, minResults = 0): Promise<BackfillResult<Recipe>> {
  const all = await dataSource.getRecipes();
  return searchWithBackfill(all, filters, matchesRecipe, minResults);
}

export async function getRecipe(id: string): Promise<Recipe | undefined> {
  const all = await dataSource.getRecipes();
  return all.find((r) => r.id === id);
}
