"use client";

import { useState } from "react";
import { Bookmark, BookmarkCheck, Globe, MapPin } from "lucide-react";
import type { Community, RecommendationReason } from "@/types";
import { Card } from "@/components/ui/Card";
import { Badge, Tag } from "@/components/ui/Badge";
import { MatchReasons } from "@/components/ui/MatchReasons";
import { Button } from "@/components/ui/Button";
import { CommunityDetailModal } from "@/components/community/CommunityDetailModal";
import { CommunityLinkButton, hasDirectLink } from "@/components/community/CommunityLinkButton";
import { communityTypeLabel, platformLabel } from "@/services/communityService";
import { cn } from "@/lib/utils";

interface Props {
  community: Community;
  saved?: boolean;
  onToggleSave?: (id: string) => void;
  reasons?: RecommendationReason[];
  score?: number;
  compact?: boolean;
}

const PLATFORM_MONO: Record<Community["platform"], string> = {
  reddit: "R",
  facebook: "f",
  nextdoor: "N",
  discord: "D",
  meetup: "M",
  other: "•",
};

export function CommunityCard({ community: c, saved, onToggleSave, reasons, score, compact }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <Card as="article" pillar="community" interactive className={cn("flex flex-col", compact && "p-4")}>
      <div className="flex items-start gap-3">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-soft font-bold text-green-deep"
          aria-hidden
          title={platformLabel(c.platform)}
        >
          {PLATFORM_MONO[c.platform]}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug text-brown">{c.name}</h3>
          <p className="mt-0.5 text-xs text-brown-muted">
            Platform: <span className="font-semibold text-brown">{platformLabel(c.platform)}</span>
            {c.memberEstimate ? <span> · {c.memberEstimate}</span> : null}
          </p>
        </div>
        {onToggleSave ? (
          <button
            type="button"
            onClick={() => onToggleSave(c.id)}
            aria-pressed={saved}
            aria-label={saved ? `Remove ${c.name} from My Communities` : `Save ${c.name} to My Communities`}
            className={cn(
              "-mr-1 -mt-1 rounded-full p-2 transition",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green",
              saved ? "text-green" : "text-brown-faint hover:bg-beige-soft hover:text-brown",
            )}
          >
            {saved ? <BookmarkCheck className="h-5 w-5" aria-hidden /> : <Bookmark className="h-5 w-5" aria-hidden />}
          </button>
        ) : null}
      </div>

      <p className={cn("mt-3 text-sm leading-relaxed text-brown-muted", compact ? "line-clamp-2" : "line-clamp-3")}>“{c.description}”</p>

      <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-brown">
        {c.isOnline ? <Globe className="h-3.5 w-3.5 text-green" aria-hidden /> : <MapPin className="h-3.5 w-3.5 text-green" aria-hidden />}
        Location: {c.locationLabel}
      </p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <Badge tone="community">{communityTypeLabel(c.type)}</Badge>
        {c.tags.slice(0, compact ? 2 : 4).map((t) => (
          <Tag key={t}>{t}</Tag>
        ))}
      </div>

      {reasons?.length ? <MatchReasons reasons={reasons} score={score} className="mt-3" /> : null}

      <div className="mt-4 flex flex-wrap items-center gap-2 pt-1">
        <Button variant="community" size="sm" onClick={() => setOpen(true)}>
          Learn More
        </Button>
        {hasDirectLink(c) ? <CommunityLinkButton community={c} variant="outline" size="sm" /> : null}
      </div>
      <CommunityDetailModal community={c} open={open} onClose={() => setOpen(false)} />
    </Card>
  );
}
