"use client";

import { useState } from "react";
import { ArrowRight, Loader2, Sparkles } from "lucide-react";
import type { DiscoveryResult, DiscoveryScope } from "@/types";
import { useUser } from "@/components/providers/AppStateProvider";
import { DiscoveryResults } from "./DiscoveryResults";
import { DiscoveryLiveResults } from "./DiscoveryLiveResults";
import { PageHeader } from "@/components/layout/PageHeader";
import { DemoNote } from "@/components/ui/DemoNote";
import { discoveryProvider } from "@/services/discovery";
import { cn } from "@/lib/utils";

const SCOPE_OPTIONS: { id: DiscoveryScope; label: string }[] = [
  { id: null, label: "Anything" },
  { id: "community", label: "Community" },
  { id: "culture", label: "Culture" },
  { id: "profession", label: "Profession" },
];

export function DiscoverySearch() {
  const user = useUser();
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<DiscoveryScope>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiscoveryResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runSearch(q: string) {
    const trimmed = q.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    try {
      const res = await discoveryProvider.discover(trimmed, user, scope);
      setResult(res);
    } catch {
      setError("Something went wrong running that search. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="AI Discovery"
        title="Ask Onclave anything."
        description="Describe what you're looking for in your own words, like a heritage, an interest, or a timeframe, and Onclave will search across Community, Culture, and Profession at once."
      />

      <div className="mb-3 flex items-center gap-2">
        <label htmlFor="discovery-scope" className="text-xs font-semibold text-brown-muted">
          Ask about
        </label>
        <select
          id="discovery-scope"
          value={scope ?? "any"}
          onChange={(e) => setScope(e.target.value === "any" ? null : (e.target.value as DiscoveryScope))}
          className="rounded-xl border border-beige-deep bg-cream px-3 py-1.5 text-sm font-semibold text-brown shadow-soft transition focus:border-brown focus:outline-none focus:ring-2 focus:ring-brown/70"
        >
          {SCOPE_OPTIONS.map((o) => (
            <option key={o.label} value={o.id ?? "any"}>
              {o.label}
            </option>
          ))}
        </select>
        <span className="text-xs text-brown-faint">— narrows results to just that pillar, so any question you ask stays focused.</span>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          runSearch(query);
        }}
        className="relative"
      >
        <Sparkles className="pointer-events-none absolute left-4 top-4 h-5 w-5 text-terracotta" aria-hidden />
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              runSearch(query);
            }
          }}
          rows={2}
          placeholder={
            scope === "community"
              ? "Describe the community you're looking for"
              : scope === "culture"
                ? "Ask about a recipe, restaurant, temple, or event"
                : scope === "profession"
                  ? "Ask about a mentor or professional program"
                  : "Describe what you're looking for"
          }
          className="w-full resize-none rounded-2xl border border-beige-deep bg-cream py-3.5 pl-12 pr-32 text-[15px] text-brown placeholder:text-brown-faint shadow-soft transition focus:border-brown focus:outline-none focus:ring-2 focus:ring-brown/70"
          aria-label="Describe what you're looking for"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className={cn(
            "absolute right-2.5 top-2.5 inline-flex h-9 items-center gap-1.5 rounded-xl bg-brown px-4 text-sm font-semibold text-cream transition",
            "hover:bg-[#362c26] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brown focus-visible:ring-offset-2 focus-visible:ring-offset-cream",
            "disabled:opacity-50",
          )}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <ArrowRight className="h-4 w-4" aria-hidden />}
          {loading ? "Searching" : "Search"}
        </button>
      </form>

      <div className="mt-8" aria-live="polite">
        {loading ? (
          <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-beige-deep bg-beige-soft/40 py-16 text-center">
            <Loader2 className="h-6 w-6 animate-spin text-terracotta" aria-hidden />
            <p className="text-sm font-medium text-brown-muted">Reading your query and matching it against Community, Culture, and Profession…</p>
          </div>
        ) : error ? (
          <p className="rounded-2xl bg-berry-soft px-4 py-3 text-sm font-medium text-berry-deep">{error}</p>
        ) : result ? (
          <div className="animate-fade-up">
            <p className="text-sm font-medium text-brown-muted">{result.summary}</p>
            <DiscoveryResults result={result} />
            <DiscoveryLiveResults result={result} user={user} />
          </div>
        ) : null}
      </div>

      <DemoNote className="mt-10">
        The results above come from a transparent, rule-based interpreter reading your query for heritage, interests, profession, and timing, then scoring Onclave&apos;s local demo dataset. When an AI key is configured (Gemini, with Groq as an automatic backup), a &quot;Live results from the web&quot; section also searches for real matches, and — only when nothing real was found anywhere — a &quot;Generated by AI&quot; section offers a synthesized example instead (a full recipe, for instance), always clearly marked as unverified.
      </DemoNote>
    </div>
  );
}
