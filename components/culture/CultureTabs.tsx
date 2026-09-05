"use client";

import { ChefHat, Landmark, MapPin, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

export type CultureTab = "recipes" | "food" | "places" | "events";

export const CULTURE_TABS: { id: CultureTab; label: string; icon: typeof ChefHat }[] = [
  { id: "recipes", label: "Recipes", icon: ChefHat },
  { id: "food", label: "Food Near You", icon: MapPin },
  { id: "places", label: "Cultural Places", icon: Landmark },
  { id: "events", label: "Events", icon: CalendarDays },
];

export function CultureTabs({ value, onChange }: { value: CultureTab; onChange: (t: CultureTab) => void }) {
  return (
    <div role="tablist" aria-label="Culture sections" className="flex gap-1 overflow-x-auto scrollbar-none rounded-2xl bg-beige-soft p-1.5 -mx-4 px-4 sm:mx-0 sm:px-1.5">
      {CULTURE_TABS.map((t) => {
        const active = t.id === value;
        const Icon = t.icon;
        return (
          <button
            key={t.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.id)}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all sm:flex-1 sm:justify-center",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-berry",
              active ? "bg-cream text-berry shadow-soft" : "text-brown-muted hover:text-brown",
            )}
          >
            <Icon className="h-4 w-4" aria-hidden />
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
