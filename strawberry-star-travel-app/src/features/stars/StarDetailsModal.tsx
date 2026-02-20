import React from "react";
import { createPortal } from "react-dom";
import type { Star } from "./Star";
import { spectralExplanation, estimateTemperature, travelTimeLy } from "./utils/astronomy";
import type { WikipediaSummary } from "./types/Wikipedia"; 
import { getConstellationName } from "./utils/constellation";

interface StarDetailsModalProps {
  star: Star;
  anchorRect: DOMRect;
  onClose: () => void;
  wikiData: {
    data: WikipediaSummary | null;
    loading: boolean;
    error: boolean;
  };
}

export default function StarDetailsModal({ star, anchorRect, onClose, wikiData }: StarDetailsModalProps) {
  const spectralInfo = spectralExplanation(star.spectralType);
  const temperature = estimateTemperature(star.spectralType);
  const travelYears = travelTimeLy(star.distanceLy, 0.1);
  const distancePc = star.distanceLy;
  const distanceLy = distancePc * 3.26156;

  const style: React.CSSProperties = {
    position: "absolute",
    top: window.scrollY + anchorRect.top,
    left: window.scrollX + anchorRect.left,
    width: anchorRect.width,
    maxHeight: 400,
    overflowY: "auto",
    zIndex: 9999,
  };

  const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!(e.target as HTMLElement).closest(".modal-content")) onClose();
  };

  return createPortal(
    <div style={style} onClick={handleOutsideClick} className="modal-content bg-linear-to-b from-blue-900/95 via-black/95 to-cyan-900/95 text-cyan-100 p-4 rounded-lg shadow-lg border border-cyan-600">
      {/* Close button */}
      <button onClick={onClose} aria-label="Close" className="absolute top-1 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-cyan-800/70 hover:bg-cyan-700 text-white text-lg font-bold">
        ✕
      </button>

      {/* Title */}
      <h2 className="text-xl font-extrabold mb-3 text-center bg-linear-to-r from-rose-300 via-pink-200 to-rose-400 bg-clip-text text-transparent">
        {star.name || "Unnamed Star"}
      </h2>

      {/* Core Details */}
      <ul className="text-sm text-cyan-100/95 mb-2 mt-1 space-y-1">
        <li><span className="font-semibold text-cyan-300">Designation:</span> {star.designation}</li>
        <li><span className="font-semibold text-cyan-300">Spectral Type:</span> {star.spectralType}</li>
        <li><span className="font-semibold text-cyan-300">Distance:</span> {distanceLy.toFixed(2)} ly ({distancePc.toFixed(2)} pc)</li>
        <li><span className="font-semibold text-cyan-300">Constellation:</span> {getConstellationName(star.constellation)}</li>
        <li><span className="font-semibold text-cyan-300">Apparent Magnitude:</span> {star.apparentMagnitude}</li>
      </ul>

      {/* Science */}
      <ul className="text-sm text-lime-100/90 mb-2 space-y-1">
        {spectralInfo && <li><span className="font-semibold text-lime-100">Stellar Classification:</span> {spectralInfo}</li>}
        {temperature && <li><span className="font-semibold text-lime-100">Estimated Surface Temp:</span> ~{temperature.toLocaleString()} K</li>}
      </ul>

      {star.imageUrl && <img src={star.imageUrl} alt={star.name} className="w-full h-auto rounded-md border border-cyan-600/50 shadow mb-2" />}

      <p className="text-xs text-rose-300 italic">
        At 0.1c, a spacecraft would take ~{Math.round(travelYears).toLocaleString()} years to reach this star.
      </p>

      {/* Wikipedia Section */}
      <div className="mt-2 border-t border-cyan-700 pt-2">
        <h3 className="text-sm font-semibold text-cyan-200 mb-1 pb-1">
          Astronomical Context
        </h3>
        {wikiData.loading && (
          <p className="text-xs text-cyan-400 italic">Loading…</p>
        )}
        {wikiData.error && (
          <p className="text-xs text-cyan-500 italic">
            No Wikipedia article available.
          </p>
        )}
        {wikiData.data && (
          <>
            <p className="text-xs text-cyan-100 leading-relaxed">
              {wikiData.data.extract}
            </p>
            {/* Read more link */}
            <a
              href={`https://en.wikipedia.org/?curid=${wikiData.data.pageid}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block mt-2 text-pink-400 text-xs underline hover:text-pink-300"
            >
              Read more on Wikipedia →
            </a>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}

