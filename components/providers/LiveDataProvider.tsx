"use client";

import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { useAppState } from "@/components/providers/AppStateProvider";
import { liveStore, type SyncStatus } from "@/services/liveStore";
import { syncProfileData } from "@/services/liveSync";

/** Re-renders when verified results arrive, so lists can include them. */
export function useLiveVersion(): number {
  return useSyncExternalStore(liveStore.subscribe, liveStore.getVersion, () => 0);
}

export function useLiveStatus(): SyncStatus {
  useLiveVersion();
  return liveStore.status;
}

/**
 * Loads what earlier visits found, then searches for anything this profile
 * has no recent results for: the person's heritages, location, and field.
 */
export function LiveDataProvider({ children }: { children: ReactNode }) {
  const { user, hydrated } = useAppState();

  useEffect(() => {
    liveStore.hydrate();
  }, []);

  const profileKey = [user.onboardingComplete, user.location.city, user.location.state, user.heritages.join(","), user.profession].join("|");
  useEffect(() => {
    if (hydrated) void syncProfileData(user);
    // The profile key covers every field the searches depend on.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, profileKey]);

  return <>{children}</>;
}
