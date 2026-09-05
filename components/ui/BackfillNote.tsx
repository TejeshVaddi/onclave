import { MapPinOff, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Honest disclosure when a thin search was padded by lib/backfill.ts so a
 * narrow filter combination doesn't strand the user with only one or two
 * results (or, for someone far from the dataset's real-world center, none
 * at all). `outsideRadius` means the distance filter itself had to be
 * dropped to find enough — those items are real, just not nearby. The copy
 * says "location" rather than "distance" since not every card type (mentors,
 * communities, events) shows a numeric distance badge the way places do.
 */
export function BackfillNote({ exactCount, outsideRadius, className }: { exactCount: number; outsideRadius?: boolean; className?: string }) {
  const Icon = outsideRadius ? MapPinOff : Sparkles;
  return (
    <p className={cn("flex items-start gap-2 rounded-xl bg-beige-soft/70 px-3.5 py-2.5 text-xs leading-relaxed text-brown-muted", className)}>
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
      <span>
        {exactCount === 0
          ? "No exact matches for your heritage filter"
          : `Only ${exactCount} exact ${exactCount === 1 ? "match" : "matches"} for your heritage filter`}
        {outsideRadius
          ? " — and nothing else was close enough to you either, so we've included real results from farther away (check the location on each)."
          : " — we've added close alternatives below so there's more to explore."}
      </span>
    </p>
  );
}
