import { Sparkles } from "lucide-react";
import type { RecommendationReason } from "@/types";
import { cn } from "@/lib/utils";
import { matchStrength } from "@/services/recommendations";

const SIGNAL_STYLE: Record<RecommendationReason["signal"], string> = {
  heritage: "bg-berry-soft text-berry-deep",
  location: "bg-green-soft text-green-deep",
  profession: "bg-terracotta-soft text-terracotta-deep",
  interest: "bg-beige text-brown",
  goal: "bg-terracotta-soft text-terracotta-deep",
  timing: "bg-green-soft text-green-deep",
};

export function MatchReasons({ reasons, score, max = 3, className }: { reasons: RecommendationReason[]; score?: number; max?: number; className?: string }) {
  if (!reasons.length) return null;
  const top = [...reasons].sort((a, b) => b.points - a.points).slice(0, max);
  const strength = typeof score === "number" ? matchStrength(score) : null;
  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {strength ? (
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide",
            strength === "strong" ? "bg-brown text-cream" : strength === "good" ? "bg-beige-deep text-brown" : "bg-beige-soft text-brown-muted",
          )}
          title={`Match score ${score}`}
        >
          <Sparkles className="h-3 w-3" aria-hidden />
          {strength === "strong" ? "Strong match" : strength === "good" ? "Good match" : "Match"}
        </span>
      ) : null}
      {top.map((r) => (
        <span key={r.label} className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", SIGNAL_STYLE[r.signal])}>
          {r.label}
        </span>
      ))}
    </div>
  );
}
