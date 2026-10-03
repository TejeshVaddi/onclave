"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { ResolveLinkButton } from "@/components/ui/ResolveLinkButton";
import { eventLinkLabel } from "@/services/eventService";
import type { CulturalEvent } from "@/types";
import type { ButtonSize, ButtonVariant } from "@/components/ui/Button";

interface Props {
  event: CulturalEvent;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  icon?: ReactNode;
}

/** A real, known URL — link straight there. Otherwise, resolve the real website/ticket page on click, or say none was found. */
export function EventLinkButton({ event: e, variant = "culture", size, className, icon }: Props) {
  if (e.externalUrl) {
    return (
      <Button variant={variant} size={size} className={className} href={e.externalUrl} external iconRight={icon}>
        {eventLinkLabel(e)}
      </Button>
    );
  }

  return (
    <ResolveLinkButton
      category="events"
      query={`${e.name} ${e.venue} ${e.city}`}
      heritages={e.heritages}
      city={e.city}
      state={e.state}
      label={eventLinkLabel(e)}
      loadingLabel="Finding the real link…"
      variant={variant}
      size={size}
      className={className}
      icon={icon}
    />
  );
}
