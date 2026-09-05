"use client";

import { useMemo, useState } from "react";
import { Briefcase } from "lucide-react";
import { useAppState } from "@/components/providers/AppStateProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { useAsyncData, useDebouncedValue } from "@/lib/hooks";
import { MentorCard } from "@/components/cards/MentorCard";
import { ConnectionRequestModal } from "./ConnectionRequestModal";
import { PageHeader } from "@/components/layout/PageHeader";
import { SearchInput } from "@/components/ui/Input";
import { Chip, ChipRow } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { SkeletonGrid } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { DemoNote } from "@/components/ui/DemoNote";
import { BackfillNote } from "@/components/ui/BackfillNote";
import { DetectedSignals } from "@/components/ui/DetectedSignals";
import { LiveResultsSection } from "@/components/ui/LiveResultsSection";
import { EXPERIENCE_BANDS, searchMentors, type MentorFilters } from "@/services/mentorService";
import { parseFreeText } from "@/services/smartSearch";
import { HERITAGES } from "@/data/heritages";
import { PROFESSIONS } from "@/data/professions";
import { toggleIn } from "@/lib/hooks";
import { uniq } from "@/lib/utils";
import type { Mentor } from "@/types";

export function MentorFinder() {
  const { user, requestConnection, hasRequested } = useAppState();
  const { toast } = useToast();

  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 200);
  const [heritages, setHeritages] = useState<string[]>(user.heritages);
  const [professions, setProfessions] = useState<string[]>(user.profession ? [user.profession] : []);
  const [experienceBand, setExperienceBand] = useState<string | null>(null);
  const [activeMentor, setActiveMentor] = useState<Mentor | null>(null);

  const band = EXPERIENCE_BANDS.find((b) => b.id === experienceBand);

  const signals = useMemo(() => parseFreeText(debouncedQuery), [debouncedQuery]);
  const effectiveHeritages = useMemo(() => uniq([...heritages, ...signals.heritages]), [heritages, signals.heritages]);
  const effectiveProfessions = useMemo(() => uniq([...professions, ...signals.professions]), [professions, signals.professions]);
  const queryHandledStructurally = signals.heritages.length > 0 || signals.professions.length > 0;

  const filters: MentorFilters = useMemo(
    () => ({
      query: queryHandledStructurally ? undefined : debouncedQuery,
      heritages: effectiveHeritages.length ? effectiveHeritages : undefined,
      professions: effectiveProfessions.length ? effectiveProfessions : undefined,
      minExperience: band?.min,
      maxExperience: band?.max,
      near: user.location.lat != null ? { lat: user.location.lat, lng: user.location.lng! } : undefined,
      radiusMiles: 150,
    }),
    [debouncedQuery, queryHandledStructurally, effectiveHeritages, effectiveProfessions, band, user.location.lat, user.location.lng],
  );
  const { data, loading } = useAsyncData(() => searchMentors(filters, 5), JSON.stringify(filters), { keepPrevious: true });
  const mentors = data?.items ?? [];

  function clearAll() {
    setQuery("");
    setHeritages([]);
    setProfessions([]);
    setExperienceBand(null);
  }

  function handleSend(mentorId: string, message: string) {
    requestConnection(mentorId, message);
    const mentor = mentors.find((m) => m.id === mentorId);
    toast({ title: "Connection request sent", description: mentor ? `${mentor.name} will see your message.` : undefined, pillar: "profession" });
    setActiveMentor(null);
  }

  return (
    <div>
      <PageHeader
        pillar="profession"
        title="Find someone who's been there."
        description="Browse mentors who share your background or field. This is about human connection and guidance, not job listings."
      />

      <div className="space-y-4 rounded-3xl border border-beige bg-white/40 p-4 md:p-5">
        <SearchInput value={query} onChange={setQuery} placeholder="Search mentors, e.g. “Ethiopian doctor” or a name" aria-label="Search mentors" />
        <DetectedSignals signals={signals} />
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-brown-faint">Profession</p>
          <ChipRow>
            {PROFESSIONS.map((p) => (
              <Chip key={p.id} size="sm" pillar="profession" selected={professions.includes(p.id)} onClick={() => setProfessions((prev) => toggleIn(prev, p.id))}>
                {p.label}
              </Chip>
            ))}
          </ChipRow>
        </div>
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-brown-faint">Heritage</p>
          <ChipRow>
            {HERITAGES.slice(0, 12).map((h) => (
              <Chip key={h.id} size="sm" pillar="profession" selected={heritages.includes(h.id)} onClick={() => setHeritages((prev) => toggleIn(prev, h.id))}>
                {h.label}
              </Chip>
            ))}
          </ChipRow>
        </div>
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-brown-faint">Experience</p>
          <ChipRow>
            {EXPERIENCE_BANDS.map((b) => (
              <Chip key={b.id} size="sm" pillar="profession" selected={experienceBand === b.id} onClick={() => setExperienceBand((prev) => (prev === b.id ? null : b.id))}>
                {b.label}
              </Chip>
            ))}
          </ChipRow>
        </div>
      </div>

      <p className="mt-5 text-sm text-brown-muted">{loading ? "Searching…" : `${mentors.length} mentors found`}</p>

      {!loading && data?.backfilled ? <BackfillNote exactCount={data.exactCount} outsideRadius={data.outsideRadius} className="mt-3" /> : null}

      <div className="mt-3">
        {loading ? (
          <SkeletonGrid count={6} />
        ) : mentors.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {mentors.map((m) => (
              <MentorCard key={m.id} mentor={m} requested={hasRequested(m.id)} onRequest={setActiveMentor} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Briefcase className="h-6 w-6" aria-hidden />}
            title="No mentors match those filters"
            description="Try a different profession or clear your filters."
            action={
              <Button variant="profession" size="sm" onClick={clearAll}>
                Clear filters
              </Button>
            }
          />
        )}
      </div>

      <LiveResultsSection category="mentorProgram" query={debouncedQuery} heritages={effectiveHeritages} city={user.location.city} state={user.location.state ?? ""} />

      <ConnectionRequestModal mentor={activeMentor} open={!!activeMentor} onClose={() => setActiveMentor(null)} onSend={handleSend} />

      <DemoNote className="mt-6">
        Mentor profiles here are illustrative demo entries created for this prototype, not real user sign-ups. A production version would source verified mentors through applications and partner organizations.
      </DemoNote>
    </div>
  );
}
