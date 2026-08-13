import { motion } from "framer-motion";
import { Sprout } from "lucide-react";
import type { RotationResult, SeasonResult, SetupData } from "../engine/types";
import { familyColor } from "../engine/crops";
import { summarizeViolations } from "../engine/model";
import RotationCard from "./RotationCard";
import Reveal from "./Reveal";
import {
  ChartCard,
  HealthTrajectory,
  LearningCurve,
  NutrientStacked,
  SoilRadar,
  YieldBars,
} from "./charts";
import { STRATEGY_COLORS, fam } from "../lib/meta";
import { CropGlyph } from "./icons";

export interface SolveOutput {
  all: RotationResult[];
  ranked: RotationResult[];
  learningCurve: number[];
}

function TimelineRow({ result }: { result: RotationResult }) {
  return (
    <div style={{ marginTop: 30 }} className="timeline-scroll">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${result.sequence.length}, 1fr)`,
          gap: 10,
          minWidth: result.sequence.length * 92,
        }}
      >
        {result.seasonResults.map((sr: SeasonResult, i) => {
          const c = sr.crop;
          const fcol = familyColor(c.family);
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.5 }}
              style={{
                textAlign: "center",
                borderRadius: 16,
                border: `1px solid ${fcol}55`,
                background: `linear-gradient(180deg, ${fcol}14, #fff)`,
                padding: "16px 8px 14px",
                position: "relative",
                boxShadow: "0 12px 30px -20px rgba(20,45,30,0.5)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 8,
                  left: 8,
                  fontSize: 10,
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  color: "var(--text-faint)",
                  background: "rgba(22,38,28,0.05)",
                  borderRadius: 6,
                  padding: "2px 7px",
                }}
              >
                S{i + 1}
              </div>
              <div style={{ display: "grid", placeItems: "center" }}>
                <CropGlyph family={c.family} size={38} strokeWidth={1.5} />
              </div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 600,
                  fontSize: 13.5,
                  marginTop: 8,
                }}
              >
                {c.name}
              </div>
              <div
                style={{
                  fontSize: 10.5,
                  color: fcol,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  fontWeight: 600,
                  marginTop: 3,
                }}
              >
                {fam(c.family)}
              </div>
              <div
                style={{
                  marginTop: 10,
                  height: 5,
                  borderRadius: 99,
                  background: "rgba(22,38,28,0.07)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${Math.min(100, (sr.yieldPoints / 1.3) * 100)}%`,
                    background: "linear-gradient(90deg,#2f9a53,#0f9b5e)",
                    borderRadius: 99,
                  }}
                />
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--text-dim)",
                  marginTop: 6,
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "0 2px",
                }}
              >
                <span>yield {sr.yieldPoints.toFixed(2)}</span>
                <span style={{ color: "var(--emerald)" }}>
                  soil {sr.healthAfter.toFixed(0)}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default function Results({
  data,
  setup,
}: {
  data: SolveOutput;
  setup: SetupData;
}) {
  const winner = data.ranked[0];
  const maxScore = data.ranked[0].score;
  const violationsMap = Object.fromEntries(
    data.all.map((r) => [
      r.strategyId,
      summarizeViolations(r.sequence, setup.constraints),
    ])
  );
  const horizon = setup.horizon;

  return (
    <section id="results" className="section" style={{ paddingTop: 40 }}>
      <div className="container">
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <span className="eyebrow">computed in ≈50 ms</span>
            <h2 style={{ fontSize: "clamp(32px, 4.5vw, 48px)", marginTop: 18 }}>
              Your {horizon}-season plan
            </h2>
            <p style={{ color: "var(--text-dim)", marginTop: 14, maxWidth: 640, marginInline: "auto" }}>
              Four strategies raced the same soil model toward the same
              objective. Here's the winner and what the alternatives would
              have cost you.
            </p>
          </div>
        </Reveal>

        {/* Winner callout */}
        <Reveal>
          <div
            className="glass"
            style={{
              padding: "clamp(22px, 4vw, 34px)",
              borderColor: `${STRATEGY_COLORS[winner.strategyId]}55`,
              background: `linear-gradient(160deg, ${STRATEGY_COLORS[winner.strategyId]}0f, rgba(255,255,255,0.8))`,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <h3
                style={{
                  fontSize: "clamp(20px, 3vw, 26px)",
                  color: STRATEGY_COLORS[winner.strategyId],
                }}
              >
                Recommended: {winner.label}
              </h3>
              <span style={{ color: "var(--text-dim)", fontSize: 14 }}>
                objective score {winner.score.toFixed(2)} · final soil{" "}
                <b style={{ color: "var(--emerald)" }}>
                  {winner.finalHealth.toFixed(0)}
                </b>{" "}
                · total yield{" "}
                <b style={{ color: "#c97b00" }}>
                  {winner.totalYield.toFixed(2)}
                </b>
              </span>
            </div>
            <TimelineRow result={winner} />
          </div>
        </Reveal>

        {/* Strategy cards */}
        <div className="grid grid-2" style={{ marginTop: 40 }}>
          {data.ranked.map((r, i) => (
            <Reveal key={r.strategyId} delay={i * 0.08}>
              <RotationCard
                result={r}
                rank={i}
                maxScore={maxScore}
                violations={violationsMap[r.strategyId] ?? []}
              />
            </Reveal>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-2" style={{ marginTop: 18 }}>
          <Reveal>
            <ChartCard
              title="Soil health trajectory"
              subtitle="Weighted soil health score after each season. The baseline habit runs the field down; the optimizers hold it up."
            >
              <HealthTrajectory results={data.all} />
            </ChartCard>
          </Reveal>
          <Reveal delay={0.1}>
            <ChartCard
              title="Yield per season"
              subtitle="Modeled tonnes/acre per season by strategy. Longer planning protects yield without a yield penalty."
            >
              <YieldBars results={data.all} horizon={horizon} />
            </ChartCard>
          </Reveal>
          <Reveal>
            <ChartCard
              title="Final soil profile"
              subtitle="Radar of the five state dimensions at the end of the horizon — who leaves the land better than they found it?"
              height={330}
            >
              <SoilRadar results={data.all} />
            </ChartCard>
          </Reveal>
          <Reveal delay={0.1}>
            <ChartCard
              title="Q-Learning training curve"
              subtitle="Tabular Q-Learning, 600 episodes, epsilon-greedy. Reward climbs as the policy discovers rotating beats grinding."
              height={330}
            >
              <LearningCurve series={data.learningCurve} />
            </ChartCard>
          </Reveal>
        </div>

        <Reveal>
          <ChartCard
            title="Recommended plan · soil composition"
            subtitle="Share of the soil profile occupied by each dimension across the winning rotation. Legumes and covers rebuild what cash crops spend."
            height={260}
          >
            <NutrientStacked result={winner} />
          </ChartCard>
        </Reveal>

        <Reveal>
          <div
            style={{
              marginTop: 24,
              display: "flex",
              justifyContent: "space-between",
              color: "var(--text-faint)",
              fontSize: 13,
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <span>4 strategies · deterministic runs</span>
            <span>
              <Sprout size={13} style={{ verticalAlign: -2, display: "inline" }} />{" "}
              same inputs → same plan, every run
            </span>
            <span>
              objective, constraints & equations →{" "}
              <a href="#math" style={{ color: "var(--emerald)" }}>
                the math
              </a>
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}