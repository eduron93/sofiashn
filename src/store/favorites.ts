"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FavoritesStore {
  ids: string[];
  synced: boolean;
  toggle: (id: string) => void;
  isFavorite: (id: string) => boolean;
  count: () => number;
  syncWithServer: () => Promise<void>;
  setIds: (ids: string[]) => void;
}

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      ids: [],
      synced: false,

      setIds: (ids) => set({ ids, synced: true }),

      syncWithServer: async () => {
        try {
          const res = await fetch("/api/favoritos");
          if (!res.ok) return;
          const data = await res.json();
          if (Array.isArray(data.ids)) {
            set({ ids: data.ids, synced: true });
          }
        } catch {
          // sin sesión — usa localStorage
        }
      },

      toggle: async (id) => {
        const ids = get().ids;
        const isFav = ids.includes(id);
        // optimistic update
        set({ ids: isFav ? ids.filter((i) => i !== id) : [...ids, id] });

        try {
          await fetch("/api/favoritos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId: id }),
          });
        } catch {
          // revert si falla
          set({ ids });
        }
      },

      isFavorite: (id) => get().ids.includes(id),
      count: () => get().ids.length,
    }),
    { name: "velora-favorites" }
  )
);
