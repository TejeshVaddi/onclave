import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export function HowItWorksStrip() {
  return (
    <Link
      href="/how-it-works"
      className="group mt-10 flex items-center justify-between gap-4 rounded-2xl border border-beige-deep bg-beige-soft/60 px-5 py-4 transition hover:border-brown-faint hover:bg-beige-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brown md:mt-14"
    >
      <span className="flex items-center gap-3 text-sm text-brown">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cream text-terracotta shadow-soft">
          <Sparkles className="h-4 w-4" aria-hidden />
        </span>
        <span>
          <span className="font-semibold">How Onclave works: </span>
          your profile helps us personalize community, cultural, and professional recommendations.
        </span>
      </span>
      <ArrowRight className="h-4 w-4 shrink-0 text-brown-muted transition-transform group-hover:translate-x-1" aria-hidden />
    </Link>
  );
}
