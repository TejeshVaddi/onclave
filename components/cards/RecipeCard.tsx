"use client";

import { ChefHat, Clock, Heart, UtensilsCrossed } from "lucide-react";
import type { Recipe, RecommendationReason } from "@/types";
import { Card } from "@/components/ui/Card";
import { Badge, Tag } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CoverArt } from "@/components/ui/CoverArt";
import { MatchReasons } from "@/components/ui/MatchReasons";
import { heritageLabel } from "@/data/heritages";
import { formatMinutes } from "@/lib/format";
import { cn } from "@/lib/utils";

const DIFFICULTY_LABEL = { easy: "Easy", medium: "Medium", hard: "Advanced" } as const;

interface Props {
  recipe: Recipe;
  saved?: boolean;
  onToggleSave?: (id: string) => void;
  reasons?: RecommendationReason[];
  score?: number;
}

export function RecipeCard({ recipe: r, saved, onToggleSave, reasons, score }: Props) {
  return (
    <Card as="article" pillar="culture" interactive padded={false} className="flex flex-col">
      <CoverArt tone={r.art} className="h-36" icon={<UtensilsCrossed className="h-9 w-9" />} />
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Badge tone="culture" className="mb-2">
              {heritageLabel(r.cuisine)} cuisine
            </Badge>
            <h3 className="text-[15px] font-semibold leading-snug text-brown">{r.name}</h3>
          </div>
          {onToggleSave ? (
            <button
              type="button"
              onClick={() => onToggleSave(r.id)}
              aria-pressed={saved}
              aria-label={saved ? `Remove ${r.name} from saved recipes` : `Save ${r.name}`}
              className={cn("-mr-1 -mt-1 rounded-full p-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-berry", saved ? "text-berry" : "text-brown-faint hover:bg-beige-soft hover:text-brown")}
            >
              <Heart className={cn("h-5 w-5", saved && "fill-current")} aria-hidden />
            </button>
          ) : null}
        </div>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-brown-muted">{r.description}</p>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-brown">
          <span className="inline-flex items-center gap-1">
            <ChefHat className="h-3.5 w-3.5 text-berry" aria-hidden /> {DIFFICULTY_LABEL[r.difficulty]}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-berry" aria-hidden /> {formatMinutes(r.timeMinutes)}
          </span>
          {r.dietary.slice(0, 1).map((d) => (
            <Tag key={d}>{d}</Tag>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-brown-faint">Source: {r.sourceName}</p>
        {reasons?.length ? <MatchReasons reasons={reasons} score={score} className="mt-3" /> : null}
        <div className="mt-4 pt-1">
          <Button variant="culture" size="sm" href={`/culture/recipes/${r.id}`}>
            View Recipe
          </Button>
        </div>
      </div>
    </Card>
  );
}
