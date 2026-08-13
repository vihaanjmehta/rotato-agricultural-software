import type { SeasonResult, SoilState } from "./types";
import { CROPS, cropById } from "./crops";
import { applyCrop, REWARD } from "./model";
import type { PlanInput } from "./optimizer";
import { familyRepeatsInGap, mulberry32 } from "./optimizer";

interface BucketSpec {
  buckets: number;
  thresholds: number[];
}

const NUTRIENTS: BucketSpec = { buckets: 4, thresholds: [0.45, 0.6, 0.75] };
const THREE: BucketSpec = { buckets: 3, thresholds: [0.55, 0.7] };
const DISEASE: BucketSpec = { buckets: 3, thresholds: [0.15, 0.35] };
const REMAINING: BucketSpec = { buckets: 5, thresholds: [1, 3, 5, 7] };

const bucketOf = (v: number, spec: BucketSpec): number => {
  let b = 0;
  while (b < spec.thresholds.length && v >= spec.thresholds[b]) b++;
  return b;
};

export interface RLState {
  nutrients: number;
  om: number;
  structure: number;
  disease: number;
  remaining: number;
}

export function discretize(s: SoilState, remaining: number): RLState {
  const nutrients =
    (s.n / 100 + s.p / 100 + s.k / 100) / 3;
  const worstDisease = Math.max(
    ...Object.values(s.disease)
  );
  return {
    nutrients: bucketOf(nutrients, NUTRIENTS),
    om: bucketOf(s.om / 100, THREE),
    structure: bucketOf(s.structure / 100, THREE),
    disease: bucketOf(worstDisease, DISEASE),
    remaining: bucketOf(remaining, REMAINING),
  };
}

const stateKey = (s: RLState): string =>
  `${s.nutrients}-${s.om}-${s.structure}-${s.disease}-${s.remaining}`;

export interface QLearner {
  episodes: number;
  history: number[];
  smoothed: number[];
  rollout: SeasonResult[];
}

export function trainQLearner(
  input: PlanInput,
  opts: { episodes?: number; gamma?: number; alpha?: number; seed?: number } = {}
): QLearner {
  const rng = mulberry32(opts.seed ?? 42);
  const episodes = opts.episodes ?? 600;
  const gamma = opts.gamma ?? 0.9;
  const alpha = opts.alpha ?? 0.25;

  const actionIds = CROPS.map((c) => c.id);
  const Q = new Map<string, number[]>();

  const qGet = (key: string): number[] => {
    let row = Q.get(key);
    if (!row) {
      row = new Array(actionIds.length).fill(0);
      Q.set(key, row);
    }
    return row;
  };

  const history: number[] = [];
  const toSmoothed: number[] = [];

  for (let ep = 0; ep < episodes; ep++) {
    const epsWarm = Math.max(0.05, 0.7 * Math.pow(0.992, ep));
    let state = { ...input.initialState };
    let prev = input.prevFamily;
    const chosen: string[] = [];
    let episodeReward = 0;

    for (let t = 0; t < input.horizon; t++) {
      const remaining = input.horizon - t;
      const key = stateKey(discretize(state, remaining));
      const row = qGet(key);
      const legalIdx = actionIds
        .map((id, idx) => ({ id, idx }))
        .filter(({ id }) => {
          const c = cropById(id);
          if (prev !== null && prev === c.family) return false;
          return !familyRepeatsInGap(chosen, t, c.family, input.constraints.minGap);
        });

      let actionIdx: number;
      if (rng() < epsWarm) {
        actionIdx = legalIdx[Math.floor(rng() * legalIdx.length)].idx;
      } else {
        let best = -Infinity;
        let bestIdx = legalIdx[0].idx;
        for (const { idx } of legalIdx) {
          if (row[idx] > best) {
            best = row[idx];
            bestIdx = idx;
          }
        }
        actionIdx = bestIdx;
      }

      const crop = cropById(actionIds[actionIdx]);
      const recent = new Set(
        chosen.slice(Math.max(0, t - 2)).map((id) => cropById(id).family)
      );
      const r = applyCrop(state, crop, {
        soilType: input.soilType,
        prevFamily: prev,
        fresh: !recent.has(crop.family),
      });
      episodeReward += r.score;
      const thisReward =
        t === input.horizon - 1
          ? r.score + REWARD.terminalHealthW * (r.healthAfter / 100)
          : r.score;

      if (t < input.horizon - 1) {
        const nextKey = stateKey(discretize(r.state, remaining - 1));
        const nextRow = qGet(nextKey);
        const bestNext = Math.max(...nextRow);
        row[actionIdx] +=
          alpha * (thisReward + gamma * bestNext - row[actionIdx]);
      } else {
        row[actionIdx] += alpha * (thisReward - row[actionIdx]);
      }

      state = r.state;
      prev = crop.family;
      chosen.push(crop.id);
    }

    history.push(episodeReward);
    const window = Math.min(30, ep + 1);
    const avg =
      history.slice(ep + 1 - window).reduce((s, v) => s + v, 0) / window;
    toSmoothed.push(avg);
  }

  const rollout = greedyRollout(input, Q, actionIds);

  return { episodes, history, smoothed: toSmoothed, rollout };
}

export function greedyRollout(
  input: PlanInput,
  Q: Map<string, number[]>,
  actionIds: string[]
): SeasonResult[] {
  const chosen: string[] = [];
  let state = { ...input.initialState };
  let prev = input.prevFamily;
  const results: SeasonResult[] = [];

  for (let t = 0; t < input.horizon; t++) {
    const remaining = input.horizon - t;
    const key = stateKey(discretize(state, remaining));
    const row = Q.get(key) ?? new Array(actionIds.length).fill(0);
    let best = -Infinity;
    let bestId = actionIds[0];
    for (let i = 0; i < actionIds.length; i++) {
      const c = cropById(actionIds[i]);
      if (prev !== null && prev === c.family) continue;
      if (familyRepeatsInGap(chosen, t, c.family, input.constraints.minGap)) continue;
      if (row[i] > best) {
        best = row[i];
        bestId = actionIds[i];
      }
    }
    const crop = cropById(bestId);
    const recent = new Set(
      chosen.slice(Math.max(0, t - 2)).map((id) => cropById(id).family)
    );
    const r = applyCrop(state, crop, {
      soilType: input.soilType,
      prevFamily: prev,
      fresh: !recent.has(crop.family),
    });
    results.push({ ...r, season: t + 1 });
    chosen.push(bestId);
    state = r.state;
    prev = crop.family;
  }
  return results;
}