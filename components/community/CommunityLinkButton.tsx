"use client";

import { ExternalLink } from "lucide-react";
import type { ReactNode } from "react";
import { Button, type ButtonSize, type ButtonVariant } from "@/components/ui/Button";
import { ResolveLinkButton } from "@/components/ui/ResolveLinkButton";
import type { Community } from "@/types";
import type { CommunityRecord } from "@/data/communities";

interface Props {
  community: Community;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  icon?: ReactNode;
}

/**
 * A "direct" community record already carries a real URL — link straight
 * there. A "search" record (most of the demo dataset, since we don't track
 * live community URLs) used to always send people to a platform search
 * page; now it tries an AI lookup for the actual group/page first, and
 * only falls back to that search page if nothing real can be found.
 */
export function CommunityLinkButton({ community: c, variant = "community", size, className, icon = <ExternalLink className="h-3.5 w-3.5" aria-hidden /> }: Props) {
  const isSearchLink = (c as CommunityRecord).linkKind === "search";

  if (!isSearchLink) {
    return (
      <Button variant={variant} size={size} className={className} href={c.externalUrl} external iconRight={icon}>
        Visit Community
      </Button>
    );
  }

  return (
    <ResolveLinkButton
      category="community"
      query={c.name}
      heritages={c.heritages}
      city={c.isOnline ? "" : c.locationLabel}
      fallbackUrl={c.externalUrl}
      label="Visit Community"
      loadingLabel="Finding the real link…"
      variant={variant}
      size={size}
      className={className}
      icon={icon}
    />
  );
}
