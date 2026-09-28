"use client";

import { useMemo, useState } from "react";
import { CalendarDays } from "lucide-react";
import { useAppState } from "@/components/providers/AppStateProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { useAsyncData, useDebouncedValue } from "@/lib/hooks";
import { EventCard } from "@/components/cards/EventCard";
import { EventDetailModal } from "./EventDetailModal";
import { SearchInput } from "@/components/ui/Input";
import { Chip, ChipRow } from "@/components/ui/Chip";
import { Segmented } from "@/components/ui/Segmented";
import { Button } from "@/components/ui/Button";
import { SkeletonGrid } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { BackfillNote } from "@/components/ui/BackfillNote";
import { DetectedSignals } from "@/components/ui/DetectedSignals";
import { LiveResultsSection } from "@/components/ui/LiveResultsSection";
import { EVENT_CATEGORIES, searchEvents } from "@/services/eventService";
import { parseFreeText } from "@/services/smartSearch";
import { toggleIn } from "@/lib/hooks";
import { uniq } from "@/lib/utils";
import type { CulturalEvent, EventCategory, Timeframe } from "@/types";

export function EventsList() {
  const { user, savedEventIds, toggleSavedEvent } = useAppState();
  const { toast } = useToast();

  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 200);
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [timeframe, setTimeframe] = useState<"all" | "today" | "weekend" | "week" | "month">("all");
  const [active, setActive] = useState<CulturalEvent | null>(null);

  const signals = useMemo(() => parseFreeText(debouncedQuery), [debouncedQuery]);
  // Heritage already comes from onboarding — the search bar only needs to
  // layer in whatever heritage the text itself mentions.
  const effectiveHeritages = useMemo(() => uniq([...user.heritages, ...signals.heritages]), [user.heritages, signals.heritages]);
  const effectiveCategories = useMemo(
    () => uniq([...categories, ...signals.eventCategories]) as EventCategory[],
    [categories, signals.eventCategories],
  );
  // The segmented control wins when the person has explicitly picked a
  // timeframe; a timeframe phrase typed in search only applies while it's
  // still on "All upcoming".
  const effectiveTimeframe: Timeframe = timeframe !== "all" ? timeframe : signals.timeframe;
  const queryHandledStructurally =
    signals.heritages.length > 0 || (timeframe === "all" && signals.timeframe !== null) || signals.eventCategories.length > 0;

  const filters = useMemo(
    () => ({
      query: queryHandledStructurally ? undefined : debouncedQuery,
      heritages: effectiveHeritages.length ? effectiveHeritages : undefined,
      categories: effectiveCategories.length ? effectiveCategories : undefined,
      timeframe: effectiveTimeframe,
      near: user.location.lat != null ? { lat: user.location.lat, lng: user.location.lng! } : undefined,
      radiusMiles: 100,
    }),
    [debouncedQuery, queryHandledStructurally, effectiveHeritages, effectiveCategories, effectiveTimeframe, user.location.lat, user.location.lng],
  );
  const { data, loading } = useAsyncData(() => searchEvents(filters, 5), JSON.stringify(filters), { keepPrevious: true });
  const events = data?.items ?? [];

  // Don't show a "This weekend" chip if the segmented control already
  // overrides it with an explicit choice — only surface what's actually applied.
  const displaySignals = timeframe !== "all" ? { ...signals, timeframe: null } : signals;

  function handleSave(id: string) {
    const nowSaved = toggleSavedEvent(id);
    toast({ title: nowSaved ? "Event saved" : "Removed from saved events", pillar: "culture", variant: nowSaved ? "success" : "info" });
  }

  function clearAll() {
    setQuery("");
    setCategories([]);
    setTimeframe("all");
  }

  return (
    <div>
      <div className="space-y-4 rounded-3xl border border-beige bg-white/40 p-4 md:p-5">
        <SearchInput value={query} onChange={setQuery} placeholder="Search festivals, workshops, performances…" aria-label="Search events" />
        <DetectedSignals signals={displaySignals} />
        <Segmented
          label="Timeframe"
          value={timeframe}
          onChange={setTimeframe}
          options={[
            { id: "all", label: "All upcoming" },
            { id: "today", label: "Today" },
            { id: "weekend", label: "This weekend" },
            { id: "week", label: "This week" },
            { id: "month", label: "This month" },
          ]}
          className="flex-wrap"
        />
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-brown-faint">Category</p>
          <ChipRow>
            {EVENT_CATEGORIES.map((c) => (
              <Chip key={c.id} size="sm" pillar="culture" selected={categories.includes(c.id)} onClick={() => setCategories((prev) => toggleIn(prev, c.id) as EventCategory[])}>
                {c.label}
              </Chip>
            ))}
          </ChipRow>
        </div>
      </div>

      <p className="mt-5 text-sm text-brown-muted">{loading ? "Searching…" : `${events.length} upcoming events`}</p>

      {!loading && data?.backfilled ? <BackfillNote exactCount={data.exactCount} outsideRadius={data.outsideRadius} className="mt-3" /> : null}

      <div className="mt-3">
        {loading ? (
          <SkeletonGrid count={6} />
        ) : events.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {events.map((e) => (
              <EventCard key={e.id} event={e} saved={savedEventIds.includes(e.id)} onToggleSave={handleSave} onLearnMore={setActive} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<CalendarDays className="h-6 w-6" aria-hidden />}
            title="No events match those filters"
            description="Try a wider timeframe or clear your filters."
            action={
              <Button variant="culture" size="sm" onClick={clearAll}>
                Clear filters
              </Button>
            }
          />
        )}
      </div>

      <LiveResultsSection category="events" query={debouncedQuery} heritages={effectiveHeritages} city={user.location.city} state={user.location.state ?? ""} />

      <EventDetailModal event={active} open={!!active} onClose={() => setActive(null)} saved={active ? savedEventIds.includes(active.id) : false} onToggleSave={handleSave} />
    </div>
  );
}
