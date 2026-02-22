import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars, PerspectiveCamera } from "@react-three/drei";
import { useFavorites } from "../../hooks/useFavorites";
import { loadStarsByIds } from "../../lib/starCatalog";
import type { StarCatalogEntry } from "../../lib/starCatalog";
import PingFoot from "../../styles/PingFoot.png";

// Scale: 1 light year → 0.05 scene units (20 ly ≈ 1 grid square)
const LY_TO_SCENE = 0.05;

// ── Types ────────────────────────────────────────────────────────────────────

type StarterStar = {
  name: string;
  position: [number, number, number];
  color: string;
  distanceLy: number;
};

// id is present for catalog stars; absent for hardcoded starter stars
type SelectedStar = {
  id?: number;
  name: string;
  distanceLy: number;
  coords: [number, number, number] | null; // real ly coords, null for starter stars
};

// ── Static data ───────────────────────────────────────────────────────────────

const HABITABLE_STARTER_STARS: StarterStar[] = [
  { name: "Sun", position: [0, 0, 0], color: "yellow", distanceLy: 0 },
  { name: "Proxima Centauri", position: [2, 0.5, -1], color: "red", distanceLy: 4.24 },
  { name: "TRAPPIST-1", position: [5, -2, 4], color: "red", distanceLy: 40.9 },
  { name: "Tau Ceti", position: [-3, 1, 2], color: "yellow", distanceLy: 11.89 },
  { name: "Teegarden's Star", position: [1, -1, -5], color: "red", distanceLy: 12.47 },
  { name: "Alpha Centauri A", position: [2.1, 0, -1.2], color: "yellow", distanceLy: 4.37 },
];

const STARTER_NAMES = new Set(
  HABITABLE_STARTER_STARS.map((s) => s.name.toLowerCase())
);

// ── Helpers ───────────────────────────────────────────────────────────────────

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

function FootReadout({ selected }: { selected: SelectedStar | null }) {
  if (!selected) {
    return <span className="text-green-400">Standing by for navigation data.</span>;
  }

  const coordStr = selected.coords
    ? `${selected.coords[0].toFixed(2)}, ${selected.coords[1].toFixed(2)}, ${selected.coords[2].toFixed(2)} ly`
    : "N/A";

  return (
    <span className="text-cyan-400">
      Target Lock: {selected.name}.<br />
      Distance: {selected.distanceLy.toFixed(2)} ly.<br />
      Coordinates: {coordStr}.
    </span>
  );
}

// ── GalacticMap ───────────────────────────────────────────────────────────────

export default function GalacticMap() {
  const { favorites } = useFavorites();
  const [favStars, setFavStars] = React.useState<StarCatalogEntry[]>([]);
  const [selectedStar, setSelectedStar] = React.useState<SelectedStar | null>(null);

  React.useEffect(() => {
    loadStarsByIds(favorites).then((entries) => {
      setFavStars(entries.filter((s) => !isDuplicateOfStarter(s)));
    });
  }, [favorites]);

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

        {/* Habitable starter stars */}
        {HABITABLE_STARTER_STARS.map((star) => (
          <StarMesh
            key={star.name}
            position={star.position}
            color={star.color}
            isSelected={selectedStar?.name === star.name && selectedStar.id === undefined}
            onClick={() =>
              setSelectedStar({
                name: star.name,
                distanceLy: star.distanceLy,
                coords: null,
              })
            }
          />
        ))}

        {/* Real favorites from HYG catalog */}
        {favStars.map((star) => (
          <StarMesh
            key={star.id}
            position={[star.x * LY_TO_SCENE, star.y * LY_TO_SCENE, star.z * LY_TO_SCENE]}
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

        <OrbitControls />
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
            <FootReadout selected={selectedStar} />
          </div>

          <div className="w-24 h-24 shrink-0 rounded-xl border-2 border-green-400 shadow-[0_0_18px_rgba(34,197,94,0.5)] overflow-hidden bg-black/40">
            <img src={PingFoot} alt="Mission Commander Foot" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </div>
  );
}
