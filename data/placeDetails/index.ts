import type { PlaceDetail } from "@/types";
import { PLACE_DETAILS_1 } from "./part1";
import { PLACE_DETAILS_2 } from "./part2";
import { PLACE_DETAILS_3 } from "./part3";
import { PLACE_DETAILS_4 } from "./part4";

/** Hours, highlights, and tips for each place, keyed by place id. */
export const PLACE_DETAILS: Record<string, PlaceDetail> = {
  ...PLACE_DETAILS_1,
  ...PLACE_DETAILS_2,
  ...PLACE_DETAILS_3,
  ...PLACE_DETAILS_4,
};

export function getPlaceDetail(id: string): PlaceDetail | undefined {
  return PLACE_DETAILS[id];
}
