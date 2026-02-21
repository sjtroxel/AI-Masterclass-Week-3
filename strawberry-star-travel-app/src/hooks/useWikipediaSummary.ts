import React from "react";
import { fetchStarWikipediaSummary } from "../features/stars/services/wikipedia";
import type { WikipediaSummary } from "../features/stars/types/Wikipedia";
import type { Star } from "../features/stars/Star";

function cleanStarName(name: string): string {
  return name.replace(/\s+star$/i, "").trim();
}

export function useWikipediaSummary(star: Star, enabled: boolean) {
  const [data, setData] = React.useState<WikipediaSummary | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    if (!enabled || !star) return;

    const cleanName = star.name ? cleanStarName(star.name) : null;
    const candidates = [
      cleanName,
      cleanName ? `${cleanName} star` : null,
      `HIP ${star.designation}`,
    ].filter(Boolean) as string[];

    setLoading(true);
    setError(false);

    fetchStarWikipediaSummary(candidates)
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [star, enabled]);

  return { data, loading, error };
}