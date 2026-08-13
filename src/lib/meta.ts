import type { Family, StrategyId } from "../engine/types";

export const STRATEGY_COLORS: Record<StrategyId, string> = {
  baseline: "#7f8f89",
  greedy: "#c97b00",
  adaptive: "#0d93a6",
  rl: "#7a5cd6",
};

export const COLOR: Record<string, string> = STRATEGY_COLORS;

export const STRATEGY_NAMES: Record<StrategyId, string> = {
  baseline: "Baseline",
  greedy: "Greedy",
  adaptive: "Adaptive",
  rl: "Q-Learning",
};

export const FAMILY_NAMES: Record<Family, string> = {
  cereal: "Cereal",
  legume: "Legume",
  brassica: "Brassica",
  solanaceous: "Solanaceous",
  oilseed: "Oilseed",
  grass: "Grass / Cover",
  allium: "Allium",
};

export const fam = (f: Family) => FAMILY_NAMES[f];

export const fmt = (n: number, d = 1): string =>
  n.toLocaleString(undefined, {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  });

export const pct = (n: number, d = 0): string => `${fmt(n, d)}%`;

export const rankLabel = (i: number): string =>
  i === 0 ? "best" : i === 1 ? "runner-up" : `#${i + 1}`;

export const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));