import { TriangleAlert } from "lucide-react";
import type { RotationResult } from "../engine/types";
import { cropById, familyColor } from "../engine/crops";
import { STRATEGY_COLORS, STRATEGY_NAMES, fmt } from "../lib/meta";
import { CropGlyph, StrategyBadge } from "./icons";

export default function RotationCard({
  result,
  rank,
  maxScore,
  violations,
}: {
  result: RotationResult;
  rank: number;
  maxScore: number;
  violations: string[];
}) {
  const color = STRATEGY_COLORS[result.strategyId];
  const share = (result.score / maxScore) * 100;
  const gap = Math.max(0, 1 - result.score / maxScore) * 100;

  return (
    <div
      className="card"
      style={{
        borderColor: rank === 0 ? `${color}66` : undefined,
        boxShadow: rank === 0 ? `0 24px 60px -26px ${color}66` : undefined,
        position: "relative",
        padding: "24px 22px",
      }}
    >
      {rank === 0 && (
        <div
          style={{
            position: "absolute",
            top: -12,
            right: 18,
            background: "linear-gradient(135deg,#2f9a53,#0f9b5e)",
            color: "#fff",
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: 12,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            padding: "5px 12px",
            borderRadius: 999,
            boxShadow: "0 10px 26px -8px rgba(15,155,94,0.6)",
          }}
        >
          recommended
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <StrategyBadge id={result.strategyId} color={color} />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h3 style={{ fontSize: 17 }}>
              {STRATEGY_NAMES[result.strategyId]}
            </h3>
            <span
              style={{
                fontSize: 10.5,
                fontWeight: 700,
                fontFamily: "var(--font-display)",
                letterSpacing: "0.1em",
                color: rank === 0 ? "var(--emerald)" : "var(--text-faint)",
                background: rank === 0 ? "rgba(15,155,94,0.1)" : "rgba(22,38,28,0.05)",
                border: rank === 0 ? "1px solid rgba(15,155,94,0.3)" : "1px solid var(--border)",
                padding: "3px 9px",
                borderRadius: 999,
              }}
            >
              rank {rank + 1}
            </span>
          </div>
          <p style={{ color: "var(--text-dim)", fontSize: 12.5, marginTop: 3 }}>
            {result.description}
          </p>
        </div>
      </div>

      {/* metrics */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 10,
          marginTop: 20,
          textAlign: "center",
        }}
      >
        <div style={{ background: "rgba(22,38,28,0.04)", borderRadius: 12, padding: "12px 6px" }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color }}>
            {result.score.toFixed(2)}
          </div>
          <div style={{ color: "var(--text-faint)", fontSize: 11, marginTop: 3 }}>objective score</div>
        </div>
        <div style={{ background: "rgba(22,38,28,0.04)", borderRadius: 12, padding: "12px 6px" }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22 }}>
            {result.totalYield.toFixed(2)}
          </div>
          <div style={{ color: "var(--text-faint)", fontSize: 11, marginTop: 3 }}>total yield</div>
        </div>
        <div style={{ background: "rgba(22,38,28,0.04)", borderRadius: 12, padding: "12px 6px" }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22 }}>
            {result.finalHealth.toFixed(0)}
          </div>
          <div style={{ color: "var(--text-faint)", fontSize: 11, marginTop: 3 }}>final soil health</div>
        </div>
      </div>

      {/* relative bar */}
      <div style={{ marginTop: 16 }}>
        <div
          style={{
            height: 8,
            borderRadius: 999,
            background: "rgba(22,38,28,0.07)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${Math.max(share, rank === 0 ? 100 : 2)}%`,
              background: `linear-gradient(90deg, ${color}88, ${color})`,
              borderRadius: 999,
              transition: "width 0.6s ease",
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 11,
            color: "var(--text-faint)",
            marginTop: 6,
          }}
        >
          <span>{share.toFixed(0)}% of best</span>
          <span>{rank === 0 ? "—" : `${fmt(gap, 1)}% below best`}</span>
        </div>
      </div>

      {/* sequence strip */}
      <div style={{ display: "flex", gap: 6, marginTop: 18, flexWrap: "wrap" }}>
        {result.sequence.map((id, i) => {
          const c = cropById(id);
          const fcol = familyColor(c.family);
          return (
            <div
              key={i}
              title={`${c.name}`}
              style={{
                flex: 1,
                minWidth: 52,
                textAlign: "center",
                background: "rgba(22,38,28,0.03)",
                border: `1px solid ${fcol}44`,
                borderRadius: 10,
                padding: "8px 4px",
              }}
            >
              <div
                style={{
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <CropGlyph family={c.family} size={18} />
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: fcol,
                  fontFamily: "var(--font-display)",
                  fontWeight: 600,
                  marginTop: 5,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                {c.name.split(" ")[0]}
              </div>
            </div>
          );
        })}
      </div>

      {violations.length > 0 && (
        <div
          style={{
            marginTop: 14,
            background: "rgba(194,69,63,0.07)",
            border: "1px solid rgba(194,69,63,0.25)",
            borderRadius: 12,
            padding: "10px 14px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              fontSize: 12,
              fontWeight: 600,
              color: "#c2453f",
            }}
          >
            <TriangleAlert size={14} /> Departs from the rules set
          </div>
          {violations.slice(0, 2).map((v, i) => (
            <div key={i} style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 4 }}>
              · {v}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}