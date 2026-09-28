"use client";

import { ExternalLink } from "lucide-react";
import type { ReactNode } from "react";
import { Button, type ButtonSize, type ButtonVariant } from "@/components/ui/Button";
import { ResolveLinkButton } from "@/components/ui/ResolveLinkButton";
import { placeMapUrl } from "@/services/placeService";
import type { Place } from "@/types";

interface Props {
  place: Place;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  icon?: ReactNode;
}

/**
 * A real, known URL — link straight there. Otherwise (the local dataset's
 * restaurants, shops, temples, etc. don't carry verified websites), try an
 * AI lookup for the place's actual website first; a Google Maps link (still
 * a real, useful destination, not a search page) is the fallback only if
 * that comes up empty.
 */
export function PlaceLinkButton({ place: p, variant = "culture", size, className, icon = <ExternalLink className="h-3.5 w-3.5" aria-hidden /> }: Props) {
  if (p.externalUrl) {
    return (
      <Button variant={variant} size={size} className={className} href={p.externalUrl} external iconRight={icon}>
        View Location
      </Button>
    );
  }

  return (
    <ResolveLinkButton
      category={p.kind === "food" ? "food" : "places"}
      query={`${p.name} ${p.city}`}
      heritages={p.heritages}
      city={p.city}
      state={p.state}
      fallbackUrl={placeMapUrl(p)}
      label="View Location"
      loadingLabel="Finding the real link…"
      variant={variant}
      size={size}
      className={className}
      icon={icon}
    />
  );
}
