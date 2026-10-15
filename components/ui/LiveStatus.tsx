"use client";

import { Loader2 } from "lucide-react";
import { useAppState } from "@/components/providers/AppStateProvider";
import { useLiveStatus } from "@/components/providers/LiveDataProvider";

/**
 * Says what the live search is doing while results are being found, and
 * says so plainly when the site has no search keys, so an empty list is never a mystery.
 */
export function LiveStatus({ noun, className }: { noun: string; className?: string }) {
  const status = useLiveStatus();
  const { user } = useAppState();

  if (status.configured === false) {
    return (
      <p className={className ?? "mt-3 text-sm text-brown-muted"}>
        Search isn&apos;t connected on this site yet, so there are no {noun} to show. The site owner needs to add the search API keys.
      </p>
    );
  }
  if (status.error && !status.running) {
    return (
      <p className={className ?? "mt-3 text-sm text-brown-muted"}>
        Search isn&apos;t working right now, so some {noun} may be missing. {status.error}
      </p>
    );
  }
  if (status.running) {
    return (
      <p className={className ?? "mt-3 flex items-center gap-2 text-sm text-brown-muted"}>
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        Finding real {noun} near {user.location.city || "you"}… ({status.done} of {status.total} searches done)
      </p>
    );
  }
  return null;
}
