import { useState, useRef } from "react";
import type { Star } from "./Star";
import { useWikipediaSummary } from "../../hooks/useWikipediaSummary";
import StarDetailsModal from "./StarDetailsModal";
import { getConstellationName } from "./utils/constellation";

interface StarItemProps {
  star: Star;
  favorites: {
    addFavorite: (star: Star) => void;
    removeFavorite: (id: number) => void;
    isFavorite: (id: number) => boolean;
    loading: boolean;
    favorites: number[];
  };
}

export default function StarItem({ star, favorites }: StarItemProps) {
  const { addFavorite, removeFavorite, isFavorite } = favorites;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);

  // Always call hooks unconditionally — this is now safe.
  const wikiData = useWikipediaSummary(star);

  const displayName =
    star.name && star.name.trim() !== "" ? star.name : "Unnamed Star";

  const handleFavoriteClick = () => {
    if (isFavorite(star.id)) removeFavorite(star.id);
    else addFavorite(star);
  };

  const handleDetailsClick = () => {
    if (!cardRef.current) return;

    // Capture card position *at the moment of clicking*
    const rect = cardRef.current.getBoundingClientRect();
    setAnchorRect(rect);
    setIsModalOpen(true);
  };

  const PARSEC_TO_LIGHTYEAR = 3.26156;
  const distanceInLy = star.distanceLy * PARSEC_TO_LIGHTYEAR;

  return (
    <>
      <div
        ref={cardRef}
        className="
          h-full flex flex-col 
          bg-white/25 backdrop-blur-xl 
          p-4 rounded-xl shadow-lg 
          border border-blue-900/40 
          m-2 transform transition-transform duration-300 
          hover:scale-[1.03] 
          hover:shadow-[0_0_18px_rgba(0,180,255,0.45)] 
          relative
        "
      >

        <h2
          className={
            star.name && star.name.trim() !== ""
              ? "text-2xl font-bold text-emerald-400 mb-4 pb-2 drop-shadow-sm"
              : "text-2xl italic text-slate-400 pb-2 mb-4"
          }
        >
          {displayName}
        </h2>

        <ul className="text-slate-200 text-sm space-y-1 flex-1">
          <li>
            <span className="font-semibold text-slate-300">Designation:</span>{" "}
            {star.designation}
          </li>
          <li>
            <span className="font-semibold text-slate-300">Spectral Type:</span>{" "}
            {star.spectralType}
          </li>
          <li>
            <span className="font-semibold text-slate-300">Distance:</span>{" "}
            {distanceInLy.toFixed(2)} ly ({star.distanceLy.toFixed(2)} pc)
          </li>
          <li>
            <span className="font-semibold text-slate-300">Constellation:</span>{" "}
            {getConstellationName(star.constellation)}
          </li>
          <li>
            <span className="font-semibold text-slate-300">
              Apparent Magnitude:
            </span>{" "}
            {star.apparentMagnitude}
          </li>

          {star.imageUrl && (
            <li className="mt-1">
              <img
                src={star.imageUrl}
                alt={displayName}
                className="w-full h-auto rounded-md border border-blue-700/40 shadow"
              />
            </li>
          )}
        </ul>

        <div className="mt-2 flex gap-2">
          <button
            onClick={handleDetailsClick}
            className="
              flex-1 px-3 py-2 rounded-lg 
              bg-blue-900/80 hover:bg-blue-800 
              text-sm font-semibold text-slate-100 
              transition
            "
          >
            🔍 Details
          </button>

          <button
            onClick={handleFavoriteClick}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition ${
              isFavorite(star.id)
                ? "bg-rose-700/80 hover:bg-rose-600/80 text-white"
                : "bg-blue-950/80 hover:bg-blue-900/80 text-rose-200"
            }`}
          >
            {isFavorite(star.id) ? "💔 Remove" : "💖 Save"}
          </button>
        </div>
      </div>

      {/* ---- MODAL PORTAL ---- */}
      {isModalOpen && anchorRect && (
        <StarDetailsModal
          star={star}
          anchorRect={anchorRect}
          onClose={() => setIsModalOpen(false)}
          wikiData={wikiData}
        />
      )}
    </>
  );
}