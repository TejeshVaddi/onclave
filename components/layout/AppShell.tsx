"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";
import { TopBar } from "./TopBar";

/** Full-bleed routes that hide the app chrome. */
const BARE_ROUTES = ["/onboarding"];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const bare = BARE_ROUTES.some((r) => pathname.startsWith(r));

  if (bare) {
    return <main id="main">{children}</main>;
  }

  return (
    <div className="min-h-dvh">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-brown focus:px-3 focus:py-2 focus:text-cream"
      >
        Skip to content
      </a>
      <Sidebar />
      <TopBar />
      <main id="main" className="md:pl-[260px]">
        <div className="mx-auto w-full max-w-6xl px-4 pb-28 pt-5 md:px-8 md:pb-16 md:pt-10">{children}</div>
      </main>
      <BottomNav />
    </div>
  );
}
