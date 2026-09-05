"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Logo } from "./Logo";
import { Avatar } from "@/components/ui/Avatar";
import { useAppState } from "@/components/providers/AppStateProvider";
import { cn } from "@/lib/utils";

export function TopBar() {
  const { user } = useAppState();
  const pathname = usePathname();
  const onDiscover = pathname.startsWith("/discover");
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-beige/80 bg-cream/95 px-4 backdrop-blur md:hidden">
      <Logo />
      <div className="flex items-center gap-2">
        <Link
          href="/discover"
          aria-label="AI Discovery"
          aria-current={onDiscover ? "page" : undefined}
          className={cn(
            "inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brown",
            onDiscover ? "border-brown bg-brown text-cream" : "border-beige-deep bg-beige-soft/70 text-brown hover:bg-beige-soft",
          )}
        >
          <Sparkles className="h-4 w-4" aria-hidden />
          Discover
        </Link>
        <Link href="/profile" aria-label="Profile" className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brown">
          <Avatar initials={user.initials} tone={user.avatarTone} size="sm" />
        </Link>
      </div>
    </header>
  );
}
