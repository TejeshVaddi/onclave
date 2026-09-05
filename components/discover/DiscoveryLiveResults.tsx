"use client";

import { LiveResultsSection } from "@/components/ui/LiveResultsSection";
import { AiGeneratedSection } from "@/components/ui/AiGeneratedSection";
import type { DiscoveryResult, User } from "@/types";

/**
 * Fires one Gemini live-search call per pillar the query actually asked
 * about (community, food, places, events, recipes, mentor programs), reusing
 * the same intent AI Discovery already parsed from the sentence. Each
 * section independently hides itself when there's nothing to show, so this
 * composes safely regardless of how many categories are relevant.
 *
 * Below each live-search section, an AiGeneratedSection offers a synthesized
 * example (a full recipe; plain guidance for the others) — but only when
 * `matched` says the literal subject of the query wasn't found locally, so
 * it never appears as unnecessary noise next to a real match.
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
          <AiGeneratedSection category="community" query={query} heritages={heritages} city={city} state={state} enabled={matched.hasSubject && !matched.community} />
        </>
      ) : null}
      {intent.wantsFood ? (
        <>
          <LiveResultsSection category="food" query={query} heritages={heritages} city={city} state={state} />
          <AiGeneratedSection category="food" query={query} heritages={heritages} city={city} state={state} enabled={matched.hasSubject && !matched.food} />
        </>
      ) : null}
      {intent.wantsPlaces ? (
        <>
          <LiveResultsSection category="places" query={query} heritages={heritages} city={city} state={state} />
          <AiGeneratedSection category="places" query={query} heritages={heritages} city={city} state={state} enabled={matched.hasSubject && !matched.places} />
        </>
      ) : null}
      {intent.wantsEvents ? (
        <>
          <LiveResultsSection category="events" query={query} heritages={heritages} city={city} state={state} />
          <AiGeneratedSection category="events" query={query} heritages={heritages} city={city} state={state} enabled={matched.hasSubject && !matched.events} />
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
          <AiGeneratedSection category="mentorProgram" query={query} heritages={heritages} city={city} state={state} enabled={matched.hasSubject && !matched.mentor} />
        </>
      ) : null}
    </div>
  );
}
