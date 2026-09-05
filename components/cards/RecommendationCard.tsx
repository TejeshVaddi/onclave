"use client";

import Link from "next/link";
import { ArrowUpRight, Briefcase, CalendarDays, ChefHat, Landmark, MapPin, Users } from "lucide-react";
import type { Community, CulturalEvent, Mentor, Place, Recipe, Recommendation } from "@/types";
import { MatchReasons } from "@/components/ui/MatchReasons";
import { PILLARS } from "@/lib/pillars";
import { formatEventDate } from "@/lib/format";
import { placeMapUrl } from "@/services/placeService";
import { cn } from "@/lib/utils";

const KIND_META = {
  community: { label: "Community", icon: Users },
  recipe: { label: "Recipe", icon: ChefHat },
  "food-place": { label: "Food near you", icon: MapPin },
  "cultural-place": { label: "Cultural place", icon: Landmark },
  event: { label: "Event", icon: CalendarDays },
  mentor: { label: "Mentor", icon: Briefcase },
} as const;

function describe(rec: Recommendation): { title: string; subtitle: string; href: string; external: boolean; cta: string } {
  switch (rec.kind) {
    case "community": {
      const c = rec.item as Community;
      return { title: c.name, subtitle: `${c.locationLabel} · ${c.tags.slice(0, 2).join(", ")}`, href: "/community", external: false, cta: "Explore communities" };
    }
    case "recipe": {
      const r = rec.item as Recipe;
      return { title: r.name, subtitle: r.description, href: `/culture/recipes/${r.id}`, external: false, cta: "View recipe" };
    }
    case "food-place":
    case "cultural-place": {
      const p = rec.item as Place;
      return { title: p.name, subtitle: `${p.city}, ${p.state} · ${p.description}`, href: placeMapUrl(p), external: true, cta: "View location" };
    }
    case "event": {
      const e = rec.item as CulturalEvent;
      return { title: e.name, subtitle: `${formatEventDate(e.date, { weekday: true })} · ${e.isVirtual ? "Online" : `${e.city}, ${e.state}`}`, href: "/culture?tab=events", external: false, cta: "See events" };
    }
    case "mentor": {
      const m = rec.item as Mentor;
      return { title: m.name, subtitle: `${m.title} at ${m.company} · ${m.heritageLabel}`, href: `/profession/${m.id}`, external: false, cta: "View profile" };
    }
  }
}

export function RecommendationCard({ rec, className }: { rec: Recommendation; className?: string }) {
  const meta = KIND_META[rec.kind];
  const pillar = PILLARS[rec.pillar];
  const Icon = meta.icon;
  const { title, subtitle, href, external, cta } = describe(rec);

  const inner = (
    <>
      <div className="flex items-center justify-between gap-2">
        <span className={cn("inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em]", pillar.text)}>
          <Icon className="h-3.5 w-3.5" aria-hidden />
          {meta.label}
        </span>
        <ArrowUpRight className="h-4 w-4 text-brown-faint transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brown" aria-hidden />
      </div>
      <h3 className="mt-2 line-clamp-2 text-[15px] font-semibold leading-snug text-brown">{title}</h3>
      <p className="mt-1 line-clamp-2 text-sm text-brown-muted">{subtitle}</p>
      <MatchReasons reasons={rec.reasons} score={rec.score} max={2} className="mt-3" />
      <span className={cn("mt-3 inline-block text-xs font-semibold", pillar.text)}>{cta}</span>
    </>
  );

  const classes = cn(
    "group relative flex flex-col rounded-2xl border border-beige/80 bg-white/55 p-4 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-beige-deep hover:shadow-lift",
    "before:absolute before:inset-y-4 before:left-0 before:w-1 before:rounded-r-full before:content-['']",
    rec.pillar === "community" ? "before:bg-green" : rec.pillar === "culture" ? "before:bg-berry" : "before:bg-terracotta",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brown",
    className,
  );

  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
      {inner}
    </a>
  ) : (
    <Link href={href} className={classes}>
      {inner}
    </Link>
  );
}
