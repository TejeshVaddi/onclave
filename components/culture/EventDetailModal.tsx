"use client";

import { useState, type ReactNode } from "react";
import { Bookmark, BookmarkCheck, Clock, ExternalLink, Globe, MapPin, Ticket, Video } from "lucide-react";
import type { CulturalEvent } from "@/types";
import type { LiveEventItem } from "@/services/gemini/types";
import { Modal } from "@/components/ui/Modal";
import { Badge, Tag } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DemoNote } from "@/components/ui/DemoNote";
import { EventLinkButton } from "@/components/culture/EventLinkButton";
import { LiveEventFacts } from "@/components/culture/LiveEventFacts";
import { eventCategoryLabel } from "@/services/eventService";
import { fetchLiveResults } from "@/services/liveSearch";
import { getEventDetail } from "@/data/eventDetails";
import { formatDateRange } from "@/lib/format";
import { heritageList } from "@/data/heritages";
import { mapsUrl } from "@/lib/geo";

const STOP_WORDS = new Set(["the", "a", "an", "of", "and", "for", "in", "at", "to", "on"]);

function tokens(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP_WORDS.has(t));
}

/** True when a web result is plausibly the same event: at least half of the event's name words appear in it. */
function looksLikeSameEvent(eventName: string, found: string): boolean {
  const want = tokens(eventName);
  if (!want.length) return false;
  const have = new Set(tokens(found));
  return want.filter((t) => have.has(t)).length / want.length >= 0.5;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-5 border-t border-beige pt-4">
      <h3 className="text-xs font-bold uppercase tracking-wide text-brown-faint">{title}</h3>
      <div className="mt-2">{children}</div>
    </section>
  );
}

/** Opt-in lookup for what the web currently says about this event (performers, tickets, official page). */
function WebCheck({ event }: { event: CulturalEvent }) {
  const [phase, setPhase] = useState<"idle" | "loading" | "done">("idle");
  const [match, setMatch] = useState<LiveEventItem | null>(null);
  const [note, setNote] = useState<string | null>(null);

  async function run() {
    setPhase("loading");
    const res = await fetchLiveResults({ category: "events", query: event.name, heritages: event.heritages, city: event.city, state: event.state });
    if (!res.configured) {
      setNote("Web lookup isn't available right now.");
    } else {
      const hit = res.results.find((r): r is LiveEventItem => r.kind === "event" && looksLikeSameEvent(event.name, r.name));
      setMatch(hit ?? null);
      setNote(hit ? null : "Nothing matching this event turned up online.");
    }
    setPhase("done");
  }

  return (
    <Section title="Latest from the web">
      {phase === "idle" ? (
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" size="sm" onClick={run} icon={<Globe className="h-3.5 w-3.5" aria-hidden />}>
            Check the web for current details
          </Button>
          <span className="text-xs text-brown-muted">Looks for performers, organizers, and ticket pages.</span>
        </div>
      ) : null}
      {phase === "loading" ? <p className="text-sm text-brown-muted">Searching…</p> : null}
      {phase === "done" && note ? <p className="text-sm text-brown-muted">{note}</p> : null}
      {phase === "done" && match ? (
        <div className="rounded-2xl border border-beige bg-cream p-4">
          <p className="text-sm font-semibold text-brown">{match.name}</p>
          <p className="mt-1 text-xs text-brown-muted">{[match.date, match.venue, match.city].filter(Boolean).join(" · ")}</p>
          <p className="mt-2 text-sm leading-relaxed text-brown-muted">{match.description}</p>
          <LiveEventFacts item={match} className="mt-3 space-y-1 text-xs" />
          {match.externalUrl ? (
            <Button variant="culture" size="sm" className="mt-3" href={match.externalUrl} external iconRight={<ExternalLink className="h-3.5 w-3.5" aria-hidden />}>
              Open the official page
            </Button>
          ) : null}
          <p className="mt-3 text-[11px] text-brown-faint">Found by AI search just now. Double-check details with the organizer before you go.</p>
        </div>
      ) : null}
    </Section>
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
  const detail = getEventDetail(e.id);
  const where = e.isVirtual ? e.venue : [e.venue, detail?.address ?? `${e.city}, ${e.state}`].join(", ");

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
            <Button variant="outline" href={mapsUrl(`${e.venue}, ${detail?.address ?? `${e.city}, ${e.state}`}`)} external iconRight={<ExternalLink className="h-4 w-4" aria-hidden />}>
              Directions
            </Button>
          ) : null}
          {detail?.venueUrl ? (
            <Button variant="outline" href={detail.venueUrl} external iconRight={<ExternalLink className="h-4 w-4" aria-hidden />}>
              Venue website
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
        <p className="flex items-start gap-2">
          {e.isVirtual ? <Video className="mt-0.5 h-4 w-4 shrink-0 text-berry" aria-hidden /> : <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-berry" aria-hidden />}
          {where}
        </p>
        <p className="flex items-center gap-2">
          <Ticket className="h-4 w-4 shrink-0 text-berry" aria-hidden /> {e.price}
        </p>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-brown-muted">{e.description}</p>

      {detail?.lineup.length ? (
        <Section title="Who's performing and hosting">
          <ul className="space-y-1.5 text-sm">
            {detail.lineup.map((l) => (
              <li key={l.name} className="flex flex-wrap gap-x-2">
                <span className="font-medium text-brown">{l.name}</span>
                <span className="text-brown-muted">{l.role}</span>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {detail?.schedule.length ? (
        <Section title="Schedule">
          <ol className="space-y-1.5 text-sm">
            {detail.schedule.map((s) => (
              <li key={`${s.time}-${s.item}`} className="flex gap-3">
                <span className="w-24 shrink-0 font-semibold text-berry-deep">{s.time}</span>
                <span className="text-brown">{s.item}</span>
              </li>
            ))}
          </ol>
        </Section>
      ) : null}

      <Section title="Tickets and entry">
        <p className="text-sm text-brown">{detail?.tickets.how ?? e.price}</p>
        {detail?.tickets.where ? <p className="mt-1 text-sm text-brown-muted">{detail.tickets.where}</p> : null}
      </Section>

      <Section title="Organizer">
        <p className="text-sm font-medium text-brown">{e.organizer}</p>
        {detail?.organizerNote ? <p className="mt-1 text-sm text-brown-muted">{detail.organizerNote}</p> : null}
      </Section>

      {detail?.goodToKnow.length ? (
        <Section title="Good to know">
          <ul className="space-y-1.5 text-sm text-brown">
            {detail.goodToKnow.map((g) => (
              <li key={g} className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-berry" aria-hidden />
                {g}
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      <WebCheck key={e.id} event={e} />

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {e.tags.map((t) => (
          <Tag key={t}>{t}</Tag>
        ))}
      </div>

      <DemoNote className="mt-5">
        This is a demo listing. The lineup, schedule, and ticket details above are examples of what a real listing would show, not an announcement from the organizer.
      </DemoNote>
    </Modal>
  );
}
