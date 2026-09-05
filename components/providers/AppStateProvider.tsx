"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { User } from "@/types";
import { DEMO_USER } from "@/data/demoUser";
import { clearStorage, readStorage, writeStorage } from "@/lib/storage";

export interface ConnectionRequest {
  mentorId: string;
  message: string;
  sentAt: string;
}

interface PersistedState {
  user: User;
  savedCommunityIds: string[];
  savedEventIds: string[];
  savedRecipeIds: string[];
  connectionRequests: Record<string, ConnectionRequest>;
}

export interface AppState extends PersistedState {
  /** True once localStorage has been read on the client. */
  hydrated: boolean;
  updateUser: (patch: Partial<User>) => void;
  toggleSavedCommunity: (id: string) => boolean;
  toggleSavedEvent: (id: string) => boolean;
  toggleSavedRecipe: (id: string) => boolean;
  requestConnection: (mentorId: string, message: string) => void;
  hasRequested: (mentorId: string) => boolean;
  resetDemo: () => void;
}

const STORAGE_KEY = "state";

const defaultPersisted: PersistedState = {
  user: DEMO_USER,
  savedCommunityIds: ["c-nsa-gmu", "c-nigeria-reddit"],
  savedEventIds: [],
  savedRecipeIds: [],
  connectionRequests: {},
};

const AppStateContext = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedState>(defaultPersisted);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage after mount (avoids SSR mismatch). This is a
  // one-time sync with an external system (the browser's storage), which is
  // exactly what effects are for, so the setState-in-effect rule is disabled here.
  useEffect(() => {
    const saved = readStorage<PersistedState | null>(STORAGE_KEY, null);
    if (saved?.user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState({ ...defaultPersisted, ...saved, user: { ...DEMO_USER, ...saved.user } });
    }
    setHydrated(true);
  }, []);

  // Persist whenever state changes (after hydration).
  useEffect(() => {
    if (hydrated) writeStorage(STORAGE_KEY, state);
  }, [state, hydrated]);

  const updateUser = useCallback((patch: Partial<User>) => {
    setState((s) => ({ ...s, user: { ...s.user, ...patch, updatedAt: new Date().toISOString() } }));
  }, []);

  const toggleSavedCommunity = useCallback(
    (id: string) => {
      const willSave = !state.savedCommunityIds.includes(id);
      setState((s) => ({
        ...s,
        savedCommunityIds: willSave ? [...s.savedCommunityIds, id] : s.savedCommunityIds.filter((x) => x !== id),
      }));
      return willSave;
    },
    [state.savedCommunityIds],
  );
  const toggleSavedEvent = useCallback(
    (id: string) => {
      const willSave = !state.savedEventIds.includes(id);
      setState((s) => ({
        ...s,
        savedEventIds: willSave ? [...s.savedEventIds, id] : s.savedEventIds.filter((x) => x !== id),
      }));
      return willSave;
    },
    [state.savedEventIds],
  );
  const toggleSavedRecipe = useCallback(
    (id: string) => {
      const willSave = !state.savedRecipeIds.includes(id);
      setState((s) => ({
        ...s,
        savedRecipeIds: willSave ? [...s.savedRecipeIds, id] : s.savedRecipeIds.filter((x) => x !== id),
      }));
      return willSave;
    },
    [state.savedRecipeIds],
  );

  const requestConnection = useCallback((mentorId: string, message: string) => {
    setState((s) => ({
      ...s,
      connectionRequests: {
        ...s.connectionRequests,
        [mentorId]: { mentorId, message, sentAt: new Date().toISOString() },
      },
    }));
  }, []);

  const hasRequested = useCallback((mentorId: string) => Boolean(state.connectionRequests[mentorId]), [state.connectionRequests]);

  const resetDemo = useCallback(() => {
    clearStorage();
    setState(defaultPersisted);
  }, []);

  const value = useMemo<AppState>(
    () => ({
      ...state,
      hydrated,
      updateUser,
      toggleSavedCommunity,
      toggleSavedEvent,
      toggleSavedRecipe,
      requestConnection,
      hasRequested,
      resetDemo,
    }),
    [state, hydrated, updateUser, toggleSavedCommunity, toggleSavedEvent, toggleSavedRecipe, requestConnection, hasRequested, resetDemo],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppState {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}

export function useUser(): User {
  return useAppState().user;
}
