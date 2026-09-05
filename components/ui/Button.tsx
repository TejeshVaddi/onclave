"use client";

import Link from "next/link";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "community"
  | "culture"
  | "profession";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  external?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
}

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-brown text-cream hover:bg-[#362c26] active:bg-[#2b231e] shadow-soft",
  secondary: "bg-beige text-brown hover:bg-beige-deep active:bg-[#c9ad82]",
  outline: "border border-beige-deep bg-transparent text-brown hover:bg-beige-soft active:bg-beige",
  ghost: "bg-transparent text-brown hover:bg-beige-soft active:bg-beige",
  community: "bg-green text-cream hover:bg-green-deep shadow-soft",
  culture: "bg-berry text-cream hover:bg-berry-deep shadow-soft",
  profession: "bg-terracotta text-cream hover:bg-terracotta-deep shadow-soft",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-sm gap-1.5 rounded-xl",
  md: "h-11 px-5 text-sm gap-2 rounded-xl",
  lg: "h-12 px-6 text-base gap-2 rounded-2xl",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", href, external, loading, icon, iconRight, fullWidth, className, children, disabled, type, ...rest },
  ref,
) {
  const classes = cn(
    "inline-flex items-center justify-center font-semibold whitespace-nowrap transition-all duration-200 select-none",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brown focus-visible:ring-offset-2 focus-visible:ring-offset-cream",
    "disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]",
    VARIANTS[variant],
    SIZES[size],
    fullWidth && "w-full",
    className,
  );

  const content = (
    <>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : icon}
      {children}
      {iconRight}
    </>
  );

  if (href) {
    if (external) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
          {content}
        </a>
      );
    }
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button ref={ref} type={type ?? "button"} className={classes} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {content}
    </button>
  );
});
