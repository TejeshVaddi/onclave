"use client";

import { ExternalLink } from "lucide-react";
import type { ReactNode } from "react";
import { Button, type ButtonSize, type ButtonVariant } from "@/components/ui/Button";
import { ResolveLinkButton } from "@/components/ui/ResolveLinkButton";
import type { Place } from "@/types";

interface Props {
  place: Place;
  /** A real, known website for the place, when we have one. */
  website?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  icon?: ReactNode;
}

/**
 * A real, known URL — link straight there. Otherwise (the local dataset's
 * restaurants, shops, temples, etc. don't carry verified websites), look up
 * the place's actual website on click, or say none was found. Directions are
 * a separate, always-available button, so this never falls back to a search.
 */
export function PlaceLinkButton({ place: p, website, variant = "culture", size, className, icon = <ExternalLink className="h-4 w-4" aria-hidden /> }: Props) {
  const url = website ?? p.externalUrl;
  if (url) {
    return (
      <Button variant={variant} size={size} className={className} href={url} external iconRight={icon}>
        Website
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
      label="Find website"
      loadingLabel="Finding the website…"
      variant={variant}
      size={size}
      className={className}
      icon={icon}
    />
  );
}
