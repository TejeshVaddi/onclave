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
  /**
   * Only for a specific, non-search destination (e.g. a map pin for an exact
   * address). Never a search-results page: if there is nothing real to open,
   * the button says so instead.
   */
  fallbackUrl?: string;
  label: string;
  loadingLabel?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  icon?: ReactNode;
}

/**
 * Opens the REAL destination for something that doesn't carry a verified
 * URL of its own (a restaurant, temple, event, or community). On click, asks
 * the same Gemini/Groq pipeline that powers Live Results for the actual
 * page and navigates straight there. If nothing real turns up, it says so
 * rather than dropping the person on a search results page.
 *
 * Opens a blank tab synchronously (before the async lookup) and redirects it
 * once resolved — the standard way to avoid popup blockers eating a tab
 * opened after an `await`. This only works if `window.open` returns an
 * actual reference, which means NOT passing `noopener` to that first call
 * (browsers return `null` when you do, making the tab impossible to
 * navigate later — the classic cause of a popup that's stuck on
 * about:blank forever). We still want the security property `noopener`
 * gives — the destination site shouldn't get a `window.opener` back to
 * this page — so we get a real reference first, then sever it ourselves.
 */
export function ResolveLinkButton({ category, query, heritages = [], city = "", state = "", fallbackUrl, label, loadingLabel, variant = "culture", size, className, icon }: Props) {
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  function go(tab: Window | null, url: string) {
    if (tab) tab.location.href = url;
    else window.open(url, "_blank", "noopener,noreferrer");
  }

  async function handleClick() {
    const tab = window.open("", "_blank");
    if (tab) tab.opener = null;
    setLoading(true);
    setNote(null);
    try {
      const res = await fetchLiveResults({ category, query, heritages, city, state });
      const url = res.configured ? res.results.find((r) => r.externalUrl)?.externalUrl : undefined;
      if (url) {
        go(tab, url);
      } else if (fallbackUrl) {
        go(tab, fallbackUrl);
      } else {
        tab?.close();
        setNote(res.configured ? "No official page found online for this one." : "Link lookup isn't available right now.");
      }
    } catch {
      if (fallbackUrl) {
        go(tab, fallbackUrl);
      } else {
        tab?.close();
        setNote("Couldn't look that up. Try again in a moment.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <Button variant={variant} size={size} className={className} onClick={handleClick} loading={loading} iconRight={!loading ? icon : undefined}>
        {loading ? (loadingLabel ?? "Finding the real link…") : label}
      </Button>
      {note ? (
        <span role="status" className="text-xs text-brown-muted">
          {note}
        </span>
      ) : null}
    </span>
  );
}
