import type { ReactNode } from "react";
import type { ArtTone } from "@/types";
import { cn } from "@/lib/utils";

/**
 * Generated cover art. Real deployments swap this for source images
 * (recipe photos, place photos); the demo uses patterned brand gradients so
 * nothing is misattributed.
 */
const GRADIENTS: Record<ArtTone, string> = {
  berry: "linear-gradient(135deg, #B04466 0%, #7E2843 100%)",
  terracotta: "linear-gradient(135deg, #C46B46 0%, #8C4629 100%)",
  green: "linear-gradient(135deg, #1E7A22 0%, #04430A 100%)",
  gold: "linear-gradient(135deg, #D6A652 0%, #9C7128 100%)",
  clay: "linear-gradient(135deg, #A86756 0%, #6E3E33 100%)",
  olive: "linear-gradient(135deg, #7E8C4A 0%, #4C5A28 100%)",
  plum: "linear-gradient(135deg, #7F4A6C 0%, #4A2540 100%)",
  sand: "linear-gradient(135deg, #D8C09A 0%, #A38A5F 100%)",
};

export function CoverArt({
  tone,
  pattern = "dots",
  icon,
  label,
  className,
  children,
}: {
  tone: ArtTone;
  pattern?: "dots" | "weave";
  icon?: ReactNode;
  label?: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={cn("relative flex items-center justify-center overflow-hidden text-cream", className)}
      style={{ background: GRADIENTS[tone] }}
      aria-hidden
    >
      <div className={cn("absolute inset-0", pattern === "dots" ? "pattern-dots" : "pattern-weave")} />
      <div className="absolute -right-6 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-10 -left-6 h-28 w-28 rounded-full bg-black/10 blur-2xl" />
      {icon ? <div className="relative opacity-90 drop-shadow-sm">{icon}</div> : null}
      {label ? <span className="relative ml-2 text-sm font-semibold tracking-wide opacity-90">{label}</span> : null}
      {children}
    </div>
  );
}
