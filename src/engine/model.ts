import type {
  Constraints,
  Crop,
  Family,
  SeasonResult,
  SoilState,
  SoilType,
} from "./types";
import { CROPS, familyName } from "./crops";
import { SOIL_DEFAULTS, SOIL_PROFILES, clamp, soilFit } from "./soil";

export const CROPS_LOOKUP: Record<string, Crop> = Object.fromEntries(
  CROPS.map((c) => [c.id, c])
);

export const HEALTH_WEIGHTS = {
  n: 0.3,
  p: 0.22,
  k: 0.16,
  om: 0.18,
  structure: 0.14,
};

export const REWARD = {
  yieldReturn: 1.0,
  healthDeltaW: 0.06,
  healthLevelW: 0.45,
  terminalHealthW: 0.5,
};

export const healthOf = (s: SoilState): number =>
  100 *
  (HEALTH_WEIGHTS.n * (s.n / 100) +
    HEALTH_WEIGHTS.p * (s.p / 100) +
    HEALTH_WEIGHTS.k * (s.k / 100) +
    HEALTH_WEIGHTS.om * (s.om / 100) +
    HEALTH_WEIGHTS.structure * (s.structure / 100));

export interface Context {
  soilType: SoilType;
  prevFamily: Family | null;
  fresh: boolean;
}

const clamp01 = (v: number): number => clamp(v, 0, 1);

export function yieldOf(crop: Crop, state: SoilState, ctx: Context): number {
  const sufficiency =
    crop.sensitivity.n * (state.n / 90) +
    crop.sensitivity.p * (state.p / 65) +
    crop.sensitivity.k * (state.k / 65);

  const fertility = 0.5 + 0.5 * clamp01(sufficiency);
  const structureMult = clamp(0.82 + (state.structure / 100) * 0.5, 0.82, 1.32);
  const organicMult = 0.88 + 0.24 * (state.om / 100);
  const disease = state.disease[crop.family];
  const diseaseMult = 1 - Math.min(0.5, 0.7 * disease);
  const fit = soilFit(crop, ctx.soilType);
  const prof = SOIL_PROFILES[ctx.soilType];

  let y =
    crop.yieldBase *
    fertility *
    structureMult *
    organicMult *
    diseaseMult *
    fit;
  y *= 1 - prof.waterStress * crop.water;
  if (ctx.prevFamily === crop.family) y *= 0.7;
  if (ctx.fresh) y *= 1.07;
  return y;
}

export function applyCrop(
  state: SoilState,
  crop: Crop,
  ctx: Context
): SeasonResult {
  const prof = SOIL_PROFILES[ctx.soilType];
  const healthBefore = healthOf(state);

  const ret = prof.retention;
  const crowding = ctx.prevFamily === crop.family ? 0.12 : 0;

  const n2 = clamp(
    state.n + crop.n + (SOIL_DEFAULTS.baseN - state.n) * SOIL_DEFAULTS.reversion * ret,
    6,
    100
  );
  const p2 = clamp(
    state.p + crop.p + (SOIL_DEFAULTS.baseP - state.p) * SOIL_DEFAULTS.reversion * ret,
    6,
    100
  );
  const k2 = clamp(
    state.k + crop.k + (SOIL_DEFAULTS.baseK - state.k) * SOIL_DEFAULTS.reversion * ret,
    6,
    100
  );

  const om2 = clamp(
    state.om + crop.om + (SOIL_DEFAULTS.baseOM - state.om) * SOIL_DEFAULTS.omRate * prof.omDecay,
    4,
    100
  );

  const coverFactor = clamp01(crop.om / 6);
  const erosion = state.structure * 0.07 * (1 - 0.55 * coverFactor) * (prof.id === "sand" ? 1.3 : 1);
  const structure2 = clamp(state.structure + crop.roots - erosion, 5, 100);

  const disease = { ...state.disease } as Record<Family, number>;
  const breakMult = 1 - 0.35 * crop.diseaseBreak;
  for (const f of Object.keys(disease) as Family[]) {
    disease[f] = clamp(disease[f] * 0.85 * breakMult, 0, 1);
  }
  disease[crop.family] = clamp(
    disease[crop.family] + (0.15 + crowding) * (1 - crop.diseaseBreak * 0.5),
    0,
    1
  );

  const next: SoilState = {
    n: n2,
    p: p2,
    k: k2,
    om: om2,
    structure: structure2,
    disease,
  };

  const healthAfter = healthOf(next);
  const y = yieldOf(crop, state, ctx);

  const score =
    REWARD.yieldReturn * y +
    REWARD.healthDeltaW * (healthAfter - healthBefore) +
    REWARD.healthLevelW * (healthAfter / 100);

  return {
    season: 0,
    cropId: crop.id,
    crop,
    state: next,
    healthBefore,
    healthAfter,
    yieldPoints: y,
    score,
    disease: state.disease[crop.family],
    violated: [],
  };
}

export function evalSequence(
  ids: string[],
  initialState: SoilState,
  soilType: SoilType,
  prevFamily: Family | null
): SeasonResult[] {
  let state = { ...initialState };
  let prev = prevFamily;
  const results: SeasonResult[] = [];
  ids.forEach((id, i) => {
    const crop = CROPS_LOOKUP[id];
    const before = ids.slice(Math.max(0, i - 2), i).map((x) => CROPS_LOOKUP[x].family);
    const fresh = !before.includes(crop.family);
    const r = applyCrop(state, crop, { soilType, prevFamily: prev, fresh });
    const violated: string[] = [];
    if (prev === crop.family) violated.push("Repeats family back-to-back");
    results.push({ ...r, season: i + 1, violated });
    state = r.state;
    prev = crop.family;
  });
  return results;
}

export function describeCrop(crop: Crop): string {
  return `${crop.name} · ${familyName(crop.family)}`;
}

export function summarizeViolations(ids: string[], constraints: Constraints): string[] {
  const out: string[] = [];
  ids.forEach((id, i) => {
    const c = CROPS_LOOKUP[id];
    if (i > 0 && CROPS_LOOKUP[ids[i - 1]].family === c.family) {
      out.push(`Season ${i + 1}: same family as previous season`);
    }
  });
  for (let i = 0; i < ids.length; i++) {
    const c = CROPS_LOOKUP[ids[i]];
    if (constraints.minGap > 0) {
      for (
        let j = Math.max(0, i - constraints.minGap + 1);
        j < i;
        j++
      ) {
        if (CROPS_LOOKUP[ids[j]].family === c.family) {
          out.push(
            `Season ${i + 1}: same family within the ${constraints.minGap}-season rotation window`
          );
          break;
        }
      }
    }
  }
  for (let i = 0; i < ids.length; i++) {
    const windowStart = Math.max(0, i - constraints.legumeEvery + 1);
    const window = ids.slice(windowStart, i + 1);
    const hasLegume = window.some(
      (id) => CROPS_LOOKUP[id].family === "legume"
    );
    if (i - windowStart === constraints.legumeEvery - 1 && !hasLegume) {
      out.push(
        `Seasons ${windowStart + 1}–${i + 1}: no legume in a ${constraints.legumeEvery}-season window`
      );
    }
  }
  const coverCount = ids.filter((id) => CROPS_LOOKUP[id].coverCrop).length;
  if (coverCount < constraints.minCover) {
    out.push(`Only ${coverCount} cover crop(s) planted (min ${constraints.minCover})`);
  }
  const forbidden = ids.filter((id) => constraints.forbid.includes(id));
  if (forbidden.length > 0) {
    out.push(`Forbidden crop ${forbidden.join(", ")} used`);
  }
  return out;
}