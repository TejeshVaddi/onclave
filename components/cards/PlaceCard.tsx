"use client";

import Image from "next/image";
import { Church, ExternalLink, Landmark, MapPin, ShoppingBasket, Star, Store, UtensilsCrossed, Coffee, Croissant, Building2 } from "lucide-react";
import type { Place, RecommendationReason } from "@/types";
import { Card } from "@/components/ui/Card";
import { Badge, Tag } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CoverArt } from "@/components/ui/CoverArt";
import { MatchReasons } from "@/components/ui/MatchReasons";
import { placeCategoryLabel, placeMapUrl } from "@/services/placeService";
import { formatDistance } from "@/lib/geo";
import { cn } from "@/lib/utils";

const ICONS: Record<Place["category"], typeof MapPin> = {
  restaurant: UtensilsCrossed,
  grocery: ShoppingBasket,
  market: Store,
  bakery: Croissant,
  cafe: Coffee,
  temple: Landmark,
  mosque: Landmark,
  church: Church,
  "cultural-center": Building2,
  museum: Landmark,
  "heritage-site": MapPin,
  "community-center": Building2,
};

interface Props {
  place: Place;
  distanceMiles?: number | null;
  reasons?: RecommendationReason[];
  score?: number;
}

export function PlaceCard({ place: p, distanceMiles, reasons, score }: Props) {
  const Icon = ICONS[p.category] ?? MapPin;
  const coverClasses = "h-28 sm:h-auto sm:w-32 xl:h-32 xl:w-full";
  return (
    <Card as="article" pillar="culture" interactive padded={false} className="flex flex-col sm:flex-row sm:items-stretch xl:flex-col">
      {p.imageUrl ? (
        <div className={cn("relative shrink-0 overflow-hidden bg-beige", coverClasses)}>
          <Image src={p.imageUrl} alt="" fill sizes="(min-width: 1280px) 25vw, (min-width: 640px) 128px, 100vw" className="object-cover" unoptimized />
          <span className="absolute bottom-1.5 right-1.5 rounded-full bg-brown/70 px-1.5 py-0.5 text-[10px] font-semibold text-cream backdrop-blur-sm">
            Photo
          </span>
        </div>
      ) : (
        <CoverArt tone={p.art} pattern="weave" className={coverClasses} icon={<Icon className="h-8 w-8" />} />
      )}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="culture">{placeCategoryLabel(p.category)}</Badge>
          {typeof distanceMiles === "number" ? (
            <span className="text-xs font-semibold text-green">{formatDistance(distanceMiles)} away</span>
          ) : null}
          {p.rating ? (
            <span className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-brown">
              <Star className="h-3.5 w-3.5 fill-gold text-gold" aria-hidden />
              {p.rating.toFixed(1)}
              {p.reviewCount ? <span className="font-normal text-brown-faint">({p.reviewCount.toLocaleString()})</span> : null}
            </span>
          ) : null}
        </div>
        <h3 className="mt-2 text-[15px] font-semibold leading-snug text-brown">{p.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-brown-muted">{p.description}</p>
        <p className="mt-2 flex items-start gap-1.5 text-xs text-brown">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-berry" aria-hidden />
          {p.address}, {p.city}, {p.state}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {p.tags.slice(0, 3).map((t) => (
            <Tag key={t}>{t}</Tag>
          ))}
          {p.priceLevel ? <Tag>{"$".repeat(p.priceLevel)}</Tag> : null}
        </div>
        {reasons?.length ? <MatchReasons reasons={reasons} score={score} className="mt-3" /> : null}
        <div className="mt-4 pt-1">
          <Button variant="culture" size="sm" href={placeMapUrl(p)} external iconRight={<ExternalLink className="h-3.5 w-3.5" aria-hidden />}>
            View Location
          </Button>
        </div>
      </div>
    </Card>
  );
}
