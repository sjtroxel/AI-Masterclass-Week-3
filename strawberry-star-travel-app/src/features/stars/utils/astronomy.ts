// Rough temperature estimates by spectral class
const SPECTRAL_TEMPS: Record<string, number> = {
  O: 30000,
  B: 20000,
  A: 8500,
  F: 6500,
  G: 5500,
  K: 4500,
  M: 3200,
};

export function spectralExplanation(spectralType?: string) {
  if (!spectralType) return null;

  const mainClass = spectralType[0]?.toUpperCase();
  const luminosity = spectralType.match(/[IV]+/g)?.[0];

  const classDescriptions: Record<string, string> = {
    O: "Extremely hot blue star",
    B: "Hot blue star",
    A: "Hot white star",
    F: "White-yellow star",
    G: "Yellow star (Sun-like)",
    K: "Orange star",
    M: "Cool red star",
  };

  const luminosityDescriptions: Record<string, string> = {
    I: "supergiant",
    II: "bright giant",
    III: "giant",
    IV: "subgiant",
    V: "main-sequence star",
  };

  const base = classDescriptions[mainClass] ?? "Star";
  const lum = luminosity ? luminosityDescriptions[luminosity] : null;

  return lum ? `${base}, ${lum}` : base;
}

export function estimateTemperature(spectralType?: string) {
  if (!spectralType) return null;
  const mainClass = spectralType[0]?.toUpperCase();
  return SPECTRAL_TEMPS[mainClass] ?? null;
}

export function travelTimeLy(distanceLy: number, speedFractionOfC = 0.1) {
  return distanceLy / speedFractionOfC;
}
