# Spec 05 — Galactic Map Features

**Status:** Phase 1 complete · Phase 2 (Course Plotter) pending implementation

---

## Phase 1 — Implemented

### 1. 3D Environment

| Element | Implementation |
|---|---|
| Full-screen canvas | `<Canvas>` from `@react-three/fiber`, `h-screen bg-black` |
| Background starfield | `<Stars radius={100} depth={50} count={5000} />` from `@react-three/drei` |
| Orientation grid | `<gridHelper args={[100, 100, 0x444444, 0x222222]} />` |
| Coordinate scale | `LY_TO_SCENE = 0.05` (1 light year → 0.05 scene units; 20 ly ≈ 1 grid square) |
| Initial camera | `<PerspectiveCamera makeDefault position={[0, 10, 20]} />` |
| Free look | `<OrbitControls ref={controlsRef} />` — left-drag orbit, right-drag pan, scroll zoom |

### 2. Star Rendering

Stars are rendered as `<mesh>` with `<sphereGeometry args={[0.2, 16, 16]} />`.

**Spectral type → color mapping:**

| Class | Color | Hex |
|---|---|---|
| O, B | Blue | `#6699ff` |
| A | White | `#ffffff` |
| F, G | Yellow | `#ffee55` |
| K | Orange | `#ff8833` |
| M | Red | `#ff4422` |
| Unknown | Grey | `#aaaaaa` |

**Two star sets:**

1. `HABITABLE_STARTER_STARS` — 6 hardcoded nearby stars with real HYG `x/y/z` coords (ly). Scene position is always derived via `toScenePos(coords)`.
2. Catalog favorites — loaded lazily via `loadStarsByIds()` from `src/lib/starCatalog.ts` after `useFavorites()` resolves.

The `isDuplicateOfStarter()` helper prevents double-rendering a catalog star that matches a starter star name.

### 3. Warp Drive (Camera Fly-To)

**Component:** `WarpDrive` — lives **inside** `<Canvas>` so it can use R3F hooks.

**How it works:**

```
selectedStar changes
    └─ useMemo recomputes warpTarget (scene coords)
         └─ WarpDrive receives new target prop
              └─ useEffect resets done.current = false
                   └─ useFrame loop begins:
                        camera.position.lerp(camVec, 0.04)
                        controlsRef.target.lerp(starVec, 0.04)
                        controlsRef.update()
                        if distance < 0.05 → done.current = true (stops fighting OrbitControls)
```

**Key details:**
- `starVec` and `camVec` are persistent `useRef(new Vector3())` instances — zero heap allocations inside `useFrame`
- Camera offset: `[x, y+2, z+5]` — arrives 5.4 units from star, slightly above and in front
- `done.current = true` hands free control back to `OrbitControls` once the animation converges
- `warpTarget` is wrapped in `useMemo([selectedStar])` so array reference is stable between renders; `WarpDrive.useEffect` only resets on genuine star changes

### 4. Star Selection & HUD

- Click a star → `setSelectedStar(...)` → `FootReadout` switches from idle to "Target Lock" display
- Selected mesh scales to 1.5× and gains cyan emissive glow (`#00ffff`, intensity 0.8)
- `e.stopPropagation()` on click prevents OrbitControls from registering the event as a drag start
- Pointer cursor set via `document.body.style.cursor` on `onPointerOver / onPointerOut`

**HUD readout states:**

| State | Color | Text |
|---|---|---|
| `favoritesLoading \|\| favStarsLoading` | Yellow + pulse | `Scanning for Favorites...` |
| No selection | Green | `Standing by for navigation data.` |
| Star selected | Cyan | `Target Lock / Distance / Coordinates` |

### 5. Star Management

#### Catalog favorites → permanent removal

"Remove from Charts" button appears only for catalog stars (`selectedStar.id !== undefined`).
Flow: button → `ConfirmRemoveModal` → `onConfirm` → `removeFavorite(id)` → `useFavorites` updates → `useEffect` re-runs → star disappears from scene.

#### Starter stars → session hide

"Hide from View" button appears for starter stars with `id === undefined`, **except the Sun** (always present).
Flow: button → `ConfirmRemoveModal` → `onConfirm` → `setHiddenStarters([...prev, name])` → render filter excludes the star.
**Resets on page refresh** — these are not persisted.

#### Hard-refresh bug fix

The `useEffect` that calls `loadStarsByIds` gates on `favoritesLoading`:
```ts
React.useEffect(() => {
  if (favoritesLoading) return; // ← prevents spurious empty call during API flight
  ...
}, [favorites, favoritesLoading]);
```

---

## Phase 2 — Multi-Stop Course Plotter: Path Chain (Implemented)

### Overview

When a star is selected, the user clicks **"Add to Course"** to append it to a running **path chain**. The chain always originates at the Sun `[0, 0, 0]`. The user can build multi-hop routes (e.g. Sun → Proxima Centauri → Tau Ceti → TRAPPIST-1), undo the last waypoint, or clear the path entirely.

### Requirements

1. **"Add to Course" button** — appears in `FootReadout` whenever a star is selected; appends that star to `coursePath`.
2. **"Undo Last" button** — removes the most recently added waypoint; visible when `coursePath.length > 0`.
3. **"Clear All" button** — resets `coursePath` to `[]`; visible when `coursePath.length > 0`.
4. **3D polyline** — a continuous dashed cyan line through every point in the chain, from `[0, 0, 0]` through each waypoint in order.
5. **Cumulative HUD** — displays the full path label and the total distance + travel times for the entire journey.
6. **Sun pulse** — the Sun mesh emits a slow yellow pulse while `coursePath.length > 0`.

### Visual Implementation

`CourseLine` receives the full `path: SelectedStar[]` and builds a point array:

```tsx
import { Line } from "@react-three/drei";

// Inside Canvas, when path is non-empty:
const points = [[0, 0, 0], ...path.map((s) => toScenePos(s.coords))];

<Line
  points={points}
  color="#00ffff"
  lineWidth={1.5}
  dashed
  dashScale={2}
/>
```

### Math

Segment distances are computed as 3D Euclidean distances between consecutive waypoint coordinates (in light-years), not from the HYG `distanceLy` field (which is always relative to the Sun).

```ts
function euclideanLy(
  a: [number, number, number],
  b: [number, number, number]
): number {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const dz = b[2] - a[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

// Total distance = sum of all segments starting from the Sun
function totalPathDistance(path: SelectedStar[]): number {
  if (path.length === 0) return 0;
  let total = 0;
  const SUN: [number, number, number] = [0, 0, 0];
  let prev = SUN;
  for (const star of path) {
    total += euclideanLy(prev, star.coords);
    prev = star.coords;
  }
  return total;
}
```

Travel time display (spec-defined thresholds, extended for sub-month resolution):

| Factor | Speed | Display |
|---|---|---|
| Warp 1 | 1 ly/year | `totalDist` years |
| Warp 9 | 1,516 ly/year (TNG scale) | `totalDist / 1516` years |

### State shape

```ts
// In GalacticMap component
const [coursePath, setCoursePath] = React.useState<SelectedStar[]>([]);
```

`coursePath` is an ordered array of waypoints. The implicit origin is always the Sun at `[0, 0, 0]`. The path persists when the user selects a different star — selection and path-building are independent operations.

### HUD display

`FootReadout` shows a path section whenever `coursePath.length > 0` (regardless of whether a star is currently selected):

```
Path: Sun → Proxima Centauri → Tau Ceti
Total: 16.13 ly
Warp 1: 16.13 years  |  Warp 9: 11 days
```

### Component structure

```
GalacticMap
├── <Canvas>
│   ├── WarpDrive            (camera lerp — existing)
│   ├── CourseLine           (path: SelectedStar[] — renders polyline when non-empty)
│   ├── StarMesh × N         (Sun gets pulse prop when coursePath.length > 0)
│   └── OrbitControls
└── HUD overlay
    └── FootReadout          (coursePath + onAddToCourse / onUndoLast / onClearPath)
```
