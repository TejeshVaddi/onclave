import type { Pillar } from "@/types";

/**
 * Single source of truth for pillar identity: colour tokens, copy, routes.
 * Tailwind classes are listed literally so the compiler can see them.
 */
export interface PillarMeta {
  id: Pillar;
  label: string;
  tagline: string;
  description: string;
  href: "/community" | "/culture" | "/profession";
  hex: string;
  text: string;
  bg: string;
  bgSoft: string;
  border: string;
  ring: string;
  gradient: string;
}

export const PILLARS: Record<Pillar, PillarMeta> = {
  community: {
    id: "community",
    label: "Community",
    tagline: "Find your people.",
    description: "Find people and communities that share your background.",
    href: "/community",
    hex: "#075B0A",
    text: "text-green",
    bg: "bg-green",
    bgSoft: "bg-green-soft",
    border: "border-green",
    ring: "focus-visible:ring-green",
    gradient: "from-green to-green-deep",
  },
  culture: {
    id: "culture",
    label: "Culture",
    tagline: "Explore your roots.",
    description:
      "Discover recipes, places, traditions, and events connected to your heritage.",
    href: "/culture",
    hex: "#A43557",
    text: "text-berry",
    bg: "bg-berry",
    bgSoft: "bg-berry-soft",
    border: "border-berry",
    ring: "focus-visible:ring-berry",
    gradient: "from-berry to-berry-deep",
  },
  profession: {
    id: "profession",
    label: "Profession",
    tagline: "Build your future.",
    description: "Connect with professionals who can help you navigate your career.",
    href: "/profession",
    hex: "#B25C3A",
    text: "text-terracotta",
    bg: "bg-terracotta",
    bgSoft: "bg-terracotta-soft",
    border: "border-terracotta",
    ring: "focus-visible:ring-terracotta",
    gradient: "from-terracotta to-terracotta-deep",
  },
};

export const PILLAR_ORDER: Pillar[] = ["community", "culture", "profession"];
