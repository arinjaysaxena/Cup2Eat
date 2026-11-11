"use client";
import { useSyncExternalStore } from "react";

export type Tier = "high" | "low";

export interface AppState {
  /** First frame rendered with hero assets ready */
  ready: boolean;
  /** null = still detecting */
  webgl: boolean | null;
  tier: Tier;
  isMobile: boolean;
  reducedMotion: boolean;
  /** Collection: index hovered / selected (0..2). */
  focus: number;
  /** Whether the user is actively hovering a product (desktop) */
  focusActive: boolean;
  /** Current scene id for nav + indicator */
  scene: string;
}

type Listener = () => void;

function createStore<T extends object>(initial: T) {
  let state = initial;
  const listeners = new Set<Listener>();
  return {
    get: () => state,
    set: (partial: Partial<T>) => {
      let changed = false;
      for (const k in partial) if (partial[k] !== state[k]) changed = true;
      if (!changed) return;
      state = { ...state, ...partial };
      listeners.forEach((l) => l());
    },
    subscribe: (l: Listener) => {
      listeners.add(l);
      return () => {
        listeners.delete(l);
      };
    },
  };
}

export const appStore = createStore<AppState>({
  ready: false,
  webgl: null,
  tier: "high",
  isMobile: false,
  reducedMotion: false,
  focus: 1,
  focusActive: false,
  scene: "home",
});

export function useApp<K>(selector: (s: AppState) => K): K {
  return useSyncExternalStore(
    appStore.subscribe,
    () => selector(appStore.get()),
    () => selector(appStore.get()),
  );
}
