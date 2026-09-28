"use client";

import { Bookmark, BookmarkCheck, Clock, ExternalLink, MapPin, Video } from "lucide-react";
import type { CulturalEvent } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { Badge, Tag } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EventLinkButton } from "@/components/culture/EventLinkButton";
import { eventCategoryLabel } from "@/services/eventService";
import { formatDateRange } from "@/lib/format";
import { heritageList } from "@/data/heritages";
import { mapsUrl } from "@/lib/geo";

export function EventDetailModal({
  event,
  open,
  onClose,
  saved,
  onToggleSave,
}: {
  event: CulturalEvent | null;
  open: boolean;
  onClose: () => void;
  saved: boolean;
  onToggleSave: (id: string) => void;
}) {
  if (!event) return null;
  const e = event;
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={e.name}
      description={formatDateRange(e.date, e.endDate)}
      footer={
        <>
          <Button variant="ghost" onClick={() => onToggleSave(e.id)} icon={saved ? <BookmarkCheck className="h-4 w-4 text-berry" aria-hidden /> : <Bookmark className="h-4 w-4" aria-hidden />}>
            {saved ? "Saved" : "Save event"}
          </Button>
          {!e.isVirtual ? (
            <Button variant="outline" href={mapsUrl(`${e.venue}, ${e.city}, ${e.state}`)} external iconRight={<ExternalLink className="h-4 w-4" aria-hidden />}>
              Directions
            </Button>
          ) : null}
          <EventLinkButton event={e} icon={<ExternalLink className="h-4 w-4" aria-hidden />} />
        </>
      }
    >
      <div className="flex flex-wrap gap-1.5">
        <Badge tone="culture">{eventCategoryLabel(e.category)}</Badge>
        {e.heritages.length ? <Badge tone="neutral">{heritageList(e.heritages)}</Badge> : null}
      </div>

      <div className="mt-4 space-y-2 text-sm text-brown">
        {e.timeLabel ? (
          <p className="flex items-center gap-2">
            <Clock className="h-4 w-4 shrink-0 text-berry" aria-hidden /> {e.timeLabel}
          </p>
        ) : null}
        <p className="flex items-center gap-2">
          {e.isVirtual ? <Video className="h-4 w-4 shrink-0 text-berry" aria-hidden /> : <MapPin className="h-4 w-4 shrink-0 text-berry" aria-hidden />}
          {e.isVirtual ? e.venue : `${e.venue}, ${e.city}, ${e.state}`}
        </p>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-brown-muted">{e.description}</p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {e.tags.map((t) => (
          <Tag key={t}>{t}</Tag>
        ))}
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-beige pt-4 text-sm">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-brown-faint">Organizer</dt>
          <dd className="mt-0.5 text-brown">{e.organizer}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-brown-faint">Price</dt>
          <dd className="mt-0.5 text-brown">{e.price}</dd>
        </div>
      </dl>
    </Modal>
  );
}
