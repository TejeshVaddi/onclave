"use client";

import { ExternalLink } from "lucide-react";
import type { ReactNode } from "react";
import { Button, type ButtonSize, type ButtonVariant } from "@/components/ui/Button";
import { ResolveLinkButton } from "@/components/ui/ResolveLinkButton";
import type { Community } from "@/types";

interface Props {
  community: Community;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  icon?: ReactNode;
}

/**
 * A community with a real URL links straight there. One without (most of
 * the demo dataset, since we don't track live community URLs) tries an AI
 * lookup for the actual group/page on click, and says so if nothing real can
 * be found. It never sends anyone to a platform's search page.
 */
/** True when the community carries a real, specific URL. */
export function hasDirectLink(c: Community): boolean {
  return Boolean(c.externalUrl);
}

export function CommunityLinkButton({ community: c, variant = "community", size, className, icon = <ExternalLink className="h-3.5 w-3.5" aria-hidden /> }: Props) {
  if (c.externalUrl) {
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
      label="Find the community"
      loadingLabel="Finding the community…"
      variant={variant}
      size={size}
      className={className}
      icon={icon}
    />
  );
}
