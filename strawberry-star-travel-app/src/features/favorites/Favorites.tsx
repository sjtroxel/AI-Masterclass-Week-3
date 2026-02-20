import React from "react";
import { useFavorites } from "../../hooks/useFavorites";
import FavoritesItem from "./FavoritesItem";
import starsDataJson from "../stars/data/stars.json";
import Starfield from "../../components/Starfield"; 
import type { Star } from "../stars/Star";

export default function Favorites() {
  const { favorites, removeFavorite } = useFavorites();
  const starsData = starsDataJson as Star[];

  // Convert favorites array to full star objects from JSON
  const favoriteStars = React.useMemo(() => {
    return starsData.filter((star) => favorites.includes(star.id));
  }, [favorites, starsData]);

  // Search & Sorting Controls
  const [searchQuery, setSearchQuery] = React.useState("");
  const [sortBy, setSortBy] = React.useState<
    | {
        key: "distanceLy" | "apparentMagnitude" | "name" | "spectralType";
        direction: "asc" | "desc";
      } | null>(null);

  const filteredStars = React.useMemo(() => {
    let results = [...favoriteStars];
    // Search
    if (searchQuery.trim()) {
      results = results.filter((star) =>
        star.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    // Sorting
    if (sortBy) {
      results.sort((a, b) => {
        if (sortBy.key === "name") {
          const nameA = a.name?.trim() || "";
          const nameB = b.name?.trim() || "";
          const aHasName = nameA.length > 0;
          const bHasName = nameB.length > 0;
          // If A has no name → push after B
          if (!aHasName && bHasName) return 1;
          // If B has no name → push after A
          if (!bHasName && aHasName) return -1;
          // If both have names → normal alphabetical sort
          if (aHasName && bHasName) {
            return sortBy.direction === "asc"
              ? nameA.localeCompare(nameB)
              : nameB.localeCompare(nameA);
          }
          // If both unnamed → equal
          return 0;
        }
        const A = a[sortBy.key]!;
        const B = b[sortBy.key]!;
        if (A < B) return sortBy.direction === "asc" ? -1 : 1;
        if (A > B) return sortBy.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return results;
  }, [favoriteStars, searchQuery, sortBy]);

  const loading = false; 

  return (
    <main className="relative w-full min-h-screen overflow-x-hidden text-white pt-20">

      {/* Dark Purple Starfield */}
      <Starfield gradient="from-black to-purple-950" />

      {/* Main Content */}
      <section className="relative z-10 p-4 max-w-6xl mx-auto">

        {/* Title / Header With Fixed Padding */}
        <h1
          className="
            text-3xl sm:text-4xl font-extrabold mb-6 pb-2 mt-2
            text-center tracking-wide
            bg-linear-to-r from-purple-300 via-fuchsia-400 to-purple-300
            bg-clip-text text-transparent drop-shadow-[0_0_5px_rgba(0,225,255,0.7)]
            animate-fadeIn"
        >
          Your Favorite Stars
        </h1>

        <p
          className="
            text-fuchsia-200 text-md italic mb-6 mt-1 pb-2 font-semibold text-center opacity-0
            animate-fadeIn"
          style={{ animationDelay: "0.4s" }}
        >
          Saving the brightest points in your universe!
        </p>


        {/* Controls (Search + Sort) */}
        <div
          className="
            flex flex-col sm:flex-row flex-wrap gap-3 mb-5
            bg-white/5 backdrop-blur-xl p-3 rounded-xl border border-purple-400/20
            shadow-lg animate-fadeIn-delayed
          "
        >
          {/* Search */}
          <input
            type="text"
            placeholder="Search your favorites..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="
              p-2 rounded flex-1 bg-black/40 text-rose-100 placeholder-rose-400
              border border-purple-700/40 focus:border-fuchsia-400
            "
          />

          {/* Sorting */}
          <select
            value={sortBy ? `${sortBy.key}:${sortBy.direction}` : ""}
            onChange={(e) => {
              if (!e.target.value) return setSortBy(null);
              const [key, direction] = e.target.value.split(":") as [
                "distanceLy" | "apparentMagnitude" | "name" | "spectralType",
                "asc" | "desc"
              ];
              setSortBy({ key, direction });
            }}
            className="
              p-2 rounded flex-1 bg-black/40 text-rose-300 border border-purple-700/40
              focus:border-fuchsia-400
            "
          >
            <option value="">No Sorting</option>
            <option value="distanceLy:asc">Distance ↑</option>
            <option value="distanceLy:desc">Distance ↓</option>
            <option value="apparentMagnitude:asc">Brightness ↑</option>
            <option value="apparentMagnitude:desc">Brightness ↓</option>
            <option value="name:asc">Name A–Z</option>
            <option value="name:desc">Name Z–A</option>
            <option value="spectralType:asc">Spectral Type A–Z</option>
            <option value="spectralType:desc">Spectral Type Z–A</option>
          </select>
        </div>

        {/* Loading Skeleton */}
        {loading ? (
          <p className="text-center text-cyan-200 animate-pulse text-lg">
            Loading your favorite stars...
          </p>
        ) : (
          <>
            {/* Favorites Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr animate-fadeIn-delayed-2">
              {filteredStars.map((star) => (
                <FavoritesItem key={star.id} star={star} removeFavorite={removeFavorite} />
              ))}
            </div>

            {/* Empty State */}
            {filteredStars.length === 0 && (
              <p className="text-center text-cyan-200 mt-10 text-xl">
                No favorite stars found.
              </p>
            )}
          </>
        )}
      </section>

      {/* Animations (same as StarsList) */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }

          .animate-fadeIn {
            animation: fadeIn 1s ease-out forwards;
          }

          .animate-fadeIn-delayed {
            animation: fadeIn 1.4s ease-out forwards;
          }

          .animate-fadeIn-delayed-2 {
            animation: fadeIn 1.8s ease-out forwards;
          }
        `}
      </style>
    </main>
  );
}
