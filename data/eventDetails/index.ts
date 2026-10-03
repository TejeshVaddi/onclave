import type { EventDetail } from "@/types";
import { EVENT_DETAILS_1 } from "./part1";
import { EVENT_DETAILS_2 } from "./part2";

/** Lineups, schedules, and ticketing for each event, keyed by event id. */
export const EVENT_DETAILS: Record<string, EventDetail> = {
  ...EVENT_DETAILS_1,
  ...EVENT_DETAILS_2,
};

export function getEventDetail(id: string): EventDetail | undefined {
  return EVENT_DETAILS[id];
}
