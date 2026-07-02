"use client";

import { useEffect } from "react";
import { useFavoritesStore } from "@/store/favorites";

export function FavoritesSync() {
  const syncWithServer = useFavoritesStore((s) => s.syncWithServer);
  useEffect(() => { syncWithServer(); }, []);
  return null;
}
