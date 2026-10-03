"use client";

import { Bookmark, BookmarkCheck, Clock, MapPin, Video } from "lucide-react";
import type { CulturalEvent, RecommendationReason } from "@/types";
import { Card } from "@/components/ui/Card";
import { Badge, Tag } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { MatchReasons } from "@/components/ui/MatchReasons";
import { eventCategoryLabel } from "@/services/eventService";
import { parseLocalDate, relativeDayLabel } from "@/lib/format";
import { cn } from "@/lib/utils";

interface Props {
  event: CulturalEvent;
  saved?: boolean;
  onToggleSave?: (id: string) => void;
  onLearnMore?: (event: CulturalEvent) => void;
  reasons?: RecommendationReason[];
  score?: number;
}

const ART_BG: Record<CulturalEvent["art"], string> = {
  berry: "bg-berry",
  terracotta: "bg-terracotta",
  green: "bg-green",
  gold: "bg-gold",
  clay: "bg-clay",
  olive: "bg-olive",
  plum: "bg-plum",
  sand: "bg-sand",
};

export function EventCard({ event: e, saved, onToggleSave, onLearnMore, reasons, score }: Props) {
  const d = parseLocalDate(e.date);
  const month = d.toLocaleDateString("en-US", { month: "short" });
  const day = d.getDate();
  const relative = relativeDayLabel(e.date);
  return (
    <Card as="article" pillar="culture" interactive className="flex flex-col">
      <div className="flex items-start gap-4">
        <div className={cn("flex h-16 w-14 shrink-0 flex-col items-center justify-center rounded-xl text-cream shadow-soft", ART_BG[e.art])} aria-hidden>
          <span className="text-[11px] font-bold uppercase tracking-wider opacity-90">{month}</span>
          <span className="text-2xl font-bold leading-none">{day}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge tone="culture">{eventCategoryLabel(e.category)}</Badge>
            <Badge tone={relative === "Today" || relative === "Tomorrow" || relative.startsWith("In ") ? "success" : "neutral"}>{relative}</Badge>
          </div>
          <h3 className="mt-1.5 text-[15px] font-semibold leading-snug text-brown">{e.name}</h3>
        </div>
        {onToggleSave ? (
          <button
            type="button"
            onClick={() => onToggleSave(e.id)}
            aria-pressed={saved}
            aria-label={saved ? `Remove ${e.name} from saved events` : `Save ${e.name}`}
            className={cn("-mr-1 -mt-1 rounded-full p-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-berry", saved ? "text-berry" : "text-brown-faint hover:bg-beige-soft hover:text-brown")}
          >
            {saved ? <BookmarkCheck className="h-5 w-5" aria-hidden /> : <Bookmark className="h-5 w-5" aria-hidden />}
          </button>
        ) : null}
      </div>

      <div className="mt-3 space-y-1 text-xs text-brown">
        {e.timeLabel ? (
          <p className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-berry" aria-hidden /> {e.timeLabel}
          </p>
        ) : null}
        <p className="flex items-center gap-1.5">
          {e.isVirtual ? <Video className="h-3.5 w-3.5 text-berry" aria-hidden /> : <MapPin className="h-3.5 w-3.5 text-berry" aria-hidden />}
          {e.isVirtual ? e.venue : `${e.venue} · ${e.city}, ${e.state}`}
        </p>
      </div>

      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-brown-muted">{e.description}</p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {e.tags.slice(0, 3).map((t) => (
          <Tag key={t}>{t}</Tag>
        ))}
        <Tag>{e.price}</Tag>
      </div>

      {reasons?.length ? <MatchReasons reasons={reasons} score={score} className="mt-3" /> : null}

      <div className="mt-4 flex flex-wrap gap-2 pt-1">
        <Button variant="culture" size="sm" onClick={() => onLearnMore?.(e)}>
          Learn More
        </Button>
      </div>
    </Card>
  );
}
