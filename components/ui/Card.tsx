import type { HTMLAttributes, ReactNode } from "react";
import type { Pillar } from "@/types";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Adds a colored top accent bar for the pillar. */
  pillar?: Pillar;
  interactive?: boolean;
  padded?: boolean;
  as?: "div" | "article" | "section" | "li";
  children: ReactNode;
}

const ACCENT: Record<Pillar, string> = {
  community: "before:bg-green",
  culture: "before:bg-berry",
  profession: "before:bg-terracotta",
};

export function Card({ pillar, interactive, padded = true, as: Tag = "div", className, children, ...rest }: CardProps) {
  const Component = Tag as "div";
  return (
    <Component
      className={cn(
        "relative overflow-hidden rounded-2xl border border-beige/80 bg-white/55 shadow-soft transition-all duration-200",
        "before:absolute before:inset-x-0 before:top-0 before:h-1 before:content-['']",
        pillar ? ACCENT[pillar] : "before:bg-transparent",
        interactive && "hover:-translate-y-0.5 hover:shadow-lift hover:border-beige-deep",
        padded && "p-5",
        className,
      )}
      {...rest}
    >
      {children}
    </Component>
  );
}

export function Surface({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("rounded-3xl bg-beige-soft/80 p-5 md:p-7", className)} {...rest}>
      {children}
    </div>
  );
}
