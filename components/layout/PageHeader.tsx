import type { ReactNode } from "react";
import type { Pillar } from "@/types";
import { PILLARS } from "@/lib/pillars";
import { cn } from "@/lib/utils";

/** Page-level header with a pillar-colored eyebrow. */
export function PageHeader({
  pillar,
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  pillar?: Pillar;
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  const meta = pillar ? PILLARS[pillar] : null;
  return (
    <header className={cn("mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-end md:justify-between", className)}>
      <div className="min-w-0">
        {(eyebrow || meta) && (
          <p className={cn("mb-2 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em]", meta ? meta.text : "text-brown-muted")}>
            {meta ? <span className={cn("h-2 w-2 rounded-full", meta.bg)} aria-hidden /> : null}
            {eyebrow ?? meta?.label}
          </p>
        )}
        <h1 className="text-3xl font-semibold tracking-tight text-brown text-balance md:text-4xl">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-brown-muted">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}
