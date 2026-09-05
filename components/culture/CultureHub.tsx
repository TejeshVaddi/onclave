"use client";

import { useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { CultureTabs, type CultureTab } from "./CultureTabs";
import { RecipeFinder } from "./RecipeFinder";
import { FoodNearYou } from "./FoodNearYou";
import { CulturalPlaces } from "./CulturalPlaces";
import { EventsList } from "./EventsList";

const VALID_TABS: CultureTab[] = ["recipes", "food", "places", "events"];

export function CultureHub() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initial = searchParams.get("tab");
  const [tab, setTab] = useState<CultureTab>(VALID_TABS.includes(initial as CultureTab) ? (initial as CultureTab) : "recipes");

  const handleChange = useCallback(
    (t: CultureTab) => {
      setTab(t);
      router.replace(`/culture?tab=${t}`, { scroll: false });
    },
    [router],
  );

  return (
    <div>
      <PageHeader
        pillar="culture"
        title="Explore your roots."
        description="Recipes, restaurants, cultural landmarks, and events connected to your heritage: a starting point for staying close to where you come from."
      />
      <CultureTabs value={tab} onChange={handleChange} />
      <div className="mt-6 animate-fade-up" key={tab}>
        {tab === "recipes" && <RecipeFinder />}
        {tab === "food" && <FoodNearYou />}
        {tab === "places" && <CulturalPlaces />}
        {tab === "events" && <EventsList />}
      </div>
    </div>
  );
}
