"use client";

import type { ReactNode } from "react";
import { Globe, MapPin, Users } from "lucide-react";
import type { Community } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { Badge, Tag } from "@/components/ui/Badge";
import { DemoNote } from "@/components/ui/DemoNote";
import { CommunityLinkButton, hasDirectLink } from "@/components/community/CommunityLinkButton";
import { communityTypeLabel, platformLabel } from "@/services/communityService";
import { getCommunityDetail } from "@/data/communityDetails";
import { heritageList } from "@/data/heritages";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-5 border-t border-beige pt-4">
      <h3 className="text-xs font-bold uppercase tracking-wide text-brown-faint">{title}</h3>
      <div className="mt-2">{children}</div>
    </section>
  );
}

export function CommunityDetailModal({ community: c, open, onClose }: { community: Community; open: boolean; onClose: () => void }) {
  const detail = getCommunityDetail(c.id);
  const direct = hasDirectLink(c);

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={c.name}
      description={`${platformLabel(c.platform)} · ${c.locationLabel}`}
      footer={<CommunityLinkButton community={c} />}
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

      {detail ? (
        <>
          <Section title="Who it's for">
            <p className="text-sm text-brown">{detail.whoFor}</p>
          </Section>
          <Section title="How active it is">
            <p className="text-sm text-brown">{detail.cadence}</p>
          </Section>
          <Section title="What members do">
            <ul className="space-y-1.5 text-sm text-brown">
              {detail.activities.map((a) => (
                <li key={a} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green" aria-hidden />
                  {a}
                </li>
              ))}
            </ul>
          </Section>
          <Section title="How to join">
            <ol className="space-y-1.5 text-sm text-brown">
              {detail.howToJoin.map((step, i) => (
                <li key={step} className="flex gap-2.5">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-soft text-[11px] font-bold text-green-deep">{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </Section>
        </>
      ) : null}

      {c.tags.length ? (
        <div className="mt-5 flex flex-wrap gap-1.5">
          {c.tags.map((t) => (
            <Tag key={t}>{t}</Tag>
          ))}
        </div>
      ) : null}

      {!direct ? (
        <DemoNote className="mt-5">
          This is a demo listing. &quot;Find the community&quot; looks for the real page online and tells you if it can&apos;t find one.
        </DemoNote>
      ) : null}
    </Modal>
  );
}
