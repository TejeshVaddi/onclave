import type { ReactNode } from "react";
import type { Pillar } from "@/types";
import { cn } from "@/lib/utils";

type Tone = Pillar | "neutral" | "beige" | "success";

const TONES: Record<Tone, string> = {
  community: "bg-green-soft text-green-deep",
  culture: "bg-berry-soft text-berry-deep",
  profession: "bg-terracotta-soft text-terracotta-deep",
  neutral: "bg-beige-soft text-brown-muted",
  beige: "bg-beige text-brown",
  success: "bg-green-soft text-green-deep",
};

export function Badge({ tone = "neutral", icon, className, children }: { tone?: Tone; icon?: ReactNode; className?: string; children: ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold leading-5", TONES[tone], className)}>
      {icon}
      {children}
    </span>
  );
}

export function Tag({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("inline-flex items-center rounded-md bg-beige-soft px-2 py-0.5 text-xs font-medium text-brown-muted", className)}>{children}</span>;
}
