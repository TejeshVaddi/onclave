"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { Button, type ButtonSize, type ButtonVariant } from "@/components/ui/Button";
import { fetchLiveResults } from "@/services/liveSearch";
import type { LiveSearchCategory } from "@/services/gemini/types";

interface Props {
  category: LiveSearchCategory;
  query: string;
  heritages?: string[];
  city?: string;
  state?: string;
  /** Only used if AI lookup is unavailable or turns up nothing — never the default path. */
  fallbackUrl: string;
  label: string;
  loadingLabel?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  icon?: ReactNode;
}

/**
 * Opens the REAL destination for something in the demo dataset that doesn't
 * carry a verified URL — a restaurant, temple, event, or community — instead
 * of a Google search results page. On click, asks the same Gemini/Groq
 * pipeline that powers Live Results to find the actual real page, and
 * navigates straight there. A search link only ever appears as the very
 * last resort, if AI lookup is unavailable or genuinely finds nothing.
 *
 * Opens a blank tab synchronously (before the async lookup) and redirects it
 * once resolved — the standard way to avoid popup blockers eating a tab
 * opened after an `await`.
 */
export function ResolveLinkButton({ category, query, heritages = [], city = "", state = "", fallbackUrl, label, loadingLabel, variant = "culture", size, className, icon }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    const tab = window.open("", "_blank", "noopener,noreferrer");
    setLoading(true);
    try {
      const res = await fetchLiveResults({ category, query, heritages, city, state });
      const url = res.configured ? res.results[0]?.externalUrl : undefined;
      if (tab) tab.location.href = url ?? fallbackUrl;
      else window.open(url ?? fallbackUrl, "_blank", "noopener,noreferrer");
    } catch {
      if (tab) tab.location.href = fallbackUrl;
      else window.open(fallbackUrl, "_blank", "noopener,noreferrer");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant={variant} size={size} className={className} onClick={handleClick} loading={loading} iconRight={!loading ? icon : undefined}>
      {loading ? (loadingLabel ?? "Finding the real link…") : label}
    </Button>
  );
}
