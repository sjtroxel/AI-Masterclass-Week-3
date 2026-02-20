import React from "react";
import { supabase } from "../supabaseClient";
import type { Star } from "../features/stars/Star";
import { useUser } from "./useUser";

  // Types

interface FavoriteRow {
  star_id: string;
}

interface SupabaseError {
  code?: string;
  message?: string;
}

export function useFavorites() {
  const { user } = useUser();

  // State for favorites
  const [favorites, setFavorites] = React.useState<number[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  
  // Load user's favorites from Supabase
  React.useEffect(() => {
    if (!user) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("user_favorites")
          .select("star_id")
          .eq("user_id", user.id);

        if (error) {
          console.error("Error loading favorites:", error);
        } else if (!cancelled && data) {
          const rows = data as FavoriteRow[];
          const ids = rows
            .map((r) => {
              // Try to parse numeric id, fall back to NaN
              const parsed = Number(r.star_id);
              return Number.isFinite(parsed) ? parsed : null;
            })
            .filter((n): n is number => n !== null);

          setFavorites(ids);
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
  }, [user]);

  // Add a favorite (stores star_id as string in DB)
  const addFavorite = async (star: Star) => {
    if (!user) {
      console.warn("Not logged in: cannot add favorite");
      return;
    }

    try {
      const { error } = await supabase
        .from("user_favorites")
        .insert({
          user_id: user.id,
          star_id: String(star.id),
        });

      if (error) {
        const e = error as SupabaseError;
        // silently ignore duplicate insert
        if (e.code === "PGRST116" || e.message?.includes("duplicate")) {
          return;
        }
         console.error("Error inserting favorite:", e);
      } else {
        setFavorites((prev) => (prev.includes(star.id) ? prev : [...prev, star.id]));
      }
    } catch (err) {
      console.error("Unexpected error adding favorite:", err);
    }
  };

  // Remove a favorite
  const removeFavorite = async (starId: number) => {
    if (!user) {
      console.warn("Not logged in: cannot remove favorite");
      return;
    }

    try {
      const { error } = await supabase
        .from("user_favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("star_id", String(starId));

      if (error) {
        console.error("Error deleting favorite:", error);
      } else {
        setFavorites((prev) => prev.filter((id) => id !== starId));
      }
    } catch (err) {
      console.error("Unexpected error removing favorite:", err);
    }
  };

  const isFavorite = (starId: number) => favorites.includes(starId);

  return {
    favorites,       // number[] of star ids
    loading,
    addFavorite,
    removeFavorite,
    isFavorite,
  };
}