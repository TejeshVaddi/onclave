import Link from "next/link";
import { cn } from "@/lib/utils";

/** Brand mark: three interlocking arcs in the pillar colours. */
export function LogoMark({ className, size = 32 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className} aria-hidden>
      <circle cx="16" cy="11" r="7.5" stroke="#A43557" strokeWidth="3" />
      <circle cx="10.5" cy="20" r="7.5" stroke="#075B0A" strokeWidth="3" />
      <circle cx="21.5" cy="20" r="7.5" stroke="#B25C3A" strokeWidth="3" />
    </svg>
  );
}

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-2.5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brown", className)} aria-label="Onclave home">
      <LogoMark size={compact ? 28 : 32} />
      {!compact ? <span className="text-xl font-bold tracking-tight text-brown">Onclave</span> : null}
    </Link>
  );
}
