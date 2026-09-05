"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Check } from "lucide-react";
import type { Pillar } from "@/types";
import { cn } from "@/lib/utils";

interface ChipProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onToggle"> {
  selected?: boolean;
  pillar?: Pillar;
  icon?: ReactNode;
  size?: "sm" | "md";
  showCheck?: boolean;
}

const SELECTED: Record<Pillar | "default", string> = {
  default: "bg-brown text-cream border-brown",
  community: "bg-green text-cream border-green",
  culture: "bg-berry text-cream border-berry",
  profession: "bg-terracotta text-cream border-terracotta",
};

export function Chip({ selected, pillar, icon, size = "md", showCheck = true, className, children, ...rest }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border font-medium transition-all duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brown focus-visible:ring-offset-2 focus-visible:ring-offset-cream",
        size === "sm" ? "h-8 px-3 text-xs" : "h-9 px-3.5 text-sm",
        selected
          ? SELECTED[pillar ?? "default"]
          : "border-beige-deep bg-cream text-brown hover:border-brown-faint hover:bg-beige-soft",
        className,
      )}
      {...rest}
    >
      {selected && showCheck ? <Check className="h-3.5 w-3.5" aria-hidden /> : icon}
      {children}
    </button>
  );
}

/** Horizontal scroll container for chips on mobile, wraps on desktop. */
export function ChipRow({ children, className, wrap = true }: { children: ReactNode; className?: string; wrap?: boolean }) {
  return (
    <div
      className={cn(
        "flex gap-2",
        wrap ? "flex-wrap" : "overflow-x-auto scrollbar-none -mx-4 px-4 pb-1 md:mx-0 md:px-0 md:flex-wrap md:overflow-visible",
        className,
      )}
    >
      {children}
    </div>
  );
}
