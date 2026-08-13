import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { RotationResult } from "../engine/types";
import type { ReactNode } from "react";
import { fmt } from "../lib/meta";

const AXIS = { fill: "#8a9b90", fontSize: 12, tickLine: false, axisLine: false } as const;
const GRID = { stroke: "rgba(22,38,28,0.07)", vertical: false } as const;

function Tip({ active, payload, label, unit = "" }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.96)",
        border: "1px solid rgba(22,38,28,0.14)",
        borderRadius: 12,
        padding: "10px 14px",
        fontSize: 12.5,
        boxShadow: "0 16px 44px -18px rgba(20,45,30,0.45)",
      }}
    >
      {label !== undefined && (
        <div style={{ color: "var(--text-dim)", fontWeight: 600, marginBottom: 6 }}>
          {label}
        </div>
      )}
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
          <span style={{ width: 9, height: 9, borderRadius: 3, background: p.color, display: "inline-block" }} />
          <span style={{ color: "var(--text-dim)" }}>{p.name}:</span>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>
            {fmt(p.value, 2)}
            {unit}
          </span>
        </div>
      ))}
    </div>
  );
}

export function ChartCard({
  title,
  subtitle,
  children,
  height = 300,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  height?: number;
}) {
  return (
    <div className="card" style={{ padding: "24px 22px 18px" }}>
      <div style={{ marginBottom: 18 }}>
        <h3 style={{ fontSize: 17 }}>{title}</h3>
        {subtitle && (
          <p style={{ color: "var(--text-dim)", fontSize: 13, marginTop: 6, lineHeight: 1.5 }}>
            {subtitle}
          </p>
        )}
      </div>
      <div style={{ width: "100%", height }}>
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function HealthTrajectory({ results }: { results: RotationResult[] }) {
  const data = results[0]?.seasonResults.map((_, i) => {
    const row: Record<string, number | string> = { season: `S${i + 1}` };
    for (const r of results) row[r.strategyId] = r.seasonResults[i].healthAfter;
    return row;
  });

  return (
    <AreaChart data={data} margin={{ top: 6, right: 12, left: -14, bottom: 0 }}>
      <CartesianGrid {...GRID} />
      <XAxis dataKey="season" {...AXIS} />
      <YAxis domain={[30, 70]} {...AXIS} />
      <Tooltip content={<Tip unit="" />} />
      <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
      {results.map((r) => (
        <Area
          key={r.strategyId}
          type="monotone"
          dataKey={r.strategyId}
          name={r.label}
          stroke={COLOR[r.strategyId]}
          fillOpacity={0.12}
          fill={COLOR[r.strategyId]}
          strokeWidth={2.2}
          dot={false}
        />
      ))}
    </AreaChart>
  );
}

export function YieldBars({ results, horizon }: { results: RotationResult[]; horizon: number }) {
  const data = Array.from({ length: horizon }, (_, i) => {
    const row: Record<string, number | string> = { season: `Y${i + 1}` };
    for (const r of results) row[r.strategyId] = r.seasonResults[i].yieldPoints;
    return row;
  });

  return (
    <BarChart data={data} margin={{ top: 6, right: 12, left: -14, bottom: 0 }} barGap={2}>
      <CartesianGrid {...GRID} />
      <XAxis dataKey="season" {...AXIS} />
      <YAxis {...AXIS} />
      <Tooltip content={<Tip unit=" t/ac" />} cursor={{ fill: "rgba(22,38,28,0.05)" }} />
      <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
      {results.map((r) => (
        <Bar
          key={r.strategyId}
          dataKey={r.strategyId}
          name={r.label}
          fill={COLOR[r.strategyId]}
          radius={[4, 4, 0, 0]}
          maxBarSize={18}
        />
      ))}
    </BarChart>
  );
}

export function NutrientStacked({ result }: { result: RotationResult }) {
  const data = result.seasonResults.map((sr, i) => {
    const { n, p, k, om: o, structure: st } = sr.state;
    const total = n + p + k + o + st || 1;
    return {
      season: `S${i + 1}`,
      N: +(100 * (n / total)).toFixed(1),
      P: +(100 * (p / total)).toFixed(1),
      K: +(100 * (k / total)).toFixed(1),
      OM: +(100 * (o / total)).toFixed(1),
      Tilth: +(100 * (st / total)).toFixed(1),
    };
  });

  return (
    <AreaChart data={data} margin={{ top: 6, right: 12, left: -14, bottom: 0 }}>
      <CartesianGrid {...GRID} />
      <XAxis dataKey="season" {...AXIS} />
      <YAxis {...AXIS} />
      <Tooltip content={<Tip unit=" %" />} />
      <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
      <Area type="monotone" dataKey="N" stackId="1" stroke="#2f9a53" fill="#2f9a53" fillOpacity={0.85} />
      <Area type="monotone" dataKey="P" stackId="1" stroke="#0f9b5e" fill="#0f9b5e" fillOpacity={0.7} />
      <Area type="monotone" dataKey="K" stackId="1" stroke="#0d93a6" fill="#0d93a6" fillOpacity={0.6} />
      <Area type="monotone" dataKey="OM" stackId="1" stroke="#7a5cd6" fill="#7a5cd6" fillOpacity={0.6} />
      <Area type="monotone" dataKey="Tilth" stackId="1" stroke="#c97b00" fill="#c97b00" fillOpacity={0.55} />
    </AreaChart>
  );
}

const COLOR: Record<string, string> = {
  baseline: "#7f8f89",
  greedy: "#c97b00",
  adaptive: "#0d93a6",
  rl: "#7a5cd6",
};

export function SoilRadar({ results }: { results: RotationResult[] }) {
  const dims = ["N", "P", "K", "OM", "Tilth"] as const;
  const data = dims.map((d) => {
    const row: Record<string, number | string> = { dim: d };
    for (const r of results) {
      const last = r.seasonResults[r.seasonResults.length - 1].state;
      const v = d === "N" ? last.n : d === "P" ? last.p : d === "K" ? last.k : d === "OM" ? last.om : last.structure;
      row[r.strategyId] = v;
    }
    return row;
  });

  return (
    <RadarChart data={data} cx="50%" cy="50%" outerRadius="72%">
      <PolarGrid stroke="rgba(22,38,28,0.12)" />
      <PolarAngleAxis dataKey="dim" tick={{ fill: "#5c6f63", fontSize: 12 }} />
      <PolarRadiusAxis domain={[0, 100]} tick={{ fill: "#93a295", fontSize: 10 }} axisLine={false} />
      <Tooltip content={<Tip unit="" />} />
      <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
      {results.map((r) => (
        <Radar
          key={r.strategyId}
          dataKey={r.strategyId}
          name={r.label}
          stroke={COLOR[r.strategyId]}
          fill={COLOR[r.strategyId]}
          fillOpacity={0.18}
          strokeWidth={2}
        />
      ))}
    </RadarChart>
  );
}

export function LearningCurve({ series }: { series: number[] }) {
  const data = series.map((v, i) => ({ ep: i, reward: v }));
  return (
    <LineChart data={data} margin={{ top: 6, right: 12, left: -14, bottom: 0 }}>
      <CartesianGrid {...GRID} />
      <XAxis dataKey="ep" {...AXIS} tickFormatter={(v) => `${v}`} />
      <YAxis {...AXIS} />
      <Tooltip content={<Tip unit="" />} />
      <Line
        type="monotone"
        dataKey="reward"
        stroke="#7a5cd6"
        strokeWidth={2.4}
        dot={false}
        name="episode reward (30-avg)"
        isAnimationActive={false}
      />
    </LineChart>
  );
}