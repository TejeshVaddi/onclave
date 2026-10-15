"use client";

import { ExternalLink, Globe, MapPin, Users } from "lucide-react";
import type { Community } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { Badge, Tag } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { communityTypeLabel, platformLabel } from "@/services/communityService";
import { heritageList } from "@/data/heritages";

export function CommunityDetailModal({ community: c, open, onClose }: { community: Community; open: boolean; onClose: () => void }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={c.name}
      description={`${platformLabel(c.platform)} · ${c.locationLabel}`}
      footer={
        <Button variant="community" href={c.externalUrl} external iconRight={<ExternalLink className="h-4 w-4" aria-hidden />}>
          Visit community
        </Button>
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="community">{communityTypeLabel(c.type)}</Badge>
        {c.heritages.length ? <Badge tone="neutral">{heritageList(c.heritages)}</Badge> : null}
      </div>

      <div className="mt-4 space-y-2 text-sm text-brown">
        <p className="flex items-center gap-2">
          {c.isOnline ? <Globe className="h-4 w-4 shrink-0 text-green" aria-hidden /> : <MapPin className="h-4 w-4 shrink-0 text-green" aria-hidden />}
          {c.locationLabel}
        </p>
        {c.memberEstimate ? (
          <p className="flex items-center gap-2">
            <Users className="h-4 w-4 shrink-0 text-green" aria-hidden /> {c.memberEstimate}
          </p>
        ) : null}
      </div>

      <p className="mt-4 text-sm leading-relaxed text-brown-muted">{c.description}</p>

      {c.tags.length ? (
        <div className="mt-5 flex flex-wrap gap-1.5">
          {c.tags.map((t) => (
            <Tag key={t}>{t}</Tag>
          ))}
        </div>
      ) : null}
    </Modal>
  );
}
