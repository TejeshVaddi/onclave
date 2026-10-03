import type { RecipeDetail } from "@/types";
import { RECIPE_DETAILS_1 } from "./part1";
import { RECIPE_DETAILS_2 } from "./part2";
import { RECIPE_DETAILS_3 } from "./part3";
import { RECIPE_DETAILS_4 } from "./part4";
import { RECIPE_DETAILS_5 } from "./part5";
import { RECIPE_DETAILS_6 } from "./part6";

/** Full ingredient lists and methods, keyed by recipe id. */
export const RECIPE_DETAILS: Record<string, RecipeDetail> = {
  ...RECIPE_DETAILS_1,
  ...RECIPE_DETAILS_2,
  ...RECIPE_DETAILS_3,
  ...RECIPE_DETAILS_4,
  ...RECIPE_DETAILS_5,
  ...RECIPE_DETAILS_6,
};

export function getRecipeDetail(id: string): RecipeDetail | undefined {
  return RECIPE_DETAILS[id];
}
