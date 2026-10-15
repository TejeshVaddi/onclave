"use client";

import type { ReactNode } from "react";
import { Clock, ExternalLink, MapPin, Star } from "lucide-react";
import type { Place } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { Badge, Tag } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { placeCategoryLabel } from "@/services/placeService";
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

export function PlaceDetailModal({ place: p, open, onClose }: { place: Place; open: boolean; onClose: () => void }) {
  const fullAddress = [p.address, p.city, p.state].filter(Boolean).join(", ");

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={p.name}
      description={fullAddress}
      footer={
        <>
          <Button variant="outline" href={directionsUrl(`${p.name}, ${fullAddress}`)} external iconRight={<ExternalLink className="h-4 w-4" aria-hidden />}>
            Directions
          </Button>
          {p.externalUrl ? (
            <Button variant="culture" href={p.externalUrl} external iconRight={<ExternalLink className="h-4 w-4" aria-hidden />}>
              Website
            </Button>
          ) : null}
        </>
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="culture">{placeCategoryLabel(p.category)}</Badge>
        {p.heritages.length ? <Badge tone="neutral">{heritageList(p.heritages)}</Badge> : null}
        {p.priceLevel ? <Tag>{"$".repeat(p.priceLevel)}</Tag> : null}
        {p.rating ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-brown">
            <Star className="h-3.5 w-3.5 fill-gold text-gold" aria-hidden />
            {p.rating.toFixed(1)}
            {p.reviewCount ? <span className="font-normal text-brown-faint">({p.reviewCount.toLocaleString()})</span> : null}
          </span>
        ) : null}
      </div>

      <div className="mt-4 space-y-2 text-sm text-brown">
        <p className="flex items-start gap-2">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-berry" aria-hidden /> {fullAddress}
        </p>
        {p.hours ? (
          <p className="flex items-start gap-2">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-berry" aria-hidden /> {p.hours}
          </p>
        ) : null}
      </div>

      <p className="mt-4 text-sm leading-relaxed text-brown-muted">{p.description}</p>

      {p.knownFor?.length ? (
        <Section title={p.kind === "food" ? "What to order" : "What you'll find"}>
          <ul className="space-y-1.5 text-sm text-brown">
            {p.knownFor.map((t) => (
              <li key={t} className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-berry" aria-hidden />
                {t}
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {p.tags.length ? (
        <div className="mt-5 flex flex-wrap gap-1.5">
          {p.tags.map((t) => (
            <Tag key={t}>{t}</Tag>
          ))}
        </div>
      ) : null}
    </Modal>
  );
}
