"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Globe, Loader2 } from "lucide-react";
import { fetchLiveResults } from "@/services/liveSearch";
import type { LiveResultItem, LiveSearchCategory, LiveSource } from "@/services/gemini/types";
import { Badge, Tag } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { LiveEventFacts } from "@/components/culture/LiveEventFacts";
import { formatMinutes } from "@/lib/format";

/** Don't burn API quota on every keystroke or an empty box. */
const MIN_QUERY_LENGTH = 3;

interface Props {
  category: LiveSearchCategory;
  /** Should be the already-debounced query from the parent search bar. */
  query: string;
  heritages: string[];
  city: string;
  state: string;
}

function subtitleFor(item: LiveResultItem): string {
  switch (item.kind) {
    case "community":
      return `${item.platform} · ${item.locationLabel}`;
    case "place":
      return `${item.address}, ${item.city}${item.state ? `, ${item.state}` : ""}`;
    case "event":
      return [item.date, item.venue, item.city].filter(Boolean).join(" · ");
    case "recipe":
      return [item.sourceName, item.timeMinutes ? formatMinutes(item.timeMinutes) : null].filter(Boolean).join(" · ");
    case "program":
      return `${item.organizationType} · ${item.locationLabel}`;
  }
}

function badgeFor(item: LiveResultItem): string {
  switch (item.kind) {
    case "place":
    case "event":
      return item.category;
    case "recipe":
      return item.difficulty ?? "Recipe";
    case "program":
      return item.organizationType;
    case "community":
      return item.type;
  }
}

/**
 * Real results for what was typed in a search bar, found on the web and
 * confirmed to exist by the server. Renders nothing while the query is too
 * short, when search isn't configured, or when nothing was confirmed.
 */
export function LiveResultsSection({ category, query, heritages, city, state }: Props) {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<LiveResultItem[]>([]);
  const [sources, setSources] = useState<LiveSource[]>([]);
  const [configured, setConfigured] = useState(true);

  useEffect(() => {
    if (query.trim().length < MIN_QUERY_LENGTH) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clearing stale results when the query shrinks below the threshold is part of syncing with the external fetch below
      setItems([]);
      setSources([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchLiveResults({ category, query, heritages, city, state }).then((res) => {
      if (cancelled) return;
      setConfigured(res.configured);
      setItems(res.configured ? res.results : []);
      setSources(res.sources ?? []);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [category, query, heritages, city, state]);

  if (!configured || query.trim().length < MIN_QUERY_LENGTH) return null;
  if (!loading && items.length === 0) return null;

  return (
    <div className="mt-6 rounded-3xl border border-dashed border-terracotta/40 bg-terracotta-soft/30 p-4 md:p-5">
      <div className="flex items-center gap-2">
        <Globe className="h-4 w-4 text-terracotta" aria-hidden />
        <h3 className="text-xs font-bold uppercase tracking-wider text-terracotta-deep">More results for your search</h3>
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin text-terracotta" aria-hidden /> : null}
      </div>

      {loading && items.length === 0 ? (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {[0, 1].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-white/50" />
          ))}
        </div>
      ) : (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {items.map((item, i) => (
            <div key={`${item.name}-${i}`} className="rounded-2xl border border-beige bg-cream p-4 shadow-soft">
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-sm font-semibold text-brown">{item.name}</h4>
                <Badge tone="beige" className="shrink-0">
                  {badgeFor(item)}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-brown-muted">{subtitleFor(item)}</p>
              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-brown-muted">{item.description}</p>
              {item.kind === "event" ? <LiveEventFacts item={item} /> : null}
              {item.tags.length ? (
                <div className="mt-2 flex flex-wrap gap-1">
                  {item.tags.slice(0, 3).map((t) => (
                    <Tag key={t}>{t}</Tag>
                  ))}
                </div>
              ) : null}
              {item.externalUrl ? (
                <Button variant="outline" size="sm" className="mt-3" href={item.externalUrl} external iconRight={<ExternalLink className="h-3.5 w-3.5" aria-hidden />}>
                  Visit page
                </Button>
              ) : null}
            </div>
          ))}
        </div>
      )}

      {sources.length ? (
        <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-terracotta/20 pt-3 text-[11px] text-brown-faint">
          <span className="font-semibold">Sources:</span>
          {sources.slice(0, 5).map((s) => (
            <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer" className="underline decoration-dotted hover:text-brown">
              {s.title}
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}
