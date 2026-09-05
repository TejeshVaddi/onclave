/** Join class names, skipping falsy values. Tiny stand-in for clsx. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

/** Sleep helper used by the mock services to simulate network latency. */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Title-case a slug: "software-engineering" -> "Software Engineering". */
export function titleCase(slug: string): string {
  return slug
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

/** Stable, deterministic shuffle-free "pick first N" that respects ordering. */
export function take<T>(arr: T[], n: number): T[] {
  return arr.slice(0, n);
}

export function uniq<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}
