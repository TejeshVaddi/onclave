"use client";

import { forwardRef, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

const base =
  "w-full rounded-xl border bg-cream px-4 text-base text-brown placeholder:text-brown-faint transition focus:outline-none focus:ring-2 focus:ring-brown/80 focus:border-brown md:text-sm";

interface FieldProps {
  label?: string;
  hint?: string;
  error?: string;
  id?: string;
}

function Field({ label, hint, error, id, children }: FieldProps & { children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      {label ? (
        <label htmlFor={id} className="block text-sm font-semibold text-brown">
          {label}
        </label>
      ) : null}
      {children}
      {error ? (
        <p id={id ? `${id}-error` : undefined} role="alert" className="text-xs font-medium text-berry">
          {error}
        </p>
      ) : hint ? (
        <p id={id ? `${id}-hint` : undefined} className="text-xs text-brown-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & FieldProps>(function Input(
  { label, hint, error, id, className, ...rest },
  ref,
) {
  return (
    <Field label={label} hint={hint} error={error} id={id}>
      <input
        ref={ref}
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error && id ? `${id}-error` : hint && id ? `${id}-hint` : undefined}
        className={cn(base, "h-11", error ? "border-berry" : "border-beige-deep", className)}
        {...rest}
      />
    </Field>
  );
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & FieldProps>(function Textarea(
  { label, hint, error, id, className, ...rest },
  ref,
) {
  return (
    <Field label={label} hint={hint} error={error} id={id}>
      <textarea
        ref={ref}
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error && id ? `${id}-error` : hint && id ? `${id}-hint` : undefined}
        className={cn(base, "min-h-28 resize-y py-3", error ? "border-berry" : "border-beige-deep", className)}
        {...rest}
      />
    </Field>
  );
});

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement> & FieldProps>(function Select(
  { label, hint, error, id, className, children, ...rest },
  ref,
) {
  return (
    <Field label={label} hint={hint} error={error} id={id}>
      <div className="relative">
        <select
          ref={ref}
          id={id}
          aria-invalid={error ? true : undefined}
          className={cn(base, "h-11 appearance-none pr-10", error ? "border-berry" : "border-beige-deep", className)}
          {...rest}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brown-faint" aria-hidden />
      </div>
    </Field>
  );
});

interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
}

export function SearchInput({ value, onChange, onClear, className, ...rest }: SearchInputProps) {
  return (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brown-faint" aria-hidden />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(base, "h-11 border-beige-deep pl-10 pr-10 [&::-webkit-search-cancel-button]:hidden")}
        {...rest}
      />
      {value ? (
        <button
          type="button"
          onClick={() => {
            onChange("");
            onClear?.();
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-brown-faint transition hover:bg-beige-soft hover:text-brown"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      ) : null}
    </div>
  );
}
