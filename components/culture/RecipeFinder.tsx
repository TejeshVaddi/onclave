"use client";

import { useMemo, useState } from "react";
import { ChefHat } from "lucide-react";
import { useAppState } from "@/components/providers/AppStateProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { useAsyncData, useDebouncedValue } from "@/lib/hooks";
import { RecipeCard } from "@/components/cards/RecipeCard";
import { SearchInput } from "@/components/ui/Input";
import { Chip, ChipRow } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { SkeletonGrid } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { BackfillNote } from "@/components/ui/BackfillNote";
import { DetectedSignals } from "@/components/ui/DetectedSignals";
import { LiveResultsSection } from "@/components/ui/LiveResultsSection";
import { DIFFICULTIES, searchRecipes, type RecipeFilters } from "@/services/recipeService";
import { parseFreeText } from "@/services/smartSearch";
import { toggleIn } from "@/lib/hooks";
import { uniq } from "@/lib/utils";
import type { Difficulty } from "@/types";

export function RecipeFinder() {
  const { user, savedRecipeIds, toggleSavedRecipe } = useAppState();
  const { toast } = useToast();

  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 200);
  const [difficulty, setDifficulty] = useState<Difficulty[]>([]);

  const signals = useMemo(() => parseFreeText(debouncedQuery), [debouncedQuery]);
  // Heritage already comes from onboarding — the search bar only needs to
  // layer in whatever heritage the text itself mentions.
  const effectiveHeritages = useMemo(() => uniq([...user.heritages, ...signals.heritages]), [user.heritages, signals.heritages]);
  const queryHandledStructurally = signals.heritages.length > 0 || signals.dietary.length > 0;

  const filters: RecipeFilters = useMemo(
    () => ({
      query: queryHandledStructurally ? undefined : debouncedQuery,
      heritages: effectiveHeritages.length ? effectiveHeritages : undefined,
      difficulty: difficulty.length ? difficulty : undefined,
      dietary: signals.dietary.length ? signals.dietary : undefined,
    }),
    [debouncedQuery, queryHandledStructurally, effectiveHeritages, difficulty, signals.dietary],
  );
  const { data, loading } = useAsyncData(() => searchRecipes(filters, 5), JSON.stringify(filters), { keepPrevious: true });
  const recipes = data?.items ?? [];

  function handleSave(id: string) {
    const nowSaved = toggleSavedRecipe(id);
    toast({ title: nowSaved ? "Saved recipe" : "Removed from saved recipes", pillar: "culture", variant: nowSaved ? "success" : "info" });
  }

  function clearAll() {
    setQuery("");
    setDifficulty([]);
  }

  return (
    <div>
      <div className="space-y-4 rounded-3xl border border-beige bg-white/40 p-4 md:p-5">
        <SearchInput value={query} onChange={setQuery} placeholder="Search recipes" aria-label="Search recipes" />
        <DetectedSignals signals={signals} />
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-brown-faint">Difficulty</p>
          <ChipRow>
            {DIFFICULTIES.map((d) => (
              <Chip key={d.id} size="sm" pillar="culture" selected={difficulty.includes(d.id)} onClick={() => setDifficulty((prev) => toggleIn(prev, d.id) as Difficulty[])}>
                {d.label}
              </Chip>
            ))}
          </ChipRow>
        </div>
      </div>

      <p className="mt-5 text-sm text-brown-muted">{loading ? "Searching…" : `${recipes.length} recipes found`}</p>

      {!loading && data?.backfilled ? <BackfillNote exactCount={data.exactCount} className="mt-3" /> : null}

      <div className="mt-3">
        {loading ? (
          <SkeletonGrid count={6} withCover />
        ) : recipes.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {recipes.map((r) => (
              <RecipeCard key={r.id} recipe={r} saved={savedRecipeIds.includes(r.id)} onToggleSave={handleSave} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<ChefHat className="h-6 w-6" aria-hidden />}
            title="No recipes match those filters"
            description="Try a different difficulty or clear your filters."
            action={
              <Button variant="culture" size="sm" onClick={clearAll}>
                Clear filters
              </Button>
            }
          />
        )}
      </div>

      <LiveResultsSection category="recipe" query={debouncedQuery} heritages={effectiveHeritages} city={user.location.city} state={user.location.state ?? ""} />
    </div>
  );
}
