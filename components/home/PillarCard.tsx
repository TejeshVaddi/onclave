import { ArrowUpRight } from "lucide-react";
import type { Pillar } from "@/types";
import { PILLARS } from "@/lib/pillars";
import { cn } from "@/lib/utils";

export function PillarCard({ pillar }: { pillar: Pillar }) {
  const meta = PILLARS[pillar];
  return (
    <a
      href={meta.href}
      className={cn(
        "group relative flex min-h-[190px] flex-col justify-between overflow-hidden rounded-3xl p-6 text-cream shadow-soft transition-all duration-300",
        "hover:-translate-y-1 hover:shadow-pop focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brown focus-visible:ring-offset-2 focus-visible:ring-offset-cream",
        "bg-gradient-to-br",
        meta.gradient,
      )}
    >
      <div className="pattern-dots absolute inset-0 opacity-70" aria-hidden />
      <div className="absolute -right-8 -top-12 h-40 w-40 rounded-full bg-white/10 blur-2xl transition-transform duration-500 group-hover:scale-110" aria-hidden />
      <div className="relative flex items-start justify-between">
        <p className="text-xs font-bold uppercase tracking-[0.16em] opacity-90">{meta.label}</p>
        <ArrowUpRight className="h-5 w-5 opacity-80 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100" aria-hidden />
      </div>
      <div className="relative">
        <h3 className="text-2xl font-bold tracking-tight text-balance">{meta.tagline}</h3>
        <p className="mt-2 max-w-xs text-sm leading-relaxed opacity-90">{meta.description}</p>
      </div>
    </a>
  );
}
