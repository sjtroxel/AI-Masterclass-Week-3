import React from "react";
import { fetchStarWikipediaSummary } from "../features/stars/services/wikipedia";
import type { WikipediaSummary } from "../features/stars/types/Wikipedia";
import type { Star } from "../features/stars/Star";

export function useWikipediaSummary(star: Star) {
  const [data, setData] = React.useState<WikipediaSummary | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    if (!star) return;

    const candidates = [
      star.name ? `${star.name} star` : null,
      star.name ?? null,
      `HIP ${star.designation} star`,
    ].filter(Boolean) as string[];

    setLoading(true);
    setError(false);

    fetchStarWikipediaSummary(candidates)
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [star]);

  return { data, loading, error };
}