import type { Metadata } from "next";
import { MapPin, Sparkles, Briefcase } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { PILLARS } from "@/lib/pillars";
import { cn } from "@/lib/utils";
import type { Pillar } from "@/types";

export const metadata: Metadata = { title: "How it works" };

const STEPS: { pillar: Pillar; title: string; body: string }[] = [
  {
    pillar: "community",
    title: "Tell us who you are",
    body: "Onboarding asks for your heritage, location, interests, and profession. Nothing here is guessed; every recommendation traces back to something you told us.",
  },
  {
    pillar: "culture",
    title: "We score every result against your profile",
    body: "services/recommendations.ts scores communities, recipes, places, events, and mentors using weighted signals: heritage match, distance from you, profession or industry match, shared interests, and timing.",
  },
  {
    pillar: "profession",
    title: "You see exactly why",
    body: "Personalized cards show their match reasons, things like \"Matches your Nigerian heritage\" or \"12 miles from Fairfax,\" so a recommendation is never a black box.",
  },
];

const ARCHITECTURE = [
  { label: "Structured data", body: "Every community, recipe, place, event, and mentor is a typed TypeScript object in /types, so the UI, search, and scoring all share one contract." },
  { label: "API-ready by design", body: "The /services layer is the only place that touches data. Swapping mock data for Reddit, Meetup, a recipe API, or Google Places means changing one file, not the UI." },
  { label: "Location-aware without a paid API", body: "A geocoder and haversine distance calculation in lib/geo.ts power \"near me\" filtering and distance-based scoring." },
];

export default function HowItWorksPage() {
  return (
    <div className="animate-fade-up">
      <PageHeader
        title="How Onclave works"
        description="Your profile personalizes what you see in Community, Culture, and Profession. Here's what actually happens behind each screen."
      />

      <div className="space-y-4">
        {STEPS.map((s, i) => {
          const meta = PILLARS[s.pillar];
          return (
            <div key={s.title} className={cn("flex gap-4 rounded-2xl border border-beige bg-white/40 p-5", i % 2 === 1 && "sm:pl-8")}>
              <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-cream", meta.bg)}>
                {i + 1}
              </span>
              <div>
                <h3 className="text-[15px] font-semibold text-brown">{s.title}</h3>
                <p className="mt-1 max-w-2xl text-sm leading-relaxed text-brown-muted">{s.body}</p>
              </div>
            </div>
          );
        })}
        <div className="flex gap-4 rounded-2xl border border-beige bg-white/40 p-5 sm:pl-8">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brown text-sm font-bold text-cream">4</span>
          <div>
            <h3 className="text-[15px] font-semibold text-brown">Ask in plain language</h3>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-brown-muted">
              AI Discovery reads a sentence like &quot;I&apos;m Nigerian-American, interested in medicine, and want to connect with my culture this weekend&quot; and pulls out heritage, interest, profession, and timing signals. Those signals run through the same scoring engine as step two.
            </p>
          </div>
        </div>
      </div>

      <section className="mt-12">
        <h2 className="text-xl font-semibold tracking-tight text-brown">Under the hood</h2>
        <p className="mt-1.5 max-w-2xl text-sm text-brown-muted">
          This is real technical architecture built for the Congressional App Challenge, not a static mockup.
        </p>
        <div className="mt-5 space-y-3">
          {ARCHITECTURE.map((a) => (
            <div key={a.label} className="rounded-2xl border border-beige bg-white/40 p-5">
              <h3 className="text-sm font-bold text-brown">{a.label}</h3>
              <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-brown-muted">{a.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12 rounded-3xl bg-beige-soft/70 p-6 md:p-8">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-terracotta">
              <MapPin className="h-3.5 w-3.5" aria-hidden /> Try it yourself
            </p>
            <h3 className="mt-1 text-lg font-semibold text-brown">See your personalized feed in action</h3>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" href="/profile">
              Edit your profile
            </Button>
            <Button variant="primary" href="/discover" icon={<Sparkles className="h-4 w-4" aria-hidden />}>
              Try AI Discovery
            </Button>
          </div>
        </div>
      </section>

      <section className="mt-10 flex items-start gap-3 rounded-2xl border border-dashed border-beige-deep px-5 py-4">
        <Briefcase className="mt-0.5 h-5 w-5 shrink-0 text-brown-muted" aria-hidden />
        <p className="text-sm text-brown-muted">
          Onclave&apos;s roadmap sits on top of this same Community, Culture, and Profession foundation: premium mentorship features, university and cultural-organization partnerships, sponsored cultural events, and eventually a marketplace for ingredient delivery.
        </p>
      </section>
    </div>
  );
}
