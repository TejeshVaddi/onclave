"use client";

import type { ReactNode } from "react";
import { Bookmark, BookmarkCheck, Clock, ExternalLink, MapPin, Ticket, Users, Video } from "lucide-react";
import type { CulturalEvent } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { Badge, Tag } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { eventCategoryLabel } from "@/services/eventService";
import { formatDateRange } from "@/lib/format";
import { heritageList } from "@/data/heritages";
import { directionsUrl } from "@/lib/geo";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-5 border-t border-beige pt-4">
      <h3 className="text-xs font-bold uppercase tracking-wide text-brown-faint">{title}</h3>
      <div className="mt-2">{children}</div>
    </section>
  );
}

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
  const where = e.isVirtual ? e.venue : [e.venue, e.address ?? [e.city, e.state].filter(Boolean).join(", ")].filter(Boolean).join(", ");
  const free = /^free\b/i.test(e.price);

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={e.name}
      description={formatDateRange(e.date, e.endDate)}
      footer={
        <>
          <Button variant="ghost" onClick={() => onToggleSave(e.id)} icon={saved ? <BookmarkCheck className="h-4 w-4 text-berry" aria-hidden /> : <Bookmark className="h-4 w-4" aria-hidden />}>
            {saved ? "Saved" : "Save event"}
          </Button>
          {!e.isVirtual ? (
            <Button variant="outline" href={directionsUrl(where)} external iconRight={<ExternalLink className="h-4 w-4" aria-hidden />}>
              Directions
            </Button>
          ) : null}
          {e.externalUrl ? (
            <Button variant="culture" href={e.externalUrl} external iconRight={<ExternalLink className="h-4 w-4" aria-hidden />}>
              {free ? "Event page" : "Event page and tickets"}
            </Button>
          ) : null}
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
        <p className="flex items-start gap-2">
          {e.isVirtual ? <Video className="mt-0.5 h-4 w-4 shrink-0 text-berry" aria-hidden /> : <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-berry" aria-hidden />}
          {where}
        </p>
        <p className="flex items-center gap-2">
          <Ticket className="h-4 w-4 shrink-0 text-berry" aria-hidden /> {e.price}
        </p>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-brown-muted">{e.description}</p>

      {e.performers?.length ? (
        <Section title="Who's performing and hosting">
          <p className="flex items-start gap-2 text-sm text-brown">
            <Users className="mt-0.5 h-4 w-4 shrink-0 text-berry" aria-hidden />
            {e.performers.join(", ")}
          </p>
        </Section>
      ) : null}

      {e.ticketInfo ? (
        <Section title="Tickets and entry">
          <p className="text-sm text-brown">{e.ticketInfo}</p>
        </Section>
      ) : null}

      <Section title="Organizer">
        <p className="text-sm font-medium text-brown">{e.organizer}</p>
      </Section>

      {e.tags.length ? (
        <div className="mt-5 flex flex-wrap items-center gap-2">
          {e.tags.map((t) => (
            <Tag key={t}>{t}</Tag>
          ))}
        </div>
      ) : null}
    </Modal>
  );
}
