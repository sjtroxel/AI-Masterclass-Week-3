import { useStars } from "../../hooks/useStars";
import StarItem from "./StarItem";
import { useFavorites } from "../../hooks/useFavorites";
import Starfield from "../../components/Starfield";
import { Constellations } from "./data/constellations";

export default function StarsList() {
  const {
    loading,
    visibleStars,
    totalStars,

    // filters
    searchQuery,
    spectralTypeFilter,
    constellationFilter,
    magnitudeFilter,

    // option lists
    spectralTypes,
    magnitudeOptions,

    // sorting
    sortBy,

    // setters
    setSearchQuery,
    setSpectralTypeFilter,
    setConstellationFilter,
    setMagnitudeFilter,
    setSortBy,

    // pagination + reset
    handleLoadMore,
    handleReset,
  } = useStars();

  const favorites = useFavorites();

  return (
    <main className="relative w-full min-h-screen overflow-x-hidden text-white pt-20">

      {/* Deep Ice Nebula Starfield */}
      <Starfield gradient="from-black via-blue-950 to-cyan-950" />

      {/* MAIN CONTENT */}
      <section className="relative z-10 p-4 max-w-6xl mx-auto">

        {/* Title */}
        <h1
          className="
            text-3xl sm:text-4xl font-extrabold mb-6 pb-3 text-center tracking-wide
            bg-linear-to-r from-cyan-300 via-blue-200 to-cyan-400
            bg-clip-text text-transparent drop-shadow-[0_0_5px_rgba(0,225,255,0.7)]
            animate-fadeIn
          "
        >
          Browse Stars
        </h1>

        {/* Controls */}
        <div
          className="
            flex flex-col sm:flex-row flex-wrap gap-3 mb-5
            bg-white/5 backdrop-blur-xl p-3 rounded-xl border border-cyan-400/20
            shadow-lg animate-fadeIn-delayed
          "
        >
          {/* Search */}
          <input
            type="text"
            placeholder="Search stars..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="
              p-2 rounded flex-1 bg-black/40 text-cyan-100 placeholder-gray-400
              border border-cyan-700/40 focus:border-cyan-400
            "
          />

          {/* Spectral Type */}
          <select
            value={spectralTypeFilter ?? ""}
            onChange={(e) => setSpectralTypeFilter(e.target.value || null)}
            className="
              p-2 rounded flex-1 bg-black/40 text-cyan-100 border border-cyan-700/40
              focus:border-cyan-400
            "
          >
            <option value="">All Spectral Types</option>
            {spectralTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          {/* Constellation */}
          <select
            value={constellationFilter ?? ""}
            onChange={(e) => setConstellationFilter(e.target.value || null)}
            className="
              p-2 rounded flex-1 bg-black/40 text-cyan-100 border border-cyan-700/40
              focus:border-cyan-400
            "
          >
            <option value="">All Constellations</option>
            {Object.entries(Constellations).map(([abbr, fullName]) => (
              <option key={abbr} value={abbr}>
                {fullName}
              </option>
            ))}
          </select>

          {/* Magnitude */}
          <select
            value={magnitudeFilter ?? ""}
            onChange={(e) =>
              setMagnitudeFilter(e.target.value ? Number(e.target.value) : null)
            }
            className="
              p-2 rounded flex-1 bg-black/40 text-cyan-100 border border-cyan-700/40
              focus:border-cyan-400
            "
          >
            <option value="">All Magnitudes</option>
            {magnitudeOptions.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

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
              p-2 rounded flex-1 bg-black/40 text-cyan-100 border border-cyan-700/40
              focus:border-cyan-400
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

          {/* Reset */}
          <button
            onClick={handleReset}
            className="
              px-4 py-1 rounded bg-cyan-800 hover:bg-cyan-700 text-white
              transition font-semibold
            "
          >
            Reset
          </button>
        </div>

        {/* Star Count */}
        <p
          className="
            text-cyan-200 text-lg mb-4 font-semibold text-center opacity-0 animate-fadeIn
          "
          style={{ animationDelay: "0.5s" }}
        >
          {totalStars.toLocaleString()}{" "}
          {totalStars === 1 ? "star" : "stars"} found
        </p>

        {/* Loading Skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(9)].map((_, i) => (
              <div
                key={i}
                className="h-32 bg-blue-900/30 animate-pulse rounded-md"
              ></div>
            ))}
          </div>
        ) : (
          <>
            {/* Star Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr animate-fadeIn-delayed-2">
              {visibleStars.map((star) => (
                <StarItem key={star.id} star={star} favorites={favorites} />
              ))}
            </div>

            {/* Load More */}
            {visibleStars.length < totalStars && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={handleLoadMore}
                  className="
                    px-4 py-2 rounded bg-blue-700 hover:bg-blue-600 text-white
                    transition font-semibold shadow-lg
                  "
                >
                  Load More
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Animations */}
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
