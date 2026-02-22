import React from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars, PerspectiveCamera } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { Vector3 } from "three";
import { useFavorites } from "../../hooks/useFavorites";
import { loadStarsByIds } from "../../lib/starCatalog";
import type { StarCatalogEntry } from "../../lib/starCatalog";
// import type only — no runtime coupling. TODO: move Star to src/types/ to avoid cross-feature import.
import type { Star } from "../stars/Star";
import ConfirmRemoveModal from "../../components/ConfirmRemoveModal";
import PingFoot from "../../styles/PingFoot.png";

// Scale: 1 light year → 0.05 scene units (20 ly ≈ 1 grid square)
const LY_TO_SCENE = 0.05;

// ── Types ────────────────────────────────────────────────────────────────────

// coords = real HYG light-year values; scene position is derived from them
type StarterStar = {
  name: string;
  coords: [number, number, number];
  color: string;
  distanceLy: number;
};

// id is present for catalog stars; absent for hardcoded starter stars
type SelectedStar = {
  id?: number;
  name: string;
  distanceLy: number;
  coords: [number, number, number];
};

// ── Static data ───────────────────────────────────────────────────────────────

const HABITABLE_STARTER_STARS: StarterStar[] = [
  { name: "Sun", coords: [0, 0, 0], color: "yellow", distanceLy: 0 },
  { name: "Proxima Centauri", coords: [-1.03, 1.22, -3.93], color: "red", distanceLy: 4.24 },
  { name: "Alpha Centauri A", coords: [-1.64, 1.37, -3.83], color: "yellow", distanceLy: 4.37 },
  { name: "Tau Ceti", coords: [-2.02, -1.93, -11.51], color: "yellow", distanceLy: 11.89 },
  { name: "TRAPPIST-1", coords: [-33.2, 18.2, -14.1], color: "red", distanceLy: 40.9 },
  { name: "Teegarden's Star", coords: [3.05, -7.53, -9.43], color: "red", distanceLy: 12.47 },
];

const STARTER_NAMES = new Set(
  HABITABLE_STARTER_STARS.map((s) => s.name.toLowerCase())
);

// ── Helpers ───────────────────────────────────────────────────────────────────

function toScenePos(coords: [number, number, number]): [number, number, number] {
  return [coords[0] * LY_TO_SCENE, coords[1] * LY_TO_SCENE, coords[2] * LY_TO_SCENE];
}

function isDuplicateOfStarter(star: StarCatalogEntry): boolean {
  const label = (star.name || star.designation || "").toLowerCase();
  return Array.from(STARTER_NAMES).some(
    (n) => label.includes(n) || n.includes(label)
  );
}

function spectralColor(spectralType: string): string {
  switch (spectralType.charAt(0).toUpperCase()) {
    case "O":
    case "B":
      return "#6699ff";
    case "A":
      return "#ffffff";
    case "F":
    case "G":
      return "#ffee55";
    case "K":
      return "#ff8833";
    case "M":
      return "#ff4422";
    default:
      return "#aaaaaa";
  }
}

// Returns a DOMRect centered on the viewport — used to anchor the modal.
function centerRect(): DOMRect {
  return new DOMRect(
    (window.innerWidth - 300) / 2,
    window.innerHeight / 2 - 110,
    300,
    150
  );
}

// ── WarpDrive ─────────────────────────────────────────────────────────────────
// Lives inside Canvas so it can use useFrame / useThree.
// Smoothly lerps the camera and OrbitControls target toward the selected star.
// Once close enough, stops lerping so OrbitControls regains free control.

type WarpDriveProps = {
  target: [number, number, number] | null;
  controlsRef: React.RefObject<OrbitControlsImpl>;
};

function WarpDrive({ target, controlsRef }: WarpDriveProps) {
  const { camera } = useThree();

  // Persistent Vector3 instances — avoids allocations inside useFrame
  const starVec = React.useRef(new Vector3());
  const camVec = React.useRef(new Vector3());

  // Becomes true once camera has arrived; reset whenever target changes
  const done = React.useRef(false);
  React.useEffect(() => {
    done.current = false;
  }, [target]);

  useFrame(() => {
    if (!target || !controlsRef.current || done.current) return;

    const [x, y, z] = target;
    starVec.current.set(x, y, z);
    // Position camera 2 units above and 5 units in front of the star
    camVec.current.set(x, y + 2, z + 5);

    camera.position.lerp(camVec.current, 0.04);
    controlsRef.current.target.lerp(starVec.current, 0.04);
    controlsRef.current.update();

    // Hand control back to OrbitControls once we've arrived
    if (camera.position.distanceTo(camVec.current) < 0.05) {
      done.current = true;
    }
  });

  return null;
}

// ── StarMesh ──────────────────────────────────────────────────────────────────

type StarMeshProps = {
  position: [number, number, number];
  color: string;
  isSelected: boolean;
  onClick: () => void;
};

function StarMesh({ position, color, isSelected, onClick }: StarMeshProps) {
  return (
    <mesh
      position={position}
      scale={isSelected ? 1.5 : 1}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={() => {
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "auto";
      }}
    >
      <sphereGeometry args={[0.2, 16, 16]} />
      <meshStandardMaterial
        color={isSelected ? "#00ffff" : color}
        emissive={isSelected ? "#00ffff" : "#000000"}
        emissiveIntensity={isSelected ? 0.8 : 0}
      />
    </mesh>
  );
}

// ── HUD readout ───────────────────────────────────────────────────────────────

type FootReadoutProps = {
  selected: SelectedStar | null;
  isLoading: boolean;
  onRemove: () => void;
};

function FootReadout({ selected, isLoading, onRemove }: FootReadoutProps) {
  if (isLoading) {
    return (
      <span className="text-yellow-400 animate-pulse">
        Scanning for Favorites...
      </span>
    );
  }

  if (!selected) {
    return (
      <span className="text-green-400">Standing by for navigation data.</span>
    );
  }

  const [x, y, z] = selected.coords;
  const isSun = selected.name === "Sun";
  const isCatalogStar = selected.id !== undefined;

  // Sun is permanent — no remove/hide button
  // Starter stars (no id) → "Hide from View"  (session-only, resets on refresh)
  // Catalog favorites (has id) → "Remove from Charts"  (permanent, hits the DB)
  const buttonLabel = isCatalogStar ? "Remove from Charts" : "Hide from View";

  return (
    <>
      <span className="text-cyan-400">
        Target Lock: {selected.name}.<br />
        Distance: {selected.distanceLy.toFixed(2)} ly.<br />
        Coordinates: {x.toFixed(2)}, {y.toFixed(2)}, {z.toFixed(2)} ly.
      </span>
      {!isSun && (
        <div className="mt-2 flex justify-end">
          <button
            onClick={onRemove}
            className="px-2 py-1 text-xs font-mono rounded border border-red-500 text-red-400 hover:bg-red-500/20 transition-colors"
          >
            {buttonLabel}
          </button>
        </div>
      )}
    </>
  );
}

// ── GalacticMap ───────────────────────────────────────────────────────────────

export default function GalacticMap() {
  const { favorites, loading: favoritesLoading, removeFavorite } = useFavorites();
  const [favStars, setFavStars] = React.useState<StarCatalogEntry[]>([]);
  const [favStarsLoading, setFavStarsLoading] = React.useState(false);
  const [selectedStar, setSelectedStar] = React.useState<SelectedStar | null>(null);
  const [showModal, setShowModal] = React.useState(false);
  const [hiddenStarters, setHiddenStarters] = React.useState<string[]>([]);

  // Ref for OrbitControls — shared with WarpDrive for target animation
  const controlsRef = React.useRef<OrbitControlsImpl>(null);

  // Stable scene position for the selected star — fed into WarpDrive
  const warpTarget = React.useMemo(
    () => (selectedStar ? toScenePos(selectedStar.coords) : null),
    [selectedStar]
  );

  // Gate on favoritesLoading so we don't fire with an empty favorites list
  // while the API request is still in-flight (the hard-refresh bug).
  React.useEffect(() => {
    if (favoritesLoading) return;

    if (favorites.length === 0) {
      setFavStars([]);
      return;
    }

    setFavStarsLoading(true);
    loadStarsByIds(favorites).then((entries) => {
      setFavStars(entries.filter((s) => !isDuplicateOfStarter(s)));
      setFavStarsLoading(false);
    });
  }, [favorites, favoritesLoading]);

  const isLoading = favoritesLoading || favStarsLoading;

  const handleRemoveClick = () => setShowModal(true);

  const handleRemoveConfirm = () => {
    if (selectedStar?.id !== undefined) {
      // Catalog favorite — remove from the database
      removeFavorite(selectedStar.id);
    } else if (selectedStar?.name) {
      // Starter star — hide for this session (resets on refresh)
      setHiddenStarters((prev) => [...prev, selectedStar.name]);
    }
    setShowModal(false);
    setSelectedStar(null);
  };

  const handleRemoveCancel = () => setShowModal(false);

  // Minimal Star-compatible object for the modal — it only reads star.name.
  const modalStar: Star | null =
    selectedStar?.id !== undefined
      ? {
          id: selectedStar.id,
          name: selectedStar.name,
          designation: selectedStar.name,
          distanceLy: selectedStar.distanceLy,
          spectralType: "",
        }
      : selectedStar && selectedStar.name !== "Sun"
        ? {
            id: 0,
            name: selectedStar.name,
            designation: selectedStar.name,
            distanceLy: selectedStar.distanceLy,
            spectralType: "",
          }
        : null;

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* 3D Canvas */}
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 10, 20]} />
        <color attach="background" args={["#000000"]} />

        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <ambientLight intensity={0.2} />

        <gridHelper args={[100, 100, 0x444444, 0x222222]} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />

        {/* Fly-to animation — lives inside Canvas to access useFrame */}
        <WarpDrive target={warpTarget} controlsRef={controlsRef} />

        {/* Habitable starter stars — hidden ones excluded */}
        {HABITABLE_STARTER_STARS.filter((s) => !hiddenStarters.includes(s.name)).map((star) => (
          <StarMesh
            key={star.name}
            position={toScenePos(star.coords)}
            color={star.color}
            isSelected={selectedStar?.name === star.name && selectedStar.id === undefined}
            onClick={() =>
              setSelectedStar({
                name: star.name,
                distanceLy: star.distanceLy,
                coords: star.coords,
              })
            }
          />
        ))}

        {/* Real favorites from HYG catalog */}
        {favStars.map((star) => (
          <StarMesh
            key={star.id}
            position={toScenePos([star.x, star.y, star.z])}
            color={spectralColor(star.spectralType)}
            isSelected={selectedStar?.id === star.id}
            onClick={() =>
              setSelectedStar({
                id: star.id,
                name: star.name || star.designation,
                distanceLy: star.distanceLy,
                coords: [star.x, star.y, star.z],
              })
            }
          />
        ))}

        <OrbitControls ref={controlsRef} />
      </Canvas>

      {/* Mission Control HUD — 2D overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top-left: page title */}
        <div className="absolute top-6 left-6 text-green-400 font-mono text-lg tracking-widest drop-shadow-[0_0_8px_rgba(34,197,94,0.7)]">
          GALACTIC MAP
        </div>

        {/* Bottom-right: Mission Commander Foot */}
        <div className="absolute bottom-6 right-6 flex items-end gap-3 pointer-events-auto">
          <div className="mb-2 bg-black/70 border border-green-400 rounded-lg px-3 py-2 text-sm font-mono text-right shadow-[0_0_12px_rgba(34,197,94,0.3)]">
            <span className="text-green-300">Mission Commander Foot:</span>
            <br />
            <FootReadout
              selected={selectedStar}
              isLoading={isLoading}
              onRemove={handleRemoveClick}
            />
          </div>

          {/* Portrait pulses yellow while loading, steady green when ready */}
          <div
            className={`w-24 h-24 shrink-0 rounded-xl border-2 overflow-hidden bg-black/40 transition-all duration-500 ${
              isLoading
                ? "border-yellow-400 shadow-[0_0_18px_rgba(234,179,8,0.5)] animate-pulse"
                : "border-green-400 shadow-[0_0_18px_rgba(34,197,94,0.5)]"
            }`}
          >
            <img src={PingFoot} alt="Mission Commander Foot" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      {/* Confirm-remove / hide modal — portalled to document.body */}
      {modalStar && (
        <ConfirmRemoveModal
          star={modalStar}
          anchorRect={centerRect()}
          isOpen={showModal}
          onConfirm={handleRemoveConfirm}
          onCancel={handleRemoveCancel}
        />
      )}
    </div>
  );
}
