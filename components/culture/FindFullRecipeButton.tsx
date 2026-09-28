"use client";

import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ResolveLinkButton } from "@/components/ui/ResolveLinkButton";
import { recipeSearchUrl } from "@/services/recipeService";
import type { Recipe } from "@/types";

/** A real, known source — link straight there. */
export function FindFullRecipeButton({ recipe }: { recipe: Recipe }) {
  if (recipe.sourceUrl) {
    return (
      <Button variant="culture" href={recipe.sourceUrl} external iconRight={<ExternalLink className="h-4 w-4" aria-hidden />}>
        View full recipe
      </Button>
    );
  }

  return (
    <ResolveLinkButton
      category="recipe"
      query={recipe.name}
      heritages={recipe.heritages}
      fallbackUrl={recipeSearchUrl(recipe)}
      label="Find the full recipe"
      loadingLabel="Finding the recipe…"
      icon={<ExternalLink className="h-4 w-4" aria-hidden />}
    />
  );
}
