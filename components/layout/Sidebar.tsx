"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Logo } from "./Logo";
import { ACTIVE_BG, ACTIVE_TEXT, DISCOVER_NAV, PRIMARY_NAV, isActivePath } from "./nav";
import { Avatar } from "@/components/ui/Avatar";
import { useAppState } from "@/components/providers/AppStateProvider";
import { formatLocation } from "@/services/geocodeService";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAppState();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[260px] flex-col border-r border-beige/80 bg-cream/95 backdrop-blur md:flex" aria-label="Primary">
      <div className="px-6 pb-4 pt-7">
        <Logo />
        <p className="mt-2 text-xs font-medium text-brown-muted">Find your people. Explore your roots. Build your future.</p>
      </div>

      <nav className="flex-1 space-y-1 px-3" aria-label="Main navigation">
        {PRIMARY_NAV.map((item) => {
          const active = isActivePath(pathname, item.href);
          const tone = item.pillar ?? "default";
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brown",
                active ? cn(ACTIVE_BG[tone], ACTIVE_TEXT[tone]) : "text-brown-muted hover:bg-beige-soft hover:text-brown",
              )}
            >
              <Icon className={cn("h-5 w-5 transition-transform group-hover:scale-105", active && ACTIVE_TEXT[tone])} aria-hidden />
              {item.label}
              {item.pillar ? (
                <span
                  className={cn(
                    "ml-auto h-2 w-2 rounded-full transition-opacity",
                    item.pillar === "community" ? "bg-green" : item.pillar === "culture" ? "bg-berry" : "bg-terracotta",
                    active ? "opacity-100" : "opacity-40 group-hover:opacity-70",
                  )}
                  aria-hidden
                />
              ) : null}
            </Link>
          );
        })}

        <div className="pt-4">
          <Link
            href={DISCOVER_NAV.href}
            aria-current={isActivePath(pathname, DISCOVER_NAV.href) ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brown",
              isActivePath(pathname, DISCOVER_NAV.href)
                ? "border-brown bg-brown text-cream shadow-soft"
                : "border-beige-deep bg-beige-soft/60 text-brown hover:border-brown hover:bg-beige-soft",
            )}
          >
            <Sparkles className="h-5 w-5" aria-hidden />
            AI Discovery
          </Link>
        </div>
      </nav>

      <div className="border-t border-beige/80 p-4">
        <Link
          href="/profile"
          className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-beige-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brown"
        >
          <Avatar initials={user.initials} tone={user.avatarTone} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-brown">{user.name}</p>
            <p className="truncate text-xs text-brown-muted">{formatLocation(user.location)}</p>
          </div>
        </Link>
      </div>
    </aside>
  );
}
