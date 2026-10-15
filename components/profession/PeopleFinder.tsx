"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Briefcase, ExternalLink, Loader2 } from "lucide-react";
import { useAppState } from "@/components/providers/AppStateProvider";
import { useLiveVersion } from "@/components/providers/LiveDataProvider";
import { PersonCard } from "@/components/cards/PersonCard";
import { PersonProfileModal } from "@/components/profession/PersonProfileModal";
import { PageHeader } from "@/components/layout/PageHeader";
import { SearchInput } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonGrid } from "@/components/ui/Skeleton";
import { liveStore } from "@/services/liveStore";
import { syncPeople, type PeopleOutcome } from "@/services/liveSync";
import { heritageList } from "@/data/heritages";
import { getProfession } from "@/data/professions";
import { orgsFor } from "@/data/professionalOrgs";
import type { Mentor } from "@/types";

/**
 * Real people to learn from, tailored to the field and background picked in
 * onboarding. Each one was found on a public page that shows they welcome
 * questions, and the server confirmed that page names them. This panel only
 * gives information and ways to reach out; it never sends anything.
 */
export function PeopleFinder() {
  const { user, hydrated } = useAppState();
  const live = useLiveVersion();
  const profession = user.profession ? getProfession(user.profession) : undefined;

  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [outcome, setOutcome] = useState<PeopleOutcome | null>(null);
  const [active, setActive] = useState<Mentor | null>(null);

  const run = useCallback(
    async (q: string, force: boolean) => {
      setSearching(true);
      setOutcome(await syncPeople(user, q, force));
      setSearching(false);
    },
    [user],
  );

  const profileKey = `${user.profession}|${user.heritages.join(",")}|${user.location.city}|${user.location.state}`;
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- starting the search is what this effect is for
    if (hydrated && user.onboardingComplete && profession) void run("", false);
    // Re-run only when the profile that shapes the search changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, profileKey]);

  const people = useMemo(() => {
    const mine = liveStore.people.filter((p) => !profession || p.profession === profession.id);
    // People whose page states a cultural connection come first.
    return [...mine].sort((a, b) => Number(Boolean(b.culturalFit)) - Number(Boolean(a.culturalFit)));
    // `live` changes whenever new verified people arrive.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live, profession?.id]);

  const orgs = profession ? orgsFor(profession.id, user.heritages, 4) : [];
  const heritageText = user.heritages.length ? heritageList(user.heritages) : "";

  return (
    <div>
      <PageHeader
        pillar="profession"
        title="Find someone who's been there."
        description={
          profession
            ? `Real people in ${profession.label}${heritageText ? `, with a look for ${heritageText} connections,` : ""} near ${user.location.city || "you"}, who say on a public page that they welcome questions. We only share information and ways to reach them.`
            : "Pick a field in your profile and we'll find real people in it who welcome questions."
        }
      />

      {!hydrated ? (
        <SkeletonGrid count={3} />
      ) : !profession ? (
        <EmptyState
          icon={<Briefcase className="h-6 w-6" aria-hidden />}
          title="Choose a field first"
          description="Your profile doesn't have a field yet. Add one and we'll look for people in it."
          action={
            <Button variant="profession" size="sm" href="/profile">
              Open profile
            </Button>
          }
        />
      ) : (
        <>
          <form
            className="flex flex-col gap-3 rounded-3xl border border-beige bg-white/40 p-4 sm:flex-row sm:items-center md:p-5"
            onSubmit={(e) => {
              e.preventDefault();
              void run(query, true);
            }}
          >
            <div className="flex-1">
              <SearchInput value={query} onChange={setQuery} placeholder="Narrow it down, like a specialty or employer" aria-label="Narrow the search" />
            </div>
            <Button type="submit" variant="profession" disabled={searching}>
              {searching ? "Searching…" : "Search"}
            </Button>
          </form>

          <p className="mt-5 text-sm text-brown-muted">
            {searching ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Searching public pages and checking each person…
              </span>
            ) : (
              `${people.length} ${people.length === 1 ? "person" : "people"} found`
            )}
          </p>

          <div className="mt-3">
            {searching && people.length === 0 ? (
              <SkeletonGrid count={3} />
            ) : people.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {people.map((p) => (
                  <PersonCard key={p.id} person={p} onView={setActive} />
                ))}
              </div>
            ) : outcome && !outcome.configured ? (
              <EmptyState icon={<Briefcase className="h-6 w-6" aria-hidden />} title="Search isn't connected yet" description="This site needs its search API key before it can look for people. The site owner can add it in the hosting settings." />
            ) : (
              <EmptyState
                icon={<Briefcase className="h-6 w-6" aria-hidden />}
                title="No one turned up yet"
                description={outcome?.error ?? `No one in ${profession.label} with a public mentoring or office-hours page was confirmed for that search. Try a broader search.`}
                action={
                  <Button variant="profession" size="sm" onClick={() => void run(query, true)}>
                    Search again
                  </Button>
                }
              />
            )}
          </div>

          {orgs.length ? (
            <section className="mt-10 border-t border-beige pt-6">
              <h2 className="text-xs font-bold uppercase tracking-wide text-brown-faint">Professional associations</h2>
              <p className="mt-1 text-sm text-brown-muted">Groups with local chapters and mentoring programs in {profession.label}.</p>
              <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {orgs.map((o) => (
                  <Card key={o.url} as="article" pillar="profession" interactive className="flex flex-col">
                    <h3 className="text-[15px] font-semibold leading-snug text-brown">{o.name}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-brown-muted">{o.blurb}</p>
                    <div className="mt-4 pt-1">
                      <Button variant="outline" size="sm" href={o.url} external iconRight={<ExternalLink className="h-3.5 w-3.5" aria-hidden />}>
                        Visit website
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          ) : null}
        </>
      )}

      <PersonProfileModal person={active} open={!!active} onClose={() => setActive(null)} />
    </div>
  );
}
