"use client";

import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowUp, Loader2, RotateCcw, Sparkles } from "lucide-react";
import type { DiscoveryResult, DiscoveryScope } from "@/types";
import type { LiveSource } from "@/services/gemini/types";
import { useAppState } from "@/components/providers/AppStateProvider";
import { DiscoveryResults } from "./DiscoveryResults";
import { PageHeader } from "@/components/layout/PageHeader";
import { discoveryProvider } from "@/services/discovery";
import { fetchDiscoverChat } from "@/services/liveSearch";
import { heritageLabel } from "@/data/heritages";
import { interestLabel } from "@/data/interests";
import { getProfession } from "@/data/professions";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "onclave:discover-chat";
const MAX_SAVED_TURNS = 20;

const SCOPE_OPTIONS: { id: DiscoveryScope; label: string }[] = [
  { id: null, label: "Anything" },
  { id: "community", label: "Community" },
  { id: "culture", label: "Culture" },
  { id: "profession", label: "Profession" },
];

interface Turn {
  id: string;
  role: "user" | "assistant";
  text: string;
  pending?: boolean;
  failed?: boolean;
  /** Cards from Onclave's own confirmed lists that matched the question. */
  result?: DiscoveryResult;
  /** Pages the answer was based on, when the assistant searched the web. */
  sources?: LiveSource[];
}

const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

/** The items found for a question, as lines the assistant is allowed to name. Names only: no contact details. */
function verifiedContext(r: DiscoveryResult): string[] {
  const lines: string[] = [];
  for (const c of r.community.slice(0, 4)) lines.push(`Community: ${c.item.name} (${c.item.locationLabel}) ${c.item.externalUrl}`);
  for (const p of r.culture.places.slice(0, 5)) lines.push(`${p.item.kind === "food" ? "Food" : "Place"}: ${p.item.name}, ${[p.item.address, p.item.city, p.item.state].filter(Boolean).join(", ")}${p.item.externalUrl ? ` ${p.item.externalUrl}` : ""}`);
  for (const e of r.culture.events.slice(0, 4)) lines.push(`Event: ${e.item.name} on ${e.item.date}${e.item.kind === "celebration" ? "" : ` at ${e.item.venue}`}${e.item.externalUrl ? ` ${e.item.externalUrl}` : ""}`);
  for (const rc of r.culture.recipes.slice(0, 3)) lines.push(`Recipe in Onclave's Recipes tab: ${rc.item.name}`);
  for (const m of r.profession.slice(0, 3)) lines.push(`Person in the Profession tab: ${m.item.name}, ${m.item.title} at ${m.item.company}`);
  return lines;
}

/** Minimal formatting for the assistant's plain text: paragraphs, dash or numbered lists, and **bold**. */
function inline(text: string): ReactNode {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => (part.startsWith("**") && part.endsWith("**") ? <strong key={i}>{part.slice(2, -2)}</strong> : <Fragment key={i}>{part}</Fragment>));
}

function ChatText({ text }: { text: string }) {
  const blocks = text.trim().split(/\n{2,}/);
  return (
    <div className="space-y-3 text-[15px] leading-relaxed">
      {blocks.map((block, i) => {
        const lines = block.split("\n").filter((l) => l.trim());
        const bullets = lines.every((l) => /^\s*[-*•]\s+/.test(l));
        const numbered = lines.every((l) => /^\s*\d+[.)]\s+/.test(l));
        if (bullets) {
          return (
            <ul key={i} className="list-disc space-y-1 pl-5">
              {lines.map((l, j) => (
                <li key={j}>{inline(l.replace(/^\s*[-*•]\s+/, ""))}</li>
              ))}
            </ul>
          );
        }
        if (numbered) {
          return (
            <ol key={i} className="list-decimal space-y-1 pl-5">
              {lines.map((l, j) => (
                <li key={j}>{inline(l.replace(/^\s*\d+[.)]\s+/, ""))}</li>
              ))}
            </ol>
          );
        }
        return (
          <p key={i}>
            {lines.map((l, j) => (
              <Fragment key={j}>
                {j > 0 ? <br /> : null}
                {inline(l)}
              </Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function DiscoverySearch() {
  const { user, hydrated } = useAppState();
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [scope, setScope] = useState<DiscoveryScope>(null);
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const restored = useRef(false);

  // Keep the conversation when someone visits another tab and comes back.
  useEffect(() => {
    if (restored.current) return;
    restored.current = true;
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- restoring from browser storage after mount is what this effect is for
      if (raw) setTurns((JSON.parse(raw) as Turn[]).filter((t) => !t.pending));
    } catch {
      /* storage can be unavailable; the chat just starts empty */
    }
  }, []);

  useEffect(() => {
    if (!restored.current) return;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(turns.filter((t) => !t.pending).slice(-MAX_SAVED_TURNS)));
    } catch {
      /* ignore */
    }
  }, [turns]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [turns]);

  async function send(raw: string) {
    const text = raw.trim();
    if (!text || busy) return;
    const userTurn: Turn = { id: uid(), role: "user", text };
    const pendingId = uid();
    const history = [...turns, userTurn].filter((t) => !t.pending && t.text).map((t) => ({ role: t.role, content: t.text }));

    setTurns((t) => [...t, userTurn, { id: pendingId, role: "assistant", text: "", pending: true }]);
    setInput("");
    setBusy(true);

    // Onclave's own confirmed lists answer instantly and become the cards under the reply.
    let result: DiscoveryResult | undefined;
    try {
      const found = await discoveryProvider.discover(text, user, scope);
      if (found.totalResults > 0) result = found;
    } catch {
      /* the reply can still stand on its own */
    }

    const res = await fetchDiscoverChat({
      messages: history,
      profile: {
        name: user.name,
        heritages: user.heritages.map(heritageLabel),
        professionLabel: user.profession ? (getProfession(user.profession)?.label ?? "") : "",
        interests: user.interests.map(interestLabel),
        city: user.location.city,
        state: user.location.state ?? "",
      },
      verified: result ? verifiedContext(result) : [],
    });

    const reply =
      res.reply ??
      (res.configured === false
        ? "The assistant isn't connected on this site yet. The site owner needs to add the AI API key."
        : (res.error ?? "I couldn't answer that just now. Please try again in a moment."));

    setTurns((ts) => ts.map((t) => (t.id === pendingId ? { ...t, pending: false, text: reply, failed: !res.reply, result, sources: res.sources } : t)));
    setBusy(false);
  }

  function reset() {
    setTurns([]);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="AI Discovery"
        title="Ask Onclave anything."
        description="Chat in your own words about communities, culture, food, events, recipes, or careers. Onclave answers using live web search, and the places, groups, and events it shows under an answer come from lists it has confirmed exist."
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <label htmlFor="discovery-scope" className="text-xs font-semibold text-brown-muted">
          Show cards for
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
        {turns.length ? (
          <button
            type="button"
            onClick={reset}
            className="ml-auto inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-semibold text-brown-muted transition hover:bg-beige-soft hover:text-brown focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brown"
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
            New chat
          </button>
        ) : null}
      </div>

      <div className="space-y-6" aria-live="polite">
        {turns.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-beige-deep bg-beige-soft/40 px-6 py-14 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-terracotta-soft text-terracotta-deep">
              <Sparkles className="h-5 w-5" aria-hidden />
            </span>
            <p className="max-w-md text-sm text-brown-muted">
              {hydrated && user.name ? `Hi ${user.name.split(" ")[0]}. ` : ""}Ask a question below and Onclave will answer, then show the real communities, places, events, and people that match.
            </p>
          </div>
        ) : null}

        {turns.map((t) =>
          t.role === "user" ? (
            <div key={t.id} className="flex justify-end">
              <p className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-brown px-4 py-3 text-[15px] leading-relaxed text-cream">{t.text}</p>
            </div>
          ) : (
            <div key={t.id} className="flex items-start gap-3">
              <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-terracotta-soft text-terracotta-deep" aria-hidden>
                <Sparkles className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className={cn("max-w-[44rem] rounded-2xl rounded-tl-md border px-4 py-3 text-brown", t.failed ? "border-berry-soft bg-berry-soft/40" : "border-beige bg-white/60")}>
                  {t.pending ? (
                    <p className="flex items-center gap-2 text-sm text-brown-muted">
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                      Searching and thinking…
                    </p>
                  ) : (
                    <ChatText text={t.text} />
                  )}
                  {!t.pending && t.sources?.length ? (
                    <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-beige pt-2 text-[11px] text-brown-faint">
                      <span className="font-semibold">Sources:</span>
                      {t.sources.slice(0, 4).map((s) => (
                        <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer" className="underline decoration-dotted hover:text-brown">
                          {hostOf(s.url)}
                        </a>
                      ))}
                    </p>
                  ) : null}
                </div>
                {!t.pending && t.result ? (
                  <div className="mt-4">
                    <DiscoveryResults result={t.result} showNotes={false} />
                  </div>
                ) : null}
              </div>
            </div>
          ),
        )}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void send(input);
        }}
        className="sticky bottom-4 z-10 mt-8"
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send(input);
            }
          }}
          rows={2}
          placeholder="Ask anything about your community, culture, or career"
          className="w-full resize-none rounded-2xl border border-beige-deep bg-cream py-3.5 pl-4 pr-16 text-[15px] text-brown placeholder:text-brown-faint shadow-lift transition focus:border-brown focus:outline-none focus:ring-2 focus:ring-brown/70"
          aria-label="Message Onclave"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          aria-label="Send message"
          className={cn(
            "absolute bottom-3 right-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brown text-cream transition",
            "hover:bg-[#362c26] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brown focus-visible:ring-offset-2 focus-visible:ring-offset-cream",
            "disabled:opacity-50",
          )}
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <ArrowUp className="h-4 w-4" aria-hidden />}
        </button>
      </form>
    </div>
  );
}
