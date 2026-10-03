"use client";

import type { ReactNode } from "react";
import { Clock, ExternalLink, MapPin, Star } from "lucide-react";
import type { Place } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { Badge, Tag } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DemoNote } from "@/components/ui/DemoNote";
import { PlaceLinkButton } from "@/components/culture/PlaceLinkButton";
import { placeCategoryLabel } from "@/services/placeService";
import { getPlaceDetail } from "@/data/placeDetails";
import { heritageList } from "@/data/heritages";
import { mapsUrl } from "@/lib/geo";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-5 border-t border-beige pt-4">
      <h3 className="text-xs font-bold uppercase tracking-wide text-brown-faint">{title}</h3>
      <div className="mt-2">{children}</div>
    </section>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5 text-sm text-brown">
      {items.map((t) => (
        <li key={t} className="flex gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-berry" aria-hidden />
          {t}
        </li>
      ))}
    </ul>
  );
}

export function PlaceDetailModal({ place: p, open, onClose }: { place: Place; open: boolean; onClose: () => void }) {
  const detail = getPlaceDetail(p.id);
  const fullAddress = `${p.address}, ${p.city}, ${p.state}`;
  const directions = mapsUrl(`${p.name}, ${fullAddress}`);

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={p.name}
      description={fullAddress}
      footer={
        <>
          <Button variant="outline" href={directions} external iconRight={<ExternalLink className="h-4 w-4" aria-hidden />}>
            Directions
          </Button>
          <PlaceLinkButton place={p} website={detail?.website} />
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
        {detail ? (
          <p className="flex items-start gap-2">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-berry" aria-hidden /> {detail.hours}
          </p>
        ) : null}
      </div>

      <p className="mt-4 text-sm leading-relaxed text-brown-muted">{p.description}</p>

      {detail?.knownFor.length ? (
        <Section title={p.kind === "food" ? "What to order" : "What you'll find"}>
          <Bullets items={detail.knownFor} />
        </Section>
      ) : null}

      {detail?.goodFor.length ? (
        <Section title="Good for">
          <div className="flex flex-wrap gap-1.5">
            {detail.goodFor.map((g) => (
              <Tag key={g}>{g}</Tag>
            ))}
          </div>
        </Section>
      ) : null}

      {detail?.visitTips.length ? (
        <Section title="Before you go">
          <Bullets items={detail.visitTips} />
        </Section>
      ) : null}

      <DemoNote className="mt-5">
        This is a demo listing. Hours and highlights are typical examples, so confirm with the place before you go.
      </DemoNote>
    </Modal>
  );
}
