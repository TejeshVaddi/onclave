import { Briefcase, Compass, Home, Sparkles, UserCircle2, Users, type LucideIcon } from "lucide-react";
import type { Pillar } from "@/types";

export interface NavItem {
  href: "/" | "/community" | "/culture" | "/profession" | "/profile" | "/discover";
  label: string;
  icon: LucideIcon;
  pillar?: Pillar;
}

export const PRIMARY_NAV: NavItem[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/community", label: "Community", icon: Users, pillar: "community" },
  { href: "/culture", label: "Culture", icon: Compass, pillar: "culture" },
  { href: "/profession", label: "Profession", icon: Briefcase, pillar: "profession" },
  { href: "/profile", label: "Profile", icon: UserCircle2 },
];

export const DISCOVER_NAV: NavItem = { href: "/discover", label: "AI Discovery", icon: Sparkles };

export function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export const ACTIVE_TEXT: Record<Pillar | "default", string> = {
  default: "text-brown",
  community: "text-green",
  culture: "text-berry",
  profession: "text-terracotta",
};

export const ACTIVE_BG: Record<Pillar | "default", string> = {
  default: "bg-beige",
  community: "bg-green-soft",
  culture: "bg-berry-soft",
  profession: "bg-terracotta-soft",
};
