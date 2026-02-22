// Shared gateway to the raw HYG star catalog.
// Features should import from here rather than directly from src/features/stars/data/,
// which would violate feature-boundary rules.

export type StarCatalogEntry = {
  id: number;
  name: string;
  designation: string;
  distanceLy: number;
  spectralType: string;
  constellation?: string;
  rightAscension?: string;
  declination?: string;
  apparentMagnitude?: number;
  x: number;
  y: number;
  z: number;
};

// Lazily loads the full catalog (35 MB) and returns only the entries matching
// the given IDs — no need to parse the whole file at import time.
export async function loadStarsByIds(ids: number[]): Promise<StarCatalogEntry[]> {
  if (ids.length === 0) return [];
  const idSet = new Set(ids);
  const mod = await import("../features/stars/data/stars.json");
  return (mod.default as StarCatalogEntry[]).filter((s) => idSet.has(s.id));
}
