"use client";

import { MapPin } from "lucide-react";
import type { Mentor, RecommendationReason } from "@/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { MatchReasons } from "@/components/ui/MatchReasons";

interface Props {
  person: Mentor;
  onView: (person: Mentor) => void;
  reasons?: RecommendationReason[];
  score?: number;
}

function contactSummary(p: Mentor): string {
  const c = p.contacts;
  const parts = [c?.email ? "Email" : null, c?.linkedin ? "LinkedIn" : null, c?.website ? "Website" : null, c?.social?.length ? "Social" : null].filter(Boolean);
  return parts.length ? parts.join(" · ") : "Contact details on their page";
}

export function PersonCard({ person: p, onView, reasons, score }: Props) {
  const place = [p.city, p.state].filter(Boolean).join(", ");
  return (
    <Card as="article" pillar="profession" interactive className="flex flex-col">
      <div className="flex items-start gap-3">
        <Avatar initials={p.initials} tone={p.avatarTone} size="md" />
        <div className="min-w-0 flex-1">
          <h3 className="text-[15px] font-semibold leading-snug text-brown">{p.name}</h3>
          <p className="text-sm text-brown-muted">
            {p.title} at <span className="font-medium text-brown">{p.company}</span>
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs font-medium text-brown">
        {p.culturalFit ? <Badge tone="profession">{p.culturalFit}</Badge> : null}
        {place ? (
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-terracotta" aria-hidden /> {place}
          </span>
        ) : null}
      </div>

      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-brown-muted">{p.fieldFit ?? p.bio}</p>

      <p className="mt-3 line-clamp-2 rounded-2xl bg-terracotta-soft px-3.5 py-2.5 text-sm italic text-terracotta-deep">“{p.openTo}”</p>

      <p className="mt-3 text-xs text-brown-faint">{contactSummary(p)}</p>

      {reasons?.length ? <MatchReasons reasons={reasons} score={score} className="mt-3" /> : null}

      <div className="mt-4 pt-1">
        <Button variant="profession" size="sm" onClick={() => onView(p)}>
          View profile
        </Button>
      </div>
    </Card>
  );
}
