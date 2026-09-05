"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Small async-data hook for the mock services. `key` should change whenever
 * the inputs change (e.g. JSON.stringify(filters)); the latest request wins.
 */
export function useAsyncData<T>(loader: () => Promise<T>, key: string, opts?: { keepPrevious?: boolean }) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);
  const loaderRef = useRef(loader);

  // Keep the latest loader without making it a dependency of the fetch effect
  // below (callers pass a new inline function each render; only `key` should
  // trigger a re-fetch). Runs after every render, before the fetch effect.
  useEffect(() => {
    loaderRef.current = loader;
  });

  useEffect(() => {
    const id = ++requestId.current;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- kicking off an async fetch is exactly what this effect is for
    setLoading(true);
    setError(null);
    if (!opts?.keepPrevious) setData(null);
    loaderRef
      .current()
      .then((result) => {
        if (id === requestId.current) {
          setData(result);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (id === requestId.current) {
          setError(err instanceof Error ? err.message : "Something went wrong");
          setLoading(false);
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { data, loading, error };
}

export function useDebouncedValue<T>(value: T, ms = 250): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return debounced;
}

/** Toggle an item in a string array (immutable). */
export function toggleIn(list: string[], id: string): string[] {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}
