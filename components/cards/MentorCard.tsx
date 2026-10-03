"use client";

import { Briefcase, CheckCircle2, MapPin } from "lucide-react";
import type { Mentor, RecommendationReason } from "@/types";
import { Card } from "@/components/ui/Card";
import { Badge, Tag } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { MatchReasons } from "@/components/ui/MatchReasons";
import { availabilityLabel } from "@/services/mentorService";

interface Props {
  mentor: Mentor;
  requested?: boolean;
  onRequest?: (mentor: Mentor) => void;
  reasons?: RecommendationReason[];
  score?: number;
}

export function MentorCard({ mentor: m, requested, onRequest, reasons, score }: Props) {
  return (
    <Card as="article" pillar="profession" interactive className="flex flex-col">
      <div className="flex items-start gap-3">
        <Avatar initials={m.initials} tone={m.avatarTone} size="md" />
        <div className="min-w-0 flex-1">
          <h3 className="text-[15px] font-semibold leading-snug text-brown">{m.name}</h3>
          <p className="text-sm text-brown-muted">
            {m.title} at <span className="font-medium text-brown">{m.company}</span>
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-brown">
        <Badge tone="profession">{m.heritageLabel}</Badge>
        <span className="inline-flex items-center gap-1">
          <Briefcase className="h-3.5 w-3.5 text-terracotta" aria-hidden /> {m.yearsExperience} years experience
        </span>
        <span className="inline-flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5 text-terracotta" aria-hidden /> {m.city}, {m.state}
        </span>
      </div>

      <div className="mt-3">
        <p className="text-[11px] font-bold uppercase tracking-wider text-brown-faint">Specialties</p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {m.mentorsIn.slice(0, 3).map((s) => (
            <Tag key={s}>{s}</Tag>
          ))}
        </div>
      </div>

      <p className="mt-3 text-sm italic leading-relaxed text-brown-muted">“{m.openTo}”</p>

      <div className="mt-2 text-xs font-medium text-brown-muted">
        <span className={m.availability === "open" ? "text-green" : m.availability === "limited" ? "text-terracotta" : "text-brown-faint"}>● </span>
        {availabilityLabel(m.availability)}
      </div>

      {reasons?.length ? <MatchReasons reasons={reasons} score={score} className="mt-3" /> : null}

      <div className="mt-4 flex flex-wrap gap-2 pt-1">
        <Button variant="outline" size="sm" href={`/profession/${m.id}`}>
          View Profile
        </Button>
        {requested ? (
          <Button variant="secondary" size="sm" disabled icon={<CheckCircle2 className="h-4 w-4 text-green" aria-hidden />}>
            Request saved
          </Button>
        ) : (
          <Button variant="profession" size="sm" onClick={() => onRequest?.(m)}>
            Request Connection
          </Button>
        )}
      </div>
    </Card>
  );
}
