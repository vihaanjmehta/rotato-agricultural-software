import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { BarChart3, Layers, Workflow } from "lucide-react";
import Reveal from "./Reveal";
import CropWheel from "./CropWheel";

const STEPS = [
  {
    n: "01",
    Icon: Layers,
    title: "Soil dynamics model",
    color: "#c97b00",
    body: "Five state variables — N, P, K, organic matter, tilth — plus per-family disease pressure evolve under every crop's uptake, residue and rooting profile.",
    tag: "deterministic dynamics",
  },
  {
    n: "02",
    Icon: Workflow,
    title: "Constraint optimizer",
    color: "#0d93a6",
    body: "Simulated annealing searches the legal sequence space, then a hill-climbing pass polishes. It respects hard agronomic rules about legumes, cover and family spacing.",
    tag: "metaheuristic search",
  },
  {
    n: "03",
    Icon: BarChart3,
    title: "Q-Learning policy",
    color: "#7a5cd6",
    body: "A tabular reinforcement-learning agent picks crops from reward alone — never shown the soil physics — then rolls out the policy it learned.",
    tag: "tabular Q-learning",
  },
];

export default function HowItWorks() {
  const ref = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const accentY = useTransform(scrollYProgress, [0, 1], [60, -60]);

  return (
    <section id="method" className="section" style={{ overflow: "hidden" }} ref={ref}>
      {/* parallax accent */}
      <motion.div
        aria-hidden
        style={{
          position: "absolute",
          right: "5%",
          top: "12%",
          width: 160,
          height: 160,
          borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
          background: "radial-gradient(circle at 38% 30%, rgba(246,200,210,0.08), rgba(236,154,176,0.04))",
          y: accentY,
          pointerEvents: "none",
        }}
      />

      <div className="container">
        <Reveal>
          <div style={{ marginBottom: 48 }}>
            <span className="eyebrow">the three engines</span>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", marginTop: 14 }}>
              Three paths through the soil
            </h2>
            <p style={{ color: "var(--text-dim)", marginTop: 10, maxWidth: 500, lineHeight: 1.6, fontSize: 15 }}>
              Every strategy maximizes the same objective. The difference is
              how much of the future each one can see.
            </p>
          </div>
        </Reveal>

        <Reveal>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 48 }}>
            <CropWheel size={300} />
            <div style={{ marginTop: 14, fontSize: 11.5, color: "var(--text-faint)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600 }}>
              the rotation wheel — scroll to spin
            </div>
          </div>
        </Reveal>

        <div className="list-section">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.08}>
              <div className="list-row">
                <div className="list-index">
                  <span>{s.n}</span>
                </div>
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    display: "grid",
                    placeItems: "center",
                    background: "#fdfaf2",
                    border: `1px solid ${s.color}40`,
                    flexShrink: 0,
                  }}
                >
                  <s.Icon size={22} strokeWidth={1.8} style={{ color: s.color }} />
                </div>
                <div className="list-info">
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15.5 }}>
                    {s.title}
                  </div>
                  <p style={{ color: "var(--text-dim)", fontSize: 13.5, lineHeight: 1.6, marginTop: 4 }}>
                    {s.body}
                  </p>
                  <span
                    style={{
                      display: "inline-block",
                      marginTop: 8,
                      fontSize: 10.5,
                      fontWeight: 600,
                      fontFamily: "var(--font-display)",
                      letterSpacing: "0.07em",
                      textTransform: "uppercase",
                      color: s.color,
                      background: "rgba(22,38,28,0.04)",
                      border: "1px solid rgba(22,38,28,0.08)",
                      padding: "3px 10px",
                      borderRadius: 999,
                    }}
                  >
                    {s.tag}
                  </span>
                </div>
                <div className="list-arrow">
                  <span>→</span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}