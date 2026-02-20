import React from "react";
import Fuse from "fuse.js";
import type { Star } from "../features/stars/Star";
import rawStars from "../features/stars/data/stars.json"

// Strongly typed stars array
const stars: Star[] = rawStars as Star[];

// Create Fuse instance once (not inside hook to avoid recreation)
const fuse = new Fuse(stars, {
  keys: ["name", "designation", "spectralType", "constellation"],
  threshold: 0.4,
});

// Utility: compute unique sorted spectral types
const spectralTypes = Array.from(
  new Set(stars.map((s) => s.spectralType))
).sort();

// Utility: compute unique sorted constellations
const constellations = Array.from(
  new Set(stars.map((s) => s.constellation))
)
  .filter((c) => c && c.trim() !== "")
  .sort();

// Utility: compute magnitude buckets (rounded)
const magnitudeOptions = Array.from(
  new Set(
    stars
      .map((s) => s.apparentMagnitude)
      .filter((m): m is number => typeof m === "number") // <-- fix
      .map((m) => Math.round(m))
  )
).sort((a, b) => a - b);


export function useStars() {
  // ---------- STATE ----------
  const [searchQuery, setSearchQuery] = React.useState("");
  const [spectralTypeFilter, setSpectralTypeFilter] = React.useState<string | null>(null);
  const [constellationFilter, setConstellationFilter] = React.useState<string | null>(null);
  const [magnitudeFilter, setMagnitudeFilter] = React.useState<number | null>(null);

  // Sorting category + direction
  const [sortBy, setSortBy] = React.useState<null | {
    key: "distanceLy" | "apparentMagnitude" | "name" | "spectralType";
    direction: "asc" | "desc";
  }>(null);

  // Pagination
  const [starsToShow, setStarsToShow] = React.useState(50);

  // Loading animation
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  // ---------- COMPUTE FILTERED + SORTED ----------

  const processedStars = React.useMemo(() => {
    let list = [...stars];

    // Fuzzy Search
    if (searchQuery.trim() !== "") {
      list = fuse.search(searchQuery).map((r) => r.item);
    }

    // Filter by spectral type
    if (spectralTypeFilter) {
      list = list.filter((s) => s.spectralType === spectralTypeFilter);
    }

    // Filter by constellation
    if (constellationFilter) {
      list = list.filter((s) => s.constellation === constellationFilter);
    }

    // Filter by magnitude (rounded match)
    if (magnitudeFilter !== null) {
    list = list.filter(
        (s) =>
        typeof s.apparentMagnitude === "number" &&
        Math.round(s.apparentMagnitude) === magnitudeFilter
    );
    }

    // Sorting
    if (sortBy) {
      const { key, direction } = sortBy;

      list.sort((a, b) => {
        const aVal = a[key] ?? "";
        const bVal = b[key] ?? "";

        if (typeof aVal === "string" && typeof bVal === "string") {
          return direction === "asc"
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }
        return direction === "asc"
          ? (aVal as number) - (bVal as number)
          : (bVal as number) - (aVal as number);
      });
    }

    // Push unnamed stars to the end
    list.sort((a, b) => {
      const aHasName = a.name && a.name.trim() !== "";
      const bHasName = b.name && b.name.trim() !== "";
      return aHasName === bHasName ? 0 : aHasName ? -1 : 1;
    });

    return list;
  }, [
    searchQuery,
    spectralTypeFilter,
    constellationFilter,
    magnitudeFilter,
    sortBy
  ]);

  // ---------- PAGINATION ----------
  const visibleStars = React.useMemo(
    () => processedStars.slice(0, starsToShow),
    [processedStars, starsToShow]
  );

  const handleLoadMore = () => {
    setStarsToShow((prev) => prev + 50);
  };

  const handleReset = () => {
    setSearchQuery("");
    setSpectralTypeFilter(null);
    setConstellationFilter(null);
    setMagnitudeFilter(null);
    setSortBy(null);
    setStarsToShow(50);
  };

  // ---------- RETURN EVERYTHING THE COMPONENT NEEDS ----------

  return {
    loading,

    visibleStars,
    totalStars: processedStars.length,

    // filter values
    searchQuery,
    spectralTypeFilter,
    constellationFilter,
    magnitudeFilter,

    // option lists
    spectralTypes,
    constellations,
    magnitudeOptions,

    // sort value
    sortBy,

    // state setters to pass into UI
    setSearchQuery,
    setSpectralTypeFilter,
    setConstellationFilter,
    setMagnitudeFilter,
    setSortBy,

    handleLoadMore,
    handleReset,
  };
}
