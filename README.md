# rotato

A crop rotation optimizer that turns field history and soil type into a multi-season planting plan. Four strategies (a farmer baseline, a greedy planner, simulated annealing with hill-climb polish, and tabular Q-learning) compete on the same deterministic soil model, with every strategy and equation fully inspectable. Everything runs client-side in the browser; there is no backend.

## Features

- **Soil dynamics model**: five state variables (N, P, K, organic matter, structure) plus per-family disease pressure evolve under every crop's uptake, residue, and rooting profile.
- **Simulated annealing + hill-climb**: searches the legal sequence space with Metropolis acceptance, then polishes to a local optimum. Respects hard agronomic rules (family spacing, legume windows, cover crop quotas).
- **Tabular Q-learning**: a reinforcement-learning agent picks crops from reward alone, never shown the soil physics, then rolls out the learned policy.
- **12-crop catalog**: each crop is characterized by its nitrogen fixation, organic matter contribution, rooting/tilth effect, and family.
- **Results dashboard**: strategy rankings, yield-per-season charts, soil health trajectories, and final soil profiles rendered as interactive charts.
- **Sunflower hero**: detailed SVG botanical illustration with parallax scrolling and mouse-tracking tilt.
- **Numbered list UI**: MiMo-inspired minimal layout with animated reveals and 3D card effects.

## Tech stack

- React 19 + TypeScript
- Vite
- Framer Motion
- Recharts
- Lucide icons

## Getting started

Requires Node.js 20+.

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

Other scripts:

```bash
npm run build     # type-check and build for production
npm run preview   # serve the production build locally
npm run lint      # lint with oxlint
```

## Project layout

```
src/
  engine/      # all the math, no React imports
    soil.ts        # soil type profiles and initial state
    crops.ts       # 12-crop catalog with agronomic profiles
    model.ts       # soil transition, yield, and reward equations
    optimizer.ts   # greedy, simulated annealing, hill-climb, constraint checks
    rl.ts          # tabular Q-learning agent and policy rollout
    solver.ts      # runs every strategy against the same setup
  components/  # UI: simulator, results dashboard, hero animations
```

## How it works

1. Pick a soil type (loam, clay, sand, silt) and a planning horizon.
2. Set agronomic rules: legume frequency, family spacing, cover crop minimums.
3. Optionally exclude crops and choose a baseline rotation for comparison.
4. Hit **Compute rotation**. All strategies solve in about 50 ms.
5. Inspect the results: rankings, charts, soil state evolution, and the full math behind every number.

## The model

All of this lives in `src/engine/`. The simulation is fully deterministic: both stochastic solvers use a seeded mulberry32 PRNG, so the same inputs always produce the same plan.

### Soil state

The field is a vector of five values on a 0 to 100 scale (nitrogen, phosphorus, potassium, organic matter, structure) plus a disease pressure level from 0 to 1 for each of the seven crop families. Each soil type sets the starting state and three physical parameters: `retention` (how strongly nutrients revert toward their base levels), `omDecay` (how fast organic matter burns off; sand is 1.5, clay is 0.72), and `waterStress` (a flat yield penalty scaled by each crop's water demand).

### Season transition (`model.ts`, `applyCrop`)

Planting a crop updates the state as follows:

- **Nutrients**: each of N, P, K moves by the crop's uptake or fixation (legumes have positive N), plus a mean-reversion term `(base - current) * 0.16 * retention` that slowly pulls depleted soil back toward its natural fertility.
- **Organic matter**: gains the crop's residue contribution, plus reversion toward a base of 55 at a rate scaled by the soil's `omDecay`.
- **Structure**: gains the crop's rooting effect and loses 7% per season to erosion. Ground cover cuts erosion by up to 55%, and sandy soil erodes 1.3x faster.
- **Disease**: every family's pressure decays by 15% per season, further reduced if the crop is a disease-breaker. The planted crop's own family gains +0.15 (+0.12 more if it repeats the previous season's family), which is what makes monoculture self-destructive in this model.

### Yield (`model.ts`, `yieldOf`)

Yield is the crop's base yield times a chain of multipliers:

```
yield = base x fertility x structure x organicMatter x disease x soilFit x water
```

- **Fertility** is `0.5 + 0.5 * sufficiency`, where sufficiency weights current N, P, K by the crop's individual sensitivity to each nutrient (clamped to 1).
- **Disease** multiplies yield by `1 - min(0.5, 0.7 * pressure)`, so heavy pressure can halve a harvest.
- **Soil fit** compares the crop's preferred texture to the soil's texture: a perfect match gives 1.32x, the worst mismatch 0.72x.
- Repeating the previous season's family costs a flat 30% penalty; a family not planted in the last two seasons earns a 7% freshness bonus.

### Score and soil health

Soil health is a weighted average of the five state variables (N 30%, P 22%, K 16%, OM 18%, structure 14%). Each season scores

```
score = yield + 0.06 * (healthAfter - healthBefore) + 0.45 * (health / 100)
```

and a plan's total score adds a terminal bonus of `0.5 * finalHealth / 100`, so strategies are rewarded for leaving the field better than they found it, not just for extracting yield.

### Constraints (`optimizer.ts`)

Hard rules checked on every sequence: no family repeated back-to-back, no family repeated within the configured gap window, at least one legume in every window of the configured size, a minimum number of cover crop seasons, and no forbidden crops. The annealer only accepts moves that keep the sequence legal.

### The four strategies (`solver.ts`)

- **Baseline**: the grower's habitual rotation repeated cyclically over the horizon, as a control.
- **Greedy**: at each season, simulates every legal crop one step ahead and picks the highest immediate score. Myopic by design, to show what short-term optimization misses.
- **Adaptive (simulated annealing)**: starts from a random legal sequence and runs 12,000 iterations of Metropolis search. Each iteration proposes a swap of two seasons (50%), a single-slot replacement (35%), or a small block rotation (15%). Better sequences are always accepted; worse ones are accepted with probability `exp(delta / T)`, where the temperature starts at 2.5 and cools geometrically by 0.9996 per iteration. The best sequence found is then polished with best-improvement hill climbing: sweep every slot, try every legal replacement, repeat until no single change improves the total score.
- **Q-learning**: a tabular agent that never sees the soil equations. The continuous state is discretized into buckets (average NPK into 4, organic matter into 3, structure into 3, worst disease pressure into 3, seasons remaining into 5), giving a small lookup table keyed by bucket combination. It trains for 600 episodes with epsilon-greedy exploration (epsilon decays from 0.7 toward a floor of 0.05) and the standard update `Q += alpha * (r + gamma * max Q' - Q)` with a learning rate of 0.25 and discount of 0.9. The final plan is a greedy rollout of the learned table. The results page charts its learning curve.
