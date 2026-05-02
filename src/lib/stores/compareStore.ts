"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { toast } from "sonner";
import type { CompareSnapshot } from "@/lib/compare/listingToCompareSnapshot";
import { COMPARE_STORE_STORAGE_KEY } from "@shared/const";

const MAX_COMPARE = 5;

type CompareState = {
  entries: CompareSnapshot[];
  drawerOpen: boolean;
  toggle: (item: CompareSnapshot) => void;
  remove: (id: string) => void;
  clear: () => void;
  setDrawerOpen: (open: boolean) => void;
  openDrawer: () => void;
};

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      entries: [],
      drawerOpen: false,

      toggle: (item) => {
        const { entries } = get();
        const exists = entries.some((e) => e.id === item.id);
        if (exists) {
          set({ entries: entries.filter((e) => e.id !== item.id) });
          return;
        }
        if (entries.length >= MAX_COMPARE) {
          toast.error("Compare up to 5 listings — remove one to add another.");
          return;
        }
        set({ entries: [...entries, item] });
      },

      remove: (id) =>
        set((s) => ({
          entries: s.entries.filter((e) => e.id !== id),
        })),

      clear: () => set({ entries: [] }),

      setDrawerOpen: (drawerOpen) => set({ drawerOpen }),

      openDrawer: () => set({ drawerOpen: true }),
    }),
    {
      name: COMPARE_STORE_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ entries: state.entries }),
    },
  ),
);

export function useCompareCount() {
  return useCompareStore((s) => s.entries.length);
}

export function useIsInCompare(id: string) {
  return useCompareStore((s) => s.entries.some((e) => e.id === id));
}
