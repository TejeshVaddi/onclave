"use client";

import { useMemo, useState } from "react";
import { Users } from "lucide-react";
import { useAppState } from "@/components/providers/AppStateProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { useAsyncData, useDebouncedValue } from "@/lib/hooks";
import { CommunityCard } from "@/components/cards/CommunityCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { SearchInput } from "@/components/ui/Input";
import { Chip, ChipRow } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { Segmented } from "@/components/ui/Segmented";
import { SkeletonGrid } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { DemoNote } from "@/components/ui/DemoNote";
import { BackfillNote } from "@/components/ui/BackfillNote";
import { DetectedSignals } from "@/components/ui/DetectedSignals";
import { LiveResultsSection } from "@/components/ui/LiveResultsSection";
import { COMMUNITY_TYPES, PLATFORMS, searchCommunities, type CommunityFilters } from "@/services/communityService";
import { parseFreeText } from "@/services/smartSearch";
import { toggleIn } from "@/lib/hooks";
import { uniq } from "@/lib/utils";
import type { CommunityPlatform, CommunityType } from "@/types";

export function CommunityFinder() {
  const { user, savedCommunityIds, toggleSavedCommunity } = useAppState();
  const { toast } = useToast();

  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 200);
  const [types, setTypes] = useState<CommunityType[]>([]);
  const [platforms, setPlatforms] = useState<CommunityPlatform[]>([]);
  const [locationMode, setLocationMode] = useState<"all" | "online" | "local">("all");

  const signals = useMemo(() => parseFreeText(debouncedQuery), [debouncedQuery]);
  // Heritage already comes from onboarding — the search bar only needs to
  // layer in whatever heritage the text itself mentions.
  const effectiveHeritages = useMemo(() => uniq([...user.heritages, ...signals.heritages]), [user.heritages, signals.heritages]);
  const effectiveTypes = useMemo(() => uniq([...types, ...signals.communityTypes]) as CommunityType[], [types, signals.communityTypes]);
  const effectivePlatforms = useMemo(
    () => uniq([...platforms, ...signals.communityPlatforms]) as CommunityPlatform[],
    [platforms, signals.communityPlatforms],
  );
  // Only skip the literal substring match when the query actually resolved to
  // a filter this page understands — a detected profession or interest
  // keyword isn't applied here, so it shouldn't silently drop search.
  const queryHandledStructurally = signals.heritages.length > 0 || signals.communityTypes.length > 0 || signals.communityPlatforms.length > 0;

  const filters: CommunityFilters = useMemo(
    () => ({
      // A recognized query (e.g. "naija students" or "discord") already
      // became structured filters below; requiring it to also literally
      // appear in the text would defeat the point, so only fall back to
      // plain substring search when nothing was understood.
      query: queryHandledStructurally ? undefined : debouncedQuery,
      heritages: effectiveHeritages.length ? effectiveHeritages : undefined,
      types: effectiveTypes.length ? effectiveTypes : undefined,
      platforms: effectivePlatforms.length ? effectivePlatforms : undefined,
      locationMode,
      near: user.location.lat != null ? { lat: user.location.lat, lng: user.location.lng! } : undefined,
      radiusMiles: 60,
    }),
    [debouncedQuery, queryHandledStructurally, effectiveHeritages, effectiveTypes, effectivePlatforms, locationMode, user.location.lat, user.location.lng],
  );

  const key = JSON.stringify(filters);
  const { data, loading } = useAsyncData(() => searchCommunities(filters, 5), key, { keepPrevious: true });
  const communities = data?.items ?? [];

  const hasFilters = types.length > 0 || platforms.length > 0 || locationMode !== "all" || query.length > 0;

  function clearAll() {
    setQuery("");
    setTypes([]);
    setPlatforms([]);
    setLocationMode("all");
  }

  function handleSave(id: string) {
    const nowSaved = toggleSavedCommunity(id);
    toast({ title: nowSaved ? "Saved to My Communities" : "Removed from My Communities", pillar: "community", variant: nowSaved ? "success" : "info" });
  }

  return (
    <div>
      <PageHeader
        pillar="community"
        title="Find your people."
        description="Onclave is a discovery layer. We surface public communities and organizations that already exist on Reddit, Facebook, Meetup, Discord, and beyond, and every result links out to where the community actually lives. We don't host any of it."
      />

      <div className="space-y-4 rounded-3xl border border-beige bg-white/40 p-4 md:p-5">
        <SearchInput value={query} onChange={setQuery} placeholder="Search communities" aria-label="Search communities" />
        <DetectedSignals signals={signals} />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Segmented
            label="Location"
            value={locationMode}
            onChange={setLocationMode}
            options={[
              { id: "all", label: "All" },
              { id: "local", label: "Near me" },
              { id: "online", label: "Online" },
            ]}
          />
          {hasFilters ? (
            <Button variant="ghost" size="sm" onClick={clearAll}>
              Clear filters
            </Button>
          ) : null}
        </div>

        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-brown-faint">Type</p>
          <ChipRow>
            {COMMUNITY_TYPES.map((t) => (
              <Chip key={t.id} size="sm" pillar="community" selected={types.includes(t.id)} onClick={() => setTypes((prev) => toggleIn(prev, t.id) as CommunityType[])}>
                {t.label}
              </Chip>
            ))}
          </ChipRow>
        </div>

        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-brown-faint">Platform</p>
          <ChipRow>
            {PLATFORMS.map((p) => (
              <Chip key={p.id} size="sm" pillar="community" selected={platforms.includes(p.id)} onClick={() => setPlatforms((prev) => toggleIn(prev, p.id) as CommunityPlatform[])}>
                {p.label}
              </Chip>
            ))}
          </ChipRow>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <p className="text-sm text-brown-muted">{loading ? "Searching…" : `${communities.length} communities found`}</p>
      </div>

      {!loading && data?.backfilled ? <BackfillNote exactCount={data.exactCount} outsideRadius={data.outsideRadius} className="mt-3" /> : null}

      <div className="mt-3">
        {loading ? (
          <SkeletonGrid count={6} />
        ) : communities.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {communities.map((c) => (
              <CommunityCard key={c.id} community={c} saved={savedCommunityIds.includes(c.id)} onToggleSave={handleSave} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Users className="h-6 w-6" aria-hidden />}
            title="No communities match those filters"
            description="Try removing a filter or searching a different term."
            action={
              <Button variant="community" size="sm" onClick={clearAll}>
                Clear filters
              </Button>
            }
          />
        )}
      </div>

      <LiveResultsSection category="community" query={debouncedQuery} heritages={effectiveHeritages} city={user.location.city} state={user.location.state ?? ""} />

      <DemoNote className="mt-6">
        This is a curated demo dataset. A production version of Onclave would continuously discover and verify public communities via the Reddit, Meetup, Facebook Groups, and Discord APIs, replacing this list without any change to the page you&apos;re using.
      </DemoNote>
    </div>
  );
}
