"use client";

import { useMemo, useState } from "react";
import { Landmark } from "lucide-react";
import { useAppState } from "@/components/providers/AppStateProvider";
import { useAsyncData, useDebouncedValue } from "@/lib/hooks";
import { PlaceCard } from "@/components/cards/PlaceCard";
import { SearchInput } from "@/components/ui/Input";
import { Chip, ChipRow } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { SkeletonGrid } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { BackfillNote } from "@/components/ui/BackfillNote";
import { DetectedSignals } from "@/components/ui/DetectedSignals";
import { LiveResultsSection } from "@/components/ui/LiveResultsSection";
import { CULTURAL_CATEGORIES, searchPlaces } from "@/services/placeService";
import { parseFreeText } from "@/services/smartSearch";
import { HERITAGES } from "@/data/heritages";
import { toggleIn } from "@/lib/hooks";
import { uniq } from "@/lib/utils";
import type { CulturalPlaceCategory } from "@/types";

export function CulturalPlaces() {
  const { user } = useAppState();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 200);
  const [heritages, setHeritages] = useState<string[]>(user.heritages);
  const [categories, setCategories] = useState<CulturalPlaceCategory[]>([]);

  const signals = useMemo(() => parseFreeText(debouncedQuery), [debouncedQuery]);
  const effectiveHeritages = useMemo(() => uniq([...heritages, ...signals.heritages]), [heritages, signals.heritages]);
  const effectiveCategories = useMemo(
    () => uniq([...categories, ...signals.culturalCategories]) as CulturalPlaceCategory[],
    [categories, signals.culturalCategories],
  );
  const queryHandledStructurally = signals.heritages.length > 0 || signals.culturalCategories.length > 0;

  const filters = useMemo(
    () => ({
      kind: "cultural" as const,
      query: queryHandledStructurally ? undefined : debouncedQuery,
      heritages: effectiveHeritages.length ? effectiveHeritages : undefined,
      categories: effectiveCategories.length ? effectiveCategories : undefined,
      near: user.location.lat != null ? { lat: user.location.lat, lng: user.location.lng! } : undefined,
      radiusMiles: 100,
    }),
    [debouncedQuery, queryHandledStructurally, effectiveHeritages, effectiveCategories, user.location.lat, user.location.lng],
  );
  const { data, loading } = useAsyncData(() => searchPlaces(filters, 5), JSON.stringify(filters), { keepPrevious: true });
  const places = data?.items ?? [];

  function clearAll() {
    setQuery("");
    setHeritages([]);
    setCategories([]);
  }

  return (
    <div>
      <div className="space-y-4 rounded-3xl border border-beige bg-white/40 p-4 md:p-5">
        <SearchInput value={query} onChange={setQuery} placeholder="Search temples, museums, cultural centers…" aria-label="Search cultural places" />
        <DetectedSignals signals={signals} />
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-brown-faint">Heritage</p>
          <ChipRow>
            {HERITAGES.slice(0, 12).map((h) => (
              <Chip key={h.id} size="sm" pillar="culture" selected={heritages.includes(h.id)} onClick={() => setHeritages((prev) => toggleIn(prev, h.id))}>
                {h.label}
              </Chip>
            ))}
          </ChipRow>
        </div>
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-brown-faint">Type</p>
          <ChipRow>
            {CULTURAL_CATEGORIES.map((c) => (
              <Chip key={c.id} size="sm" pillar="culture" selected={categories.includes(c.id)} onClick={() => setCategories((prev) => toggleIn(prev, c.id) as CulturalPlaceCategory[])}>
                {c.label}
              </Chip>
            ))}
          </ChipRow>
        </div>
      </div>

      <p className="mt-5 text-sm text-brown-muted">{loading ? "Searching…" : `${places.length} places found`}</p>

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
            icon={<Landmark className="h-6 w-6" aria-hidden />}
            title="No places match those filters"
            description="Try a different heritage or clear your filters."
            action={
              <Button variant="culture" size="sm" onClick={clearAll}>
                Clear filters
              </Button>
            }
          />
        )}
      </div>

      <LiveResultsSection category="places" query={debouncedQuery} heritages={effectiveHeritages} city={user.location.city} state={user.location.state ?? ""} />
    </div>
  );
}
