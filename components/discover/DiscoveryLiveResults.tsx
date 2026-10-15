"use client";

import { LiveResultsSection } from "@/components/ui/LiveResultsSection";
import { AiGeneratedSection } from "@/components/ui/AiGeneratedSection";
import type { DiscoveryResult, User } from "@/types";

/**
 * Fires one live-search call per pillar the query actually asked about
 * (community, food, places, events, recipes, mentor programs), reusing the
 * same intent AI Discovery already parsed from the sentence. Every result has
 * been confirmed to exist. Each section hides itself when there is nothing to
 * show, so this composes safely regardless of how many categories are relevant.
 *
 * Only recipes can be written by AI when none exists: a recipe is a set of
 * instructions. Communities, places, events, and people are never invented.
 */
export function DiscoveryLiveResults({ result, user }: { result: DiscoveryResult; user: User }) {
  const { intent, matched } = result;
  const heritages = intent.heritages;
  const city = user.location.city;
  const state = user.location.state ?? "";
  const query = intent.rawQuery;

  return (
    <div className="mt-8 space-y-4">
      {intent.wantsCommunity ? (
        <>
          <LiveResultsSection category="community" query={query} heritages={heritages} city={city} state={state} />
        </>
      ) : null}
      {intent.wantsFood ? (
        <>
          <LiveResultsSection category="food" query={query} heritages={heritages} city={city} state={state} />
        </>
      ) : null}
      {intent.wantsPlaces ? (
        <>
          <LiveResultsSection category="places" query={query} heritages={heritages} city={city} state={state} />
        </>
      ) : null}
      {intent.wantsEvents ? (
        <>
          <LiveResultsSection category="events" query={query} heritages={heritages} city={city} state={state} />
        </>
      ) : null}
      {intent.wantsRecipes ? (
        <>
          <LiveResultsSection category="recipe" query={query} heritages={heritages} city={city} state={state} />
          <AiGeneratedSection category="recipe" query={query} heritages={heritages} city={city} state={state} enabled={matched.hasSubject && !matched.recipes} />
        </>
      ) : null}
      {intent.wantsMentor ? (
        <>
          <LiveResultsSection category="mentorProgram" query={query} heritages={heritages} city={city} state={state} />
        </>
      ) : null}
    </div>
  );
}
