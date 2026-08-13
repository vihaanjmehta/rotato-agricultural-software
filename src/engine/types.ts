export type Family =
  | "cereal"
  | "legume"
  | "brassica"
  | "solanaceous"
  | "oilseed"
  | "grass"
  | "allium";

export type SoilType = "loam" | "clay" | "sand" | "silt";

export interface Crop {
  id: string;
  name: string;
  tone: string;
  family: Family;
  coverCrop: boolean;
  n: number;
  p: number;
  k: number;
  om: number;
  roots: number;
  yieldBase: number;
  sensitivity: { n: number; p: number; k: number };
  water: number;
  texture: number;
  diseaseBreak: number;
}

export interface SoilState {
  n: number;
  p: number;
  k: number;
  om: number;
  structure: number;
  disease: Record<Family, number>;
}

export interface SeasonResult {
  season: number;
  cropId: string;
  crop: Crop;
  state: SoilState;
  healthBefore: number;
  healthAfter: number;
  yieldPoints: number;
  score: number;
  disease: number;
  violated: string[];
}

export interface RotationResult {
  strategyId: StrategyId;
  label: string;
  description: string;
  seasonResults: SeasonResult[];
  sequence: string[];
  totalYield: number;
  finalHealth: number;
  avgHealth: number;
  yearOverYear: number[];
  score: number;
}

export interface Constraints {
  legumeEvery: number;
  minCover: number;
  minGap: number;
  forbid: string[];
}

export interface SetupData {
  soilType: SoilType;
  horizon: number;
  initialState: SoilState;
  prevFamily: Family | null;
  constraints: Constraints;
  presetSequence: string[];
}

export type StrategyId = "baseline" | "greedy" | "adaptive" | "rl";

export interface FamilyInfo {
  id: Family;
  name: string;
  color: string;
}