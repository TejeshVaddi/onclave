"use client";

import { useMemo } from "react";
import { Sparkles } from "lucide-react";
import { useUser } from "@/components/providers/AppStateProvider";
import { RecommendationCard } from "@/components/cards/RecommendationCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { recommendForHome, explainProfile } from "@/services/recommendations";

export function RecommendedSection() {
  const user = useUser();
  const recs = useMemo(() => recommendForHome(user, 8), [user]);
  const explanation = useMemo(() => explainProfile(user), [user]);

  return (
    <section className="mt-10 md:mt-14">
      <SectionHeader
        eyebrow="Personalized for you"
        title="Recommended for you"
        description={`${explanation}, here's where to start.`}
        action={
          <span className="inline-flex items-center gap-1.5 rounded-full bg-beige-soft px-3 py-1.5 text-xs font-semibold text-brown-muted">
            <Sparkles className="h-3.5 w-3.5 text-terracotta" aria-hidden />
            Powered by your profile
          </span>
        }
      />
      {recs.length ? (
        <div className="mt-5 grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
          {recs.map((rec) => (
            <RecommendationCard key={rec.id} rec={rec} />
          ))}
        </div>
      ) : (
        <EmptyState
          className="mt-5"
          title="Add a few details to unlock recommendations"
          description="Complete your profile with heritage, location, and interests to see personalized picks here."
        />
      )}
    </section>
  );
}
