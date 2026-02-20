import { Constellations } from "../data/constellations";

export function getConstellationName(abbrev?: string) {
  if (!abbrev) return "The Solar System";
  return Constellations[abbrev] ?? abbrev;
}
