import React from "react";
import type { Star } from "../features/stars/Star";
import { useAuth } from "../app/context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
const DEMO_FAVORITES_KEY = "demoFavorites";

interface FavoritesResponse {
  starIds: number[];
}

interface ToggleResponse {
  favorited: boolean;
  starId: number;
}

export function useFavorites() {
  const { user, token, isDemoMode } = useAuth();

  const [favorites, setFavorites] = React.useState<number[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);

  // Load favorites on mount / when auth state changes
  React.useEffect(() => {
    if (isDemoMode) {
      // Demo mode: load from localStorage
      try {
        const stored = localStorage.getItem(DEMO_FAVORITES_KEY);
        setFavorites(stored ? (JSON.parse(stored) as number[]) : []);
      } catch {
        setFavorites([]);
      }
      setLoading(false);
      return;
    }

    if (!token) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/favorites`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          console.error("Error loading favorites:", res.status);
          return;
        }

        const data = (await res.json()) as FavoritesResponse;
        if (!cancelled) {
          setFavorites(data.starIds);
        }
      } catch (err) {
        console.error("Unexpected error loading favorites:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [token, isDemoMode]);

  const addFavorite = async (star: Star) => {
    if (isDemoMode) {
      // Demo mode: persist to localStorage
      setFavorites((prev) => {
        if (prev.includes(star.id)) return prev;
        const next = [...prev, star.id];
        localStorage.setItem(DEMO_FAVORITES_KEY, JSON.stringify(next));
        return next;
      });
      return;
    }

    if (!user || !token) {
      console.warn("Not logged in: cannot add favorite");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/favorites/toggle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ starId: star.id }),
      });

      if (!res.ok) {
        console.error("Error adding favorite:", res.status);
        return;
      }

      const data = (await res.json()) as ToggleResponse;
      if (data.favorited) {
        setFavorites((prev) => (prev.includes(star.id) ? prev : [...prev, star.id]));
      }
    } catch (err) {
      console.error("Unexpected error adding favorite:", err);
    }
  };

  const removeFavorite = async (starId: number) => {
    if (isDemoMode) {
      // Demo mode: remove from localStorage
      setFavorites((prev) => {
        const next = prev.filter((id) => id !== starId);
        localStorage.setItem(DEMO_FAVORITES_KEY, JSON.stringify(next));
        return next;
      });
      return;
    }

    if (!user || !token) {
      console.warn("Not logged in: cannot remove favorite");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/favorites/toggle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ starId }),
      });

      if (!res.ok) {
        console.error("Error removing favorite:", res.status);
        return;
      }

      const data = (await res.json()) as ToggleResponse;
      if (!data.favorited) {
        setFavorites((prev) => prev.filter((id) => id !== starId));
      }
    } catch (err) {
      console.error("Unexpected error removing favorite:", err);
    }
  };

  const isFavorite = (starId: number) => favorites.includes(starId);

  return {
    favorites,
    loading,
    addFavorite,
    removeFavorite,
    isFavorite,
  };
}
