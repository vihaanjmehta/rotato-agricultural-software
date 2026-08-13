import type {
  Constraints,
  Family,
  RotationResult,
  SeasonResult,
  SoilState,
  SoilType,
  StrategyId,
} from "./types";
import { CROPS, cropById } from "./crops";
import { applyCrop, evalSequence, healthOf, REWARD } from "./model";

export interface PlanInput {
  soilType: SoilType;
  horizon: number;
  initialState: SoilState;
  prevFamily: Family | null;
  constraints: Constraints;
}

export const totalScoreOf = (results: SeasonResult[]): number => {
  const sum = results.reduce((sum, r) => sum + r.score, 0);
  const last = results[results.length - 1];
  return sum + REWARD.terminalHealthW * (last.healthAfter / 100);
};

export const summarize = (
  strategyId: StrategyId,
  label: string,
  description: string,
  seasonResults: SeasonResult[]
): RotationResult => {
  const sequence = seasonResults.map((r) => r.cropId);
  const finalHealth = healthOf(seasonResults[seasonResults.length - 1].state);
  const avgHealth =
    seasonResults.reduce((s, r) => s + r.healthAfter, 0) / seasonResults.length;
  const totalYield = seasonResults.reduce((s, r) => s + r.yieldPoints, 0);
  const yearOverYear = seasonResults.map((r) => r.yieldPoints);
  return {
    strategyId,
    label,
    description,
    seasonResults,
    sequence,
    totalYield,
    finalHealth,
    avgHealth,
    yearOverYear,
    score: totalScoreOf(seasonResults),
  };
};

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const hasLegumeInWindow = (
  ids: string[],
  idx: number,
  legumeEvery: number
): boolean => {
  for (let i = Math.max(0, idx - legumeEvery + 1); i <= idx; i++) {
    if (cropById(ids[i]).family === "legume") return true;
  }
  return false;
};

export const familyRepeatsInGap = (
  ids: string[],
  idx: number,
  family: Family,
  minGap: number
): boolean => {
  if (minGap <= 0) return false;
  for (let j = Math.max(0, idx - minGap + 1); j < idx; j++) {
    if (cropById(ids[j]).family === family) return true;
  }
  return false;
};

export function validAt(
  ids: string[],
  idx: number,
  candidate: string,
  prevFamily: Family | null,
  constraints: Constraints
): boolean {
  const c = cropById(candidate);
  if (constraints.forbid.includes(candidate)) return false;
  if (idx > 0 && c.family === cropById(ids[idx - 1]).family) return false;
  if (idx === 0 && prevFamily === c.family) return false;
  if (familyRepeatsInGap(ids, idx, c.family, constraints.minGap)) return false;
  if (!hasLegumeInWindow(ids, idx, constraints.legumeEvery) && c.family !== "legume") {
    return false;
  }
  return true;
}

export function isValidSequence(
  ids: string[],
  prevFamily: Family | null,
  constraints: Constraints
): boolean {
  if (ids.length === 0) return false;
  for (let i = 0; i < ids.length; i++) {
    if (!validAt(ids, i, ids[i], prevFamily, constraints)) return false;
  }
  const covers = ids.filter((id) => cropById(id).coverCrop).length;
  return covers >= constraints.minCover;
}

function feasibleCandidates(
  ids: string[],
  idx: number,
  prevFamily: Family | null,
  constraints: Constraints
): string[] {
  const coversSoFar = ids.filter((id) => cropById(id).coverCrop).length;
  const slotsAfter = ids.length - 1 - idx;
  const coversNeeded = Math.max(0, constraints.minCover - coversSoFar - slotsAfter);
  return CROPS.filter(
    (c) =>
      !constraints.forbid.includes(c.id) &&
      (idx === 0 && prevFamily !== null ? prevFamily !== c.family : true) &&
      (idx === 0 ? true : c.family !== cropById(ids[idx - 1]).family) &&
      !familyRepeatsInGap(ids, idx, c.family, constraints.minGap) &&
      (coversNeeded > 0 ? c.coverCrop : true) &&
      (hasLegumeInWindow(ids, idx, constraints.legumeEvery) ||
        c.family === "legume")
  ).map((c) => c.id);
}

export function greedyPlan(input: PlanInput): SeasonResult[] {
  const ids: string[] = [];
  let state = { ...input.initialState };
  let prev = input.prevFamily;
  const results: SeasonResult[] = [];
  for (let i = 0; i < input.horizon; i++) {
    const candidates = CROPS.filter((c) =>
      validAt(ids, i, c.id, prev, input.constraints)
    );
    const coversSoFar = ids.filter((id) => cropById(id).coverCrop).length;
    const coversNeeded = Math.max(
      0,
      input.constraints.minCover - coversSoFar - (input.horizon - 1 - i)
    );
    const pool = candidates.filter(
      (c) => !coversNeeded || c.coverCrop || c.family === "legume"
    );
    const legal = pool.length > 0 ? pool : candidates;

    let bestId = legal[0].id;
    let bestScore = -Infinity;
    for (const c of legal) {
      const recent = new Set(ids.slice(Math.max(0, i - 2), i).map((x) => cropById(x).family));
      const r = applyCrop(state, c, {
        soilType: input.soilType,
        prevFamily: prev,
        fresh: !recent.has(c.family),
      });
      if (r.score > bestScore) {
        bestScore = r.score;
        bestId = c.id;
      }
    }
    const crop = cropById(bestId);
    const recent = new Set(ids.slice(Math.max(0, i - 2), i).map((x) => cropById(x).family));
    const r = applyCrop(state, crop, {
      soilType: input.soilType,
      prevFamily: prev,
      fresh: !recent.has(crop.family),
    });
    results.push({ ...r, season: i + 1 });
    ids.push(bestId);
    state = r.state;
    prev = crop.family;
  }
  return results;
}

export function annealPlan(
  input: PlanInput,
  opts: { iters?: number; startTemp?: number; seed?: number } = {}
): SeasonResult[] {
  const rng = mulberry32(opts.seed ?? 1337);
  const iters = opts.iters ?? 12000;
  const startTemp = opts.startTemp ?? 2.5;
  const { horizon, initialState, soilType, prevFamily, constraints } = input;

  let current: string[] = [];
  for (let i = 0; i < horizon; i++) {
    const cands = feasibleCandidates(current, i, prevFamily, constraints);
    current.push(cands[Math.floor(rng() * cands.length)]);
  }
  if (!isValidSequence(current, prevFamily, constraints)) {
    current = greedyPlan(input).map((r) => r.cropId);
  }

  const evalPlan = (ids: string[]): number =>
    totalScoreOf(evalSequence(ids, initialState, soilType, prevFamily));

  let bestIds = [...current];
  let bestScore = evalPlan(bestIds);
  let score = bestScore;

  for (let it = 0; it < iters; it++) {
    const temp = startTemp * Math.pow(0.9996, it);
    const next = [...current];
    const op = rng();
    if (op < 0.5) {
      const i = Math.floor(rng() * horizon);
      const j = Math.floor(rng() * horizon);
      if (i !== j) {
        const tmp = next[i];
        next[i] = next[j];
        next[j] = tmp;
      }
    } else if (op < 0.85) {
      const i = Math.floor(rng() * horizon);
      const cands = feasibleCandidates(next, i, prevFamily, constraints).filter(
        (id) => id !== next[i]
      );
      if (cands.length > 0) {
        next[i] = cands[Math.floor(rng() * cands.length)];
      }
    } else {
      const i = Math.floor(rng() * Math.max(1, horizon - 1));
      const block = 1 + Math.floor(rng() * Math.min(3, horizon - i - 1));
      const rotated = [...next.slice(i, i + block)];
      rotated.unshift(rotated.pop() as string);
      for (let k = 0; k < block; k++) next[i + k] = rotated[k];
    }

    if (isValidSequence(next, prevFamily, constraints)) {
      const nextScore = evalPlan(next);
      const delta = nextScore - score;
      if (delta > 0 || rng() < Math.exp(delta / temp)) {
        current = next;
        score = nextScore;
        if (score > bestScore) {
          bestScore = score;
          bestIds = [...next];
        }
      }
    }
  }

  return evalSequence(polishPlan(input, bestIds), initialState, soilType, prevFamily);
}

function polishPlan(
  input: PlanInput,
  start: string[]
): string[] {
  let ids = [...start];
  let improved = true;
  while (improved) {
    improved = false;
    for (let i = 0; i < ids.length; i++) {
      const cands = feasibleCandidates(ids, i, input.prevFamily, input.constraints);
      let best = ids[i];
      let bestScore = totalScoreOf(
        evalSequence(ids, input.initialState, input.soilType, input.prevFamily)
      );
      for (const cand of cands) {
        if (cand === ids[i]) continue;
        const trial = [...ids];
        trial[i] = cand;
        const sc = totalScoreOf(
          evalSequence(trial, input.initialState, input.soilType, input.prevFamily)
        );
        if (sc > bestScore) {
          bestScore = sc;
          best = cand;
        }
      }
      if (best !== ids[i]) {
        ids[i] = best;
        improved = true;
      }
    }
  }
  return ids;
}