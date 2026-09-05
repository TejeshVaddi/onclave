import type { ReactNode } from "react";
import type { Pillar } from "@/types";
import { cn } from "@/lib/utils";
import { PILLARS } from "@/lib/pillars";

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  pillar,
  as: Tag = "h2",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  pillar?: Pillar;
  as?: "h1" | "h2" | "h3";
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="min-w-0">
        {eyebrow ? (
          <p className={cn("mb-1 text-xs font-bold uppercase tracking-[0.14em]", pillar ? PILLARS[pillar].text : "text-brown-muted")}>{eyebrow}</p>
        ) : null}
        <Tag className={cn("font-semibold tracking-tight text-brown text-balance", Tag === "h1" ? "text-3xl md:text-4xl" : Tag === "h2" ? "text-xl md:text-2xl" : "text-lg")}>{title}</Tag>
        {description ? <p className="mt-1 max-w-2xl text-sm text-brown-muted md:text-[15px]">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
