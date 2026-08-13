import type { Crop, Family, SoilState, SoilType } from "./types";

export interface SoilProfile {
  id: SoilType;
  name: string;
  blurb: string;
  texture: number;
  retention: number;
  omDecay: number;
  waterStress: number;
  from: string;
  to: string;
}

export const SOIL_PROFILES: Record<SoilType, SoilProfile> = {
  loam: {
    id: "loam",
    name: "Silty Loam",
    blurb: "The gold standard. Balanced water holding and drainage.",
    texture: 0.5,
    retention: 1.0,
    omDecay: 1.0,
    waterStress: 0.0,
    from: "#a16207",
    to: "#eab308",
  },
  clay: {
    id: "clay",
    name: "Clay",
    blurb: "Nutrient rich and water-retentive, but heavy and slow to warm.",
    texture: 0.9,
    retention: 1.2,
    omDecay: 0.72,
    waterStress: 0.0,
    from: "#7c3aed",
    to: "#c084fc",
  },
  sand: {
    id: "sand",
    name: "Sandy",
    blurb: "Fast draining and warm. Low retention; nutrients leach easily.",
    texture: 0.15,
    retention: 0.55,
    omDecay: 1.5,
    waterStress: 0.2,
    from: "#d97706",
    to: "#fde047",
  },
  silt: {
    id: "silt",
    name: "Silt",
    blurb: "Fine and fertile, great water holding, prone to crusting.",
    texture: 0.7,
    retention: 1.1,
    omDecay: 0.9,
    waterStress: 0.05,
    from: "#0ea5e9",
    to: "#38bdf8",
  },
};

const NEW_DISEASE: Record<Family, number> = {
  cereal: 0.05,
  legume: 0.05,
  brassica: 0.05,
  solanaceous: 0.05,
  oilseed: 0.05,
  grass: 0.05,
  allium: 0.05,
};

export const initialStateFor = (soilType: SoilType): SoilState => {
  const prof = SOIL_PROFILES[soilType];
  const sandy = prof.id === "sand";
  return {
    n: 58,
    p: 52,
    k: 48,
    om: sandy ? 38 : 46,
    structure: sandy ? 40 : 55,
    disease: { ...NEW_DISEASE },
  };
};

export const SOIL_DEFAULTS = {
  baseN: 62,
  baseP: 54,
  baseK: 52,
  baseOM: 55,
  reversion: 0.16,
  omRate: 0.12,
};

export const clamp = (v: number, lo: number, hi: number): number =>
  Math.min(hi, Math.max(lo, v));

export const soilFit = (crop: Crop, soilType: SoilType): number => {
  const prof = SOIL_PROFILES[soilType];
  const closeness = 1 - Math.abs(crop.texture - prof.texture);
  return 0.72 + 0.6 * closeness;
};

export const CROP_IDS = [
  "corn",
  "wheat",
  "oats",
  "soybean",
  "peas",
  "alfalfa",
  "canola",
  "radish",
  "rye",
  "potato",
  "sunflower",
  "onion",
] as const;