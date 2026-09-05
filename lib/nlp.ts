import type { Timeframe } from "@/types";

/**
 * Small, dependency-free text-parsing helpers shared by the AI Discovery
 * page and the smarter search bars on Community, Culture, and Profession.
 * Kept framework-agnostic (no service imports) so both layers can use it
 * without a circular dependency.
 */

/** Whole-word (not substring) match, case-insensitive. */
export const hasWord = (text: string, phrase: string): boolean =>
  new RegExp(`(^|[^a-z])${phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?=$|[^a-z])`, "i").test(text);

export function detectTimeframe(text: string): Timeframe {
  if (/\b(today|tonight)\b/.test(text)) return "today";
  if (/\b(this )?weekend\b|\bsaturday\b|\bsunday\b/.test(text)) return "weekend";
  if (/\bthis week\b|\bnext few days\b/.test(text)) return "week";
  if (/\bthis month\b|\bsoon\b|\bupcoming\b/.test(text)) return "month";
  return null;
}
