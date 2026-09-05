import type { AvatarTone } from "@/types";
import { cn } from "@/lib/utils";

const TONES: Record<AvatarTone, string> = {
  berry: "bg-berry text-cream",
  terracotta: "bg-terracotta text-cream",
  green: "bg-green text-cream",
  brown: "bg-brown text-cream",
};

const SIZES = {
  sm: "h-9 w-9 text-xs",
  md: "h-12 w-12 text-sm",
  lg: "h-16 w-16 text-lg",
  xl: "h-24 w-24 text-2xl",
};

export function Avatar({ initials, tone, size = "md", className }: { initials: string; tone: AvatarTone; size?: keyof typeof SIZES; className?: string }) {
  return (
    <span
      className={cn("inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold tracking-wide ring-2 ring-cream", TONES[tone], SIZES[size], className)}
      aria-hidden
    >
      {initials}
    </span>
  );
}
