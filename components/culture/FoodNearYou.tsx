"use client";

import { useMemo, useState } from "react";
import { UtensilsCrossed } from "lucide-react";
import { useAppState } from "@/components/providers/AppStateProvider";
import { useAsyncData, useDebouncedValue } from "@/lib/hooks";
import { PlaceCard } from "@/components/cards/PlaceCard";
import { SearchInput } from "@/components/ui/Input";
import { Chip, ChipRow } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { SkeletonGrid } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { DemoNote } from "@/components/ui/DemoNote";
import { BackfillNote } from "@/components/ui/BackfillNote";
import { DetectedSignals } from "@/components/ui/DetectedSignals";
import { LiveResultsSection } from "@/components/ui/LiveResultsSection";
import { FOOD_CATEGORIES, searchPlaces } from "@/services/placeService";
import { parseFreeText } from "@/services/smartSearch";
import { toggleIn } from "@/lib/hooks";
import { uniq } from "@/lib/utils";
import type { FoodPlaceCategory } from "@/types";

export function FoodNearYou() {
  const { user } = useAppState();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 200);
  const [categories, setCategories] = useState<FoodPlaceCategory[]>([]);

  const signals = useMemo(() => parseFreeText(debouncedQuery), [debouncedQuery]);
  // Heritage already comes from onboarding — the search bar only needs to
  // layer in whatever heritage the text itself mentions.
  const effectiveHeritages = useMemo(() => uniq([...user.heritages, ...signals.heritages]), [user.heritages, signals.heritages]);
  const effectiveCategories = useMemo(
    () => uniq([...categories, ...signals.foodCategories]) as FoodPlaceCategory[],
    [categories, signals.foodCategories],
  );
  const queryHandledStructurally = signals.heritages.length > 0 || signals.foodCategories.length > 0;

  const filters = useMemo(
    () => ({
      kind: "food" as const,
      query: queryHandledStructurally ? undefined : debouncedQuery,
      heritages: effectiveHeritages.length ? effectiveHeritages : undefined,
      categories: effectiveCategories.length ? effectiveCategories : undefined,
      near: user.location.lat != null ? { lat: user.location.lat, lng: user.location.lng! } : undefined,
      radiusMiles: 75,
    }),
    [debouncedQuery, queryHandledStructurally, effectiveHeritages, effectiveCategories, user.location.lat, user.location.lng],
  );
  const { data, loading } = useAsyncData(() => searchPlaces(filters, 5), JSON.stringify(filters), { keepPrevious: true });
  const places = data?.items ?? [];

  function clearAll() {
    setQuery("");
    setCategories([]);
  }

  return (
    <div>
      <div className="space-y-4 rounded-3xl border border-beige bg-white/40 p-4 md:p-5">
        <SearchInput value={query} onChange={setQuery} placeholder="Search restaurants, groceries, bakeries…" aria-label="Search food near you" />
        <DetectedSignals signals={signals} />
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-brown-faint">Category</p>
          <ChipRow>
            {FOOD_CATEGORIES.map((c) => (
              <Chip key={c.id} size="sm" pillar="culture" selected={categories.includes(c.id)} onClick={() => setCategories((prev) => toggleIn(prev, c.id) as FoodPlaceCategory[])}>
                {c.label}
              </Chip>
            ))}
          </ChipRow>
        </div>
      </div>

      <p className="mt-5 text-sm text-brown-muted">{loading ? "Searching…" : `${places.length} places found near ${user.location.city}`}</p>

      {!loading && data?.backfilled ? <BackfillNote exactCount={data.exactCount} outsideRadius={data.outsideRadius} className="mt-3" /> : null}

      <div className="mt-3">
        {loading ? (
          <SkeletonGrid count={6} withCover />
        ) : places.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {places.map((p) => (
              <PlaceCard key={p.id} place={p} distanceMiles={p.distanceMiles} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<UtensilsCrossed className="h-6 w-6" aria-hidden />}
            title="No places match those filters"
            description="Try a different category or clear your filters."
            action={
              <Button variant="culture" size="sm" onClick={clearAll}>
                Clear filters
              </Button>
            }
          />
        )}
      </div>

      <LiveResultsSection category="food" query={debouncedQuery} heritages={effectiveHeritages} city={user.location.city} state={user.location.state ?? ""} />

      <DemoNote className="mt-6">
        Locations shown are illustrative demo entries around the Washington, DC metro area. A production build would call a Places API (Google Places, Yelp, or Foursquare) using the user&apos;s real location.
      </DemoNote>
    </div>
  );
}
