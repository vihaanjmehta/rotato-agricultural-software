# rotato

A crop rotation optimizer that turns field history and soil type into a multi-season planting plan. Three optimization engines — simulated annealing, hill-climbing, and tabular Q-learning — race the same deterministic soil model, with every strategy and equation fully inspectable.

## Features

- **Soil dynamics model** — Five state variables (N, P, K, organic matter, tilth) plus per-family disease pressure evolve under every crop's uptake, residue, and rooting profile.
- **Simulated annealing + hill-climb** — Searches the legal sequence space with Metropolis acceptance, then polishes to a local optimum. Respects hard agronomic rules (family spacing, legume windows, cover crop quotas).
- **Tabular Q-learning** — A reinforcement-learning agent picks crops from reward alone, never shown the soil physics, then rolls out the learned policy.
- **12-crop catalog** — Each crop is characterized by its nitrogen fixation, organic matter contribution, rooting/tilth effect, and family.
- **Results dashboard** — Strategy rankings, yield-per-season charts, soil health trajectories, and final soil profiles rendered as interactive charts.
- **Sunflower hero** — Detailed SVG botanical illustration with parallax scrolling and mouse-tracking tilt.
- **Numbered list UI** — MiMo-inspired minimal layout with animated reveals and 3D card effects.

## Tech stack

- React + TypeScript
- Vite
- Framer Motion
- Recharts
- Lucide icons

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Build

```bash
npm run build
npm run preview
```

## How it works

1. Pick a soil type (loam, clay, sand, silt) and a planning horizon.
2. Set agronomic rules — legume frequency, family spacing, cover crop minimums.
3. Optionally exclude crops and choose a baseline rotation for comparison.
4. Hit **Compute rotation** — all three strategies solve in ~50 ms.
5. Inspect the results: rankings, charts, soil state evolution, and the full math behind every number.
