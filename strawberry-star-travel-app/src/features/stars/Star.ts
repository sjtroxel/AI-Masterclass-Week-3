export interface Star {
  id: number;
  name: string;                     // Common name if available
  designation: string;              // Catalog name (e.g., "Gliese 551")
  distanceLy: number;               // Distance from Earth in light years
  spectralType: string;             // Stellar classification (e.g., M5.5Ve)
  constellation?: string;           // Optional - some stars don't have one mapped
  rightAscension?: string;          // Optional - useful if an API gives it
  declination?: string;             // Optional - useful if an API gives it
  apparentMagnitude?: number;       // Brightness as seen from Earth
  imageUrl?: string;                   // Optional image (you can add later)
}
