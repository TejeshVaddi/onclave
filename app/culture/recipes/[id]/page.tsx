import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ChefHat, Clock, Users2, UtensilsCrossed } from "lucide-react";
import { RECIPES } from "@/data/recipes";
import { getRecipe } from "@/services/recipeService";
import { heritageLabel } from "@/data/heritages";
import { formatMinutes } from "@/lib/format";
import { Badge, Tag } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CoverArt } from "@/components/ui/CoverArt";
import { DemoNote } from "@/components/ui/DemoNote";
import { IngredientsNearYou } from "@/components/culture/IngredientsNearYou";
import { getRecipeDetail } from "@/data/recipeDetails";

export function generateStaticParams() {
  return RECIPES.map((r) => ({ id: r.id }));
}

export async function generateMetadata({ params }: PageProps<"/culture/recipes/[id]">): Promise<Metadata> {
  const { id } = await params;
  const recipe = await getRecipe(id);
  return { title: recipe ? recipe.name : "Recipe" };
}

const DIFFICULTY_LABEL = { easy: "Easy", medium: "Medium", hard: "Advanced" } as const;

export default async function RecipeDetailPage({ params }: PageProps<"/culture/recipes/[id]">) {
  const { id } = await params;
  const recipe = await getRecipe(id);
  if (!recipe) notFound();

  // Full recipe when we have one; the short preview is only a safety net.
  const detail = getRecipeDetail(recipe.id);
  const ingredients = detail?.ingredients ?? recipe.ingredientsPreview;
  const steps = detail?.steps ?? recipe.stepsPreview;

  return (
    <div className="mx-auto max-w-3xl animate-fade-up">
      <Link href="/culture?tab=recipes" className="inline-flex items-center gap-1.5 text-sm font-medium text-brown-muted hover:text-brown">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to recipes
      </Link>

      <div className="mt-4 overflow-hidden rounded-3xl border border-beige bg-white/50 shadow-soft">
        <CoverArt tone={recipe.art} className="h-48 sm:h-64" icon={<UtensilsCrossed className="h-14 w-14" />} />
        <div className="p-6 md:p-8">
          <Badge tone="culture">{heritageLabel(recipe.cuisine)} cuisine</Badge>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-brown md:text-3xl">{recipe.name}</h1>
          <p className="mt-3 text-[15px] leading-relaxed text-brown-muted">{recipe.description}</p>

          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 border-y border-beige py-4 text-sm">
            <span className="inline-flex items-center gap-2 font-medium text-brown">
              <ChefHat className="h-4 w-4 text-berry" aria-hidden /> {DIFFICULTY_LABEL[recipe.difficulty]}
            </span>
            <span className="inline-flex items-center gap-2 font-medium text-brown">
              <Clock className="h-4 w-4 text-berry" aria-hidden /> {formatMinutes(recipe.timeMinutes)}
            </span>
            <span className="inline-flex items-center gap-2 font-medium text-brown">
              <Users2 className="h-4 w-4 text-berry" aria-hidden /> Serves {recipe.servings}
            </span>
          </div>

          {recipe.dietary.length ? (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {recipe.dietary.map((d) => (
                <Tag key={d}>{d}</Tag>
              ))}
              {recipe.occasion ? <Tag>{recipe.occasion}</Tag> : null}
            </div>
          ) : null}

          <div className="mt-6 grid gap-8 sm:grid-cols-5">
            <div className="sm:col-span-2">
              <h2 className="text-sm font-bold uppercase tracking-wide text-brown-faint">Ingredients</h2>
              <p className="mt-1 text-xs text-brown-faint">For {recipe.servings} servings</p>
              <ul className="mt-3 space-y-2 text-sm text-brown">
                {ingredients.map((ing) => (
                  <li key={ing} className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-berry" aria-hidden />
                    {ing}
                  </li>
                ))}
              </ul>
            </div>
            <div className="sm:col-span-3">
              <h2 className="text-sm font-bold uppercase tracking-wide text-brown-faint">Instructions</h2>
              <ol className="mt-3 space-y-3 text-sm leading-relaxed text-brown">
                {steps.map((step, i) => (
                  <li key={step} className="flex gap-2.5">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-berry-soft text-[11px] font-bold text-berry-deep">{i + 1}</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <IngredientsNearYou heritages={recipe.heritages} />

          <p className="mt-6 text-xs text-brown-faint">Source: {recipe.sourceName}</p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Button variant="outline" href="/culture?tab=recipes">
              Browse more recipes
            </Button>
          </div>

          <DemoNote className="mt-6">
            Recipes are original write-ups for the Onclave demo, scaled to the serving count shown. Adjust seasoning to taste, and always cook meat, poultry, and fish to a safe internal temperature.
          </DemoNote>
        </div>
      </div>
    </div>
  );
}
