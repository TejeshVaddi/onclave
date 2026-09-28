"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useAppState } from "@/components/providers/AppStateProvider";
import { PillarCard } from "@/components/home/PillarCard";
import { RecommendedSection } from "@/components/home/RecommendedSection";
import { Button } from "@/components/ui/Button";
import { PILLAR_ORDER } from "@/lib/pillars";
import { heritageList } from "@/data/heritages";
import { formatLocation } from "@/services/geocodeService";

export default function HomePage() {
  const { user, hydrated } = useAppState();
  const router = useRouter();
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (hydrated && !user.onboardingComplete && !hasRedirected.current) {
      hasRedirected.current = true;
      router.push("/onboarding");
    }
  }, [hydrated, user.onboardingComplete, router]);

  const firstName = user.name.split(" ")[0];

  return (
    <div className="animate-fade-up">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium text-brown-muted">
            {user.heritages.length ? `${heritageList(user.heritages)} · ${formatLocation(user.location)}` : formatLocation(user.location)}
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-brown text-balance md:text-4xl">Welcome back, {firstName}.</h1>
          <p className="mt-2 max-w-xl text-[15px] text-brown-muted">Three ways to reconnect: your community, your culture, and your future.</p>
        </div>
        <Button href="/discover" variant="outline" size="lg" icon={<Search className="h-4 w-4" aria-hidden />} className="self-start">
          Ask Onclave anything
        </Button>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 md:mt-10">
        {PILLAR_ORDER.map((p) => (
          <PillarCard key={p} pillar={p} />
        ))}
      </div>

      <RecommendedSection />
    </div>
  );
}
