import type { ReactNode } from "react";
import { ListChecks, TrendingUp, Workflow } from "lucide-react";
import Reveal from "./Reveal";

function EqRow({ n, title, children }: { n: string; title: string; children: ReactNode }) {
  return (
    <Reveal>
      <div className="list-row" style={{ alignItems: "flex-start" }}>
        <div className="list-index">
          <span>{n}</span>
        </div>
        <div className="list-info">
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14, marginBottom: 8, color: "var(--text-dim)", letterSpacing: "0.04em", textTransform: "uppercase" }}>
            {title}
          </div>
          <div
            style={{
              background: "#fdfaf2",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: "14px 16px",
              fontFamily: "'Space Grotesk', monospace",
              fontSize: 14,
              overflowX: "auto",
              whiteSpace: "nowrap",
            }}
          >
            {children}
          </div>
        </div>
        <div className="list-arrow">
          <span>→</span>
        </div>
      </div>
    </Reveal>
  );
}

function Col({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, fontWeight: 700, color: "var(--amber)", fontFamily: "var(--font-display)", letterSpacing: "0.04em" }}>
        {icon}
        {title}
      </div>
      {children}
    </div>
  );
}

export default function ModelPanel() {
  return (
    <section id="math" className="section" style={{ overflow: "hidden" }}>
      <div className="container">
        <Reveal>
          <div style={{ marginBottom: 48 }}>
            <span className="eyebrow">the garden lab</span>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", marginTop: 14 }}>
              The model, specified
            </h2>
            <p style={{ color: "var(--text-dim)", marginTop: 10, maxWidth: 520, lineHeight: 1.6, fontSize: 15 }}>
              No black boxes — the whole pipeline is a deterministic system you
              can inspect.
            </p>
          </div>
        </Reveal>

        <div className="list-section">
          <EqRow n="01" title="Soil state vector (per season)">
            <div style={{ color: "var(--emerald)" }}>
              s<sub>t</sub> = (N, P, K, OM, Tilth, ψ<sub>crop</sub>)
            </div>
            <div style={{ color: "var(--text-dim)", marginTop: 4 }}>
              ψ<sub>c</sub> = per-family disease pressure ∈ [0, 1]
            </div>
          </EqRow>

          <EqRow n="02" title="Nutrient / residue dynamics">
            <div style={{ color: "var(--text-dim)" }}>
              N<sub>t+1</sub> = N<sub>t</sub> + a<sub>c</sub> + ρ·(N̄ − N<sub>t</sub>)
            </div>
            <div style={{ color: "var(--text-dim)", marginTop: 4 }}>
              OM<sub>t+1</sub> = OM<sub>t</sub> + r<sub>c</sub> − δ·OM<sub>t</sub>
            </div>
            <div style={{ color: "var(--text-faint)", marginTop: 4 }}>
              a<sub>c</sub> &lt; 0 draws down (uptake), a<sub>c</sub> &gt; 0 fixes (legume)
            </div>
          </EqRow>

          <EqRow n="03" title="Seasonal yield">
            <div style={{ color: "var(--text-dim)" }}>
              Y<sub>t</sub> = β<sub>c</sub>·F(N,P,K)·O(OM)·T(Tilth)·(1 − 0.7·ψ<sub>c</sub>)·γ<sub>soil</sub>·1.07<sup>fresh</sup>
            </div>
            <div style={{ color: "var(--text-faint)", marginTop: 4 }}>
              fresh = family not seen in prior 2 seasons (+7% diversity bonus)
            </div>
          </EqRow>

          <EqRow n="04" title="Objective (all strategies)">
            <div style={{ color: "var(--cyan)" }}>
              max Σ<sub>t</sub> [ Y<sub>t</sub> + 0.06·Δh<sub>t</sub> + 0.45·h<sub>t</sub> ] + 0.5·h<sub>T</sub>
            </div>
            <div style={{ color: "var(--text-faint)", marginTop: 4 }}>
              h = health score; "banked soil" terminal term rewards not coasting.
            </div>
          </EqRow>
        </div>

        <Reveal>
          <div className="glass" style={{ marginTop: 8, padding: "22px 24px" }}>
            <div className="grid grid-3" style={{ gap: 24 }}>
              <Col icon={<ListChecks size={14} />} title="Hard constraints">
                <ul style={{ margin: "10px 0 0", paddingLeft: 16, color: "var(--text-dim)", fontSize: 13, lineHeight: 1.85 }}>
                  <li>No family back-to-back</li>
                  <li>≥ 1 legume per <b style={{ color: "var(--emerald)" }}>legumeEvery</b> window</li>
                  <li>≥ <b style={{ color: "var(--emerald)" }}>minGap</b> seasons between same family</li>
                  <li>Cover-crop quota across horizon</li>
                </ul>
              </Col>
              <Col icon={<Workflow size={14} />} title="Optimizer signature">
                <p style={{ marginTop: 10, color: "var(--text-dim)", fontSize: 13, lineHeight: 1.85 }}>
                  Annealing over the sequence space with a decaying temperature
                  T · 0.9996<sup>k</sup> and Metropolis acceptance, then a
                  coordinate-wise hill-climb until local optimum.
                </p>
              </Col>
              <Col icon={<TrendingUp size={14} />} title="Q-Learning signature">
                <p style={{ marginTop: 10, color: "var(--text-dim)", fontSize: 13, lineHeight: 1.85 }}>
                  Tabular Q-Learning: s → (N,P,K,OM,Tilth,ψ) coarsely bucketized
                  (≈540 states) × 12 actions. α = 0.25, γ = 0.9, ε decays 0.7 →
                  0.05 over 600 episodes.
                </p>
              </Col>
            </div>
          </div>
        </Reveal>

        <Reveal>
          <div style={{ textAlign: "center", marginTop: 36, color: "var(--text-faint)", fontSize: 13.5, maxWidth: 640, marginInline: "auto" }}>
            Full source lives in <span style={{ color: "var(--text-dim)", fontFamily: "monospace" }}>src/engine/</span> —
            crops catalog, soil model, simulated annealing, and the Q-Learning
            policy, each a standalone typed module.
          </div>
        </Reveal>
      </div>
    </section>
  );
}