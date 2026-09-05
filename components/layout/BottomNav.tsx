"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ACTIVE_TEXT, PRIMARY_NAV, isActivePath } from "./nav";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-beige/80 bg-cream/95 backdrop-blur md:hidden safe-bottom"
      aria-label="Main navigation"
    >
      <ul className="grid grid-cols-5">
        {PRIMARY_NAV.map((item) => {
          const active = isActivePath(pathname, item.href);
          const tone = item.pillar ?? "default";
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-colors",
                  "focus-visible:outline-none focus-visible:bg-beige-soft",
                  active ? ACTIVE_TEXT[tone] : "text-brown-faint",
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-12 items-center justify-center rounded-full transition-all",
                    active && (tone === "community" ? "bg-green-soft" : tone === "culture" ? "bg-berry-soft" : tone === "profession" ? "bg-terracotta-soft" : "bg-beige"),
                  )}
                >
                  <Icon className="h-5 w-5" aria-hidden strokeWidth={active ? 2.4 : 2} />
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
