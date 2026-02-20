import React from "react";
import { createPortal } from "react-dom";
import Strawberry from "../styles/Strawberry.png";
import type { Star } from "../features/stars/Star";

interface Props {
  star: Star;
  anchorRect: DOMRect;
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmRemoveModal({ star, anchorRect, isOpen, onConfirm, onCancel }: Props) {
  if (!isOpen) return null;

  const style: React.CSSProperties = {
    position: "absolute",
    top: window.scrollY + anchorRect.top,
    left: window.scrollX + anchorRect.left,
    width: anchorRect.width,
    maxWidth: 300,
    zIndex: 9999,
  };

  const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!(e.target as HTMLElement).closest(".modal-content")) onCancel();
  };

  return createPortal(
    <div
      style={style}
      onClick={handleOutsideClick}
      className="modal-content bg-violet-950/95 p-6 rounded-2xl shadow-2xl border border-fuchsia-500/40 text-fuchsia-100"
    >
      {/* Header with Strawberry cat */}
      <div className="flex items-center gap-3 mb-4">
        <img
          src={Strawberry}
          alt="Strawberry the cat"
          className="w-12 h-12 rounded-full border-2 border-fuchsia-400 shadow-md"
        />
        <h2 className="text-xl font-bold text-fuchsia-200">
          Mew! Mew! MEOW!
        </h2>
      </div>

      {/* Confirm text with conditional star name */}
      <p className="text-fuchsia-100 text-sm mb-6 pb-4">
        Are you sure you want to remove{" "}
        {star.name?.trim() ? (
          <span className="font-bold text-lime-200">{star.name}</span>
        ) : (
          "this star"
        )}{" "}
        from favorites?
      </p>

      {/* Action buttons */}
      <div className="flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="px-2 py-2 rounded bg-gray-600 hover:bg-gray-500 text-white"
        >
          No!!
        </button>
        <button
          onClick={onConfirm}
          className="px-3 py-2 rounded bg-fuchsia-500 hover:bg-fuchsia-400 text-white font-semibold"
        >
          Yes!!
        </button>
      </div>
    </div>,
    document.body
  );
}
