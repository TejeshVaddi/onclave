"use client";

import { useMemo } from "react";
import { ShoppingBasket } from "lucide-react";
import { useUser } from "@/components/providers/AppStateProvider";
import { useAsyncData } from "@/lib/hooks";
import { searchPlaces } from "@/services/placeService";
import type { FoodPlaceCategory } from "@/types";
import { PlaceCard } from "@/components/cards/PlaceCard";
import { SkeletonGrid } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { heritageList } from "@/data/heritages";

/**
 * Locates real grocery stores and markets near the user that are likely to
 * carry this recipe's ingredients, by matching on heritage and sorting by
 * distance. Reuses the same Places dataset and service as "Food Near You" so
 * results stay in sync — no separate ingredient-sourcing data to maintain.
 */
export function IngredientsNearYou({ heritages }: { heritages: string[] }) {
  const user = useUser();
  const hasLocation = user.location.lat != null;

  const filters = useMemo(
    () => ({
      kind: "food" as const,
      categories: ["grocery", "market"] as FoodPlaceCategory[],
      heritages,
      near: user.location.lat != null ? { lat: user.location.lat, lng: user.location.lng! } : undefined,
      radiusMiles: 100,
    }),
    // `heritages` is the recipe's own array (from static data), stable for
    // the component's lifetime, so depending on it directly is safe here.
    [heritages, user.location.lat, user.location.lng],
  );

  // No minResults here: backfilling with a wrong-heritage grocery store just
  // to hit a count would misdirect someone shopping for this specific recipe.
  const { data, loading } = useAsyncData(() => searchPlaces(filters), JSON.stringify(filters));

  const results = (data?.items ?? []).slice(0, 3);

  return (
    <section className="mt-8 border-t border-beige pt-6">
      <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-brown-faint">
        <ShoppingBasket className="h-4 w-4" aria-hidden />
        Where to find these ingredients
      </h2>
      <p className="mt-1 text-sm text-brown-muted">
        {hasLocation
          ? `Grocery stores and markets near ${user.location.city} that are likely to carry ${heritageList(heritages)} ingredients.`
          : `Add your location in Profile to see nearby grocery stores that carry ${heritageList(heritages)} ingredients.`}
      </p>

      <div className="mt-4">
        {loading ? (
          <SkeletonGrid count={3} withCover />
        ) : results.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((p) => (
              <PlaceCard key={p.id} place={p} distanceMiles={p.distanceMiles} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<ShoppingBasket className="h-6 w-6" aria-hidden />}
            title="No matching grocery stores in range yet"
            description="Try browsing all Food Near You listings. This recipe's ingredients may still be available at a general international market."
            action={
              <Button variant="culture" size="sm" href="/culture?tab=food">
                Browse Food Near You
              </Button>
            }
          />
        )}
      </div>
    </section>
  );
}
