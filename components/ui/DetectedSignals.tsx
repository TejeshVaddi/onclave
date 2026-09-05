import { Sparkles } from "lucide-react";
import type { FreeTextSignals } from "@/services/smartSearch";
import { heritageLabel } from "@/data/heritages";
import { interestLabel } from "@/data/interests";
import { professionLabel } from "@/data/professions";
import { communityTypeLabel, platformLabel } from "@/services/communityService";
import { placeCategoryLabel } from "@/services/placeService";
import { eventCategoryLabel } from "@/services/eventService";
import { cn } from "@/lib/utils";

const TIMEFRAME_LABEL: Record<string, string> = {
  today: "Today",
  weekend: "This weekend",
  week: "This week",
  month: "This month",
};

/**
 * Shows what the search bar understood from a typed query — e.g. "Detected:
 * Nigerian · This weekend" — so results that don't literally contain the
 * typed words (matched by heritage, profession, or timing instead) don't
 * feel like a black box.
 */
export function DetectedSignals({ signals, className }: { signals: FreeTextSignals; className?: string }) {
  if (!signals.matched) return null;

  // A word like "doctor" can match both a profession and an interest keyword
  // (e.g. "Medicine" appears in both lists), so dedupe by label.
  const chips = Array.from(
    new Set([
      ...signals.heritages.map((h) => heritageLabel(h)),
      ...signals.professions.map((p) => professionLabel(p)),
      ...signals.interests.map((i) => interestLabel(i)),
      ...signals.dietary,
      ...(signals.timeframe ? [TIMEFRAME_LABEL[signals.timeframe]] : []),
      ...signals.communityTypes.map((t) => communityTypeLabel(t)),
      ...signals.communityPlatforms.map((p) => platformLabel(p)),
      ...signals.foodCategories.map((c) => placeCategoryLabel(c)),
      ...signals.culturalCategories.map((c) => placeCategoryLabel(c)),
      ...signals.eventCategories.map((c) => eventCategoryLabel(c)),
    ]),
  );

  if (!chips.length) return null;

  return (
    <p className={cn("flex flex-wrap items-center gap-1.5 text-xs text-brown-muted", className)}>
      <Sparkles className="h-3.5 w-3.5 text-terracotta" aria-hidden />
      Understood from your search:
      {chips.map((c) => (
        <span key={c} className="rounded-full bg-beige-soft px-2 py-0.5 font-semibold text-brown">
          {c}
        </span>
      ))}
    </p>
  );
}
