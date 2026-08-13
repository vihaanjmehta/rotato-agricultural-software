import type { RotationResult, SetupData, StrategyId } from "./types";
import { CROPS, cropById } from "./crops";
import { evalSequence, healthOf, summarizeViolations } from "./model";
import { annealPlan, greedyPlan, summarize, totalScoreOf } from "./optimizer";
import { trainQLearner } from "./rl";

export const DEFAULT_BASELINE = ["corn", "soybean", "wheat", "corn", "soybean"];

export function buildBaseline(
  setup: SetupData,
  sequence: string[]
): RotationResult {
  const extended: string[] = [];
  for (let i = 0; i < setup.horizon; i++) {
    extended.push(sequence[i % sequence.length]);
  }
  while (
    extended.length > 0 &&
    cropById(extended[0]).family === setup.prevFamily
  ) {
    extended.push(extended.shift() as string);
  }
  const results = evalSequence(
    extended,
    setup.initialState,
    setup.soilType,
    setup.prevFamily
  );
  return summarize(
    "baseline",
    "Farmer baseline",
    "The grower's habitual rotation, planted cyclically",
    results
  );
}

export function solveAll(setup: SetupData, baselineSequence: string[]) {
  const input = {
    soilType: setup.soilType,
    horizon: setup.horizon,
    initialState: setup.initialState,
    prevFamily: setup.prevFamily,
    constraints: setup.constraints,
  };

  const baseline = buildBaseline(setup, baselineSequence);

  const greedy = summarize(
    "greedy",
    "Greedy",
    "Myopic: picks the best crop for this season alone",
    greedyPlan(input)
  );

  const adaptive = summarize(
    "adaptive",
    "Adaptive",
    "Simulated annealing over the full season horizon",
    annealPlan(input, { seed: 2026 })
  );

  const qlearner = trainQLearner(input, { episodes: 600, seed: 42 });
  const rl = summarize(
    "rl",
    "Q-Learning",
    "Tabular Q-Learning, improved from reward alone",
    qlearner.rollout
  );

  const all: RotationResult[] = [baseline, greedy, adaptive, rl];

  return {
    all,
    ranked: [...all].sort((a, b) => b.score - a.score),
    learningCurve: qlearner.smoothed,
    rawCurve: qlearner.history,
  };
}

export { CROPS, summarizeViolations, healthOf, totalScoreOf };
export const STRATEGY_META: Record<
  StrategyId,
  { name: string; color: string; blurb: string }
> = {
  baseline: {
    name: "Baseline",
    color: "#7f8f89",
    blurb: "Habitual farmer rotation",
  },
  greedy: {
    name: "Greedy",
    color: "#c97b00",
    blurb: "Myopic season-by-season",
  },
  adaptive: {
    name: "Adaptive",
    color: "#0d93a6",
    blurb: "Forward-looking search",
  },
  rl: {
    name: "Q-Learning",
    color: "#7a5cd6",
    blurb: "Learned from reward alone",
  },
};