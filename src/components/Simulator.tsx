import { useState } from "react";
import { Check } from "lucide-react";
import type { Family, SetupData, SoilState, SoilType } from "../engine/types";
import { cropById, CROPS } from "../engine/crops";
import { initialStateFor, SOIL_PROFILES } from "../engine/soil";
import Reveal from "./Reveal";
import FlowerButton from "./FlowerButton";
import { CropGlyph } from "./icons";

const SOIL_ORDER: SoilType[] = ["loam", "clay", "sand", "silt"];

const PRESETS: { label: string; seq: string[] }[] = [
  { label: "Corn · Soy · Wheat", seq: ["corn", "soybean", "wheat"] },
  { label: "Corn · Wheat · Potato", seq: ["corn", "wheat", "potato"] },
  { label: "Soy · Potato · Wheat", seq: ["soybean", "potato", "wheat"] },
];

interface Props {
  onRun: (setup: SetupData) => void;
  busy: boolean;
}

function Slider({
  label,
  value,
  min,
  max,
  suffix,
  accent,
  onChange,
  hint,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  suffix?: string;
  accent: string;
  hint: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontSize: 14, fontWeight: 600, fontFamily: "var(--font-display)" }}>
          {label}
        </span>
        <span style={{ fontSize: 15, fontFamily: "var(--font-display)", fontWeight: 700, color: accent }}>
          {value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%", margin: "12px 0 4px" }}
      />
      <div style={{ fontSize: 12, color: "var(--text-faint)" }}>{hint}</div>
    </div>
  );
}

export default function Simulator({ onRun, busy }: Props) {
  const [soilType, setSoilType] = useState<SoilType>("loam");
  const [horizon, setHorizon] = useState(6);
  const [prevCrop, setPrevCrop] = useState<string>("none");
  const [legumeEvery, setLegumeEvery] = useState(3);
  const [minCover, setMinCover] = useState(1);
  const [minGap, setMinGap] = useState(3);
  const [forbidden, setForbidden] = useState<string[]>([]);
  const [preset, setPreset] = useState(0);

  const prevFamily: Family | null =
    prevCrop === "none" ? null : cropById(prevCrop).family;

  const run = () => {
    const setup: SetupData = {
      soilType,
      horizon,
      initialState: initialStateFor(soilType) as SoilState,
      prevFamily,
      constraints: {
        legumeEvery,
        minCover,
        minGap,
        forbid: forbidden,
      },
      presetSequence: PRESETS[preset].seq,
    };
    onRun(setup);
  };

  return (
    <section id="simulate" className="section" style={{ overflow: "hidden" }}>
      <div className="container">
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: 44 }}>
            <span className="eyebrow">the greenhouse</span>
            <h2 style={{ fontSize: "clamp(32px, 4.5vw, 48px)", marginTop: 18 }}>
              Plan your garden beds
            </h2>
            <p style={{ color: "var(--text-dim)", marginTop: 14, maxWidth: 560, marginInline: "auto" }}>
              Pick a soil, a horizon, and the agronomic rules you farm by. The
              same inputs always produce the same plan.
            </p>
          </div>
        </Reveal>

        <Reveal>
          <div className="glass" style={{ padding: "clamp(22px, 4vw, 40px)" }}>
            {/* Soil type */}
            <div style={{ marginBottom: 30 }}>
              <h3 style={{ fontSize: 16, marginBottom: 14 }}>Soil type</h3>
              <div className="grid grid-4">
                {SOIL_ORDER.map((id) => {
                  const p = SOIL_PROFILES[id];
                  const active = soilType === id;
                  return (
                    <button
                      key={id}
                      onClick={() => setSoilType(id)}
                      style={{
                        position: "relative",
                        borderRadius: 16,
                        border: active
                          ? `1.5px solid ${p.from}`
                          : "1px solid var(--border)",
                        background: active
                          ? `linear-gradient(160deg, ${p.from}14, rgba(255,253,247,0.85))`
                          : "#fdfaf2",
                        padding: "18px 14px",
                        cursor: "pointer",
                        color: "var(--text)",
                        textAlign: "left",
                        transition: "all 0.25s cubic-bezier(0.22,1,0.36,1)",
                        overflow: "hidden",
                        fontFamily: "var(--font-body)",
                        boxShadow: active ? `0 18px 40px -20px ${p.from}59` : "var(--shadow-xs)",
                      }}
                      onMouseEnter={(e) => {
                        if (!active) e.currentTarget.style.transform = "translateY(-3px)";
                      }}
                      onMouseLeave={(e) => {
                        if (!active) e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      {active && (
                        <div
                          style={{
                            position: "absolute",
                            top: 10,
                            right: 10,
                            fontSize: 11,
                            fontWeight: 700,
                            color: p.from,
                          }}
                        >
                          <Check size={13} strokeWidth={3} style={{ color: p.from }} />
                        </div>
                      )}
                      <div
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: 9,
                          background: `linear-gradient(135deg, ${p.from}, ${p.to})`,
                          boxShadow: "0 8px 18px -8px rgba(20,45,30,0.45)",
                        }}
                      />
                      <div
                        style={{
                          fontFamily: "var(--font-display)",
                          fontWeight: 600,
                          fontSize: 15,
                          marginTop: 12,
                        }}
                      >
                        {p.name}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 6, lineHeight: 1.4 }}>
                        {p.blurb}
                      </div>
                      <div style={{ display: "flex", gap: 10, marginTop: 10, fontSize: 11, color: "var(--text-faint)" }}>
                        <span>retention {p.retention.toFixed(2)}×</span>
                        <span>OM decay {p.omDecay.toFixed(2)}×</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* History + horizon */}
            <div className="grid grid-2" style={{ marginBottom: 30 }}>
              <div>
                <h3 style={{ fontSize: 16, marginBottom: 14 }}>Last season</h3>
                <select
                  value={prevCrop}
                  onChange={(e) => setPrevCrop(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 12,
                    background: "#fdfaf2",
                    border: "1px solid var(--border-strong)",
                    color: "var(--text)",
                    fontFamily: "var(--font-body)",
                    fontSize: 14,
                    cursor: "pointer",
                    boxShadow: "0 8px 22px -18px rgba(20,45,30,0.4)",
                  }}
                >
                  <option value="none">No field history</option>
                  {CROPS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <p style={{ fontSize: 12, color: "var(--text-faint)", marginTop: 8 }}>
                  Seeds disease pressure and the first-family constraint.
                </p>
              </div>
              <div>
                <Slider
                  label="Planning horizon"
                  value={horizon}
                  min={3}
                  max={8}
                  suffix=" seasons"
                  accent="var(--emerald)"
                  hint="How many seasons ahead to optimize."
                  onChange={setHorizon}
                />
              </div>
            </div>

            {/* Constraints */}
            <div style={{ marginBottom: 30 }}>
              <h3 style={{ fontSize: 16, marginBottom: 14 }}>Agronomic rules</h3>
              <div className="grid grid-3" style={{ gap: 24 }}>
                <Slider
                  label="Legume window"
                  value={legumeEvery}
                  min={2}
                  max={5}
                  suffix=" yrs"
                  accent="#0f9b5e"
                  hint="At least one legume per window."
                  onChange={setLegumeEvery}
                />
                <Slider
                  label="Family spacing"
                  value={minGap}
                  min={0}
                  max={4}
                  suffix=" yrs"
                  accent="#0d93a6"
                  hint="Min seasons between same family."
                  onChange={setMinGap}
                />
                <Slider
                  label="Cover crops"
                  value={minCover}
                  min={0}
                  max={2}
                  accent="#7a5cd6"
                  hint="Minimum covers across horizon."
                  onChange={setMinCover}
                />
              </div>
            </div>

            {/* Forbid chips */}
            <div style={{ marginBottom: 30 }}>
              <h3 style={{ fontSize: 16, marginBottom: 14 }}>
                Excluded crops{" "}
                <span style={{ color: "var(--text-faint)", fontWeight: 400, fontSize: 13 }}>
                  (optional)
                </span>
              </h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {CROPS.map((c) => {
                  const on = forbidden.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      onClick={() =>
                        setForbidden((f) =>
                          on ? f.filter((x) => x !== c.id) : [...f, c.id]
                        )
                      }
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 7,
                        border: on
                          ? "1.5px solid var(--danger)"
                          : "1px solid var(--border)",
                        background: on ? "rgba(194,69,63,0.08)" : "#fdfaf2",
                        color: on ? "var(--danger)" : "var(--text-dim)",
                        borderRadius: 999,
                        padding: "7px 14px 7px 12px",
                        fontSize: 13,
                        cursor: "pointer",
                        fontFamily: "var(--font-body)",
                        transition: "all 0.16s ease",
                        textDecoration: on ? "line-through" : "none",
                      }}
                    >
                      <CropGlyph family={c.family} size={14} strokeWidth={2} />
                      {c.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Baseline preset */}
            <div style={{ marginBottom: 32 }}>
              <h3 style={{ fontSize: 16, marginBottom: 14 }}>
                Baseline rotation{" "}
                <span style={{ color: "var(--text-faint)", fontWeight: 400, fontSize: 13 }}>
                  the farmer's habit, for comparison
                </span>
              </h3>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {PRESETS.map((p, i) => (
                  <button
                    key={p.label}
                    onClick={() => setPreset(i)}
                    style={{
                      border: preset === i ? "1.5px solid #7f8f89" : "1px solid var(--border)",
                      background: preset === i ? "rgba(127,143,137,0.14)" : "#fdfaf2",
                      color: "var(--text)",
                      borderRadius: 12,
                      padding: "10px 16px",
                      fontSize: 13.5,
                      cursor: "pointer",
                      fontFamily: "var(--font-display)",
                      fontWeight: 500,
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center", gap: 14 }}>
              <FlowerButton size="lg" tone="sun" icon={<Check size={22} />} onClick={run} disabled={busy}>
                {busy ? "Computing…" : "Compute rotation"}
              </FlowerButton>
              <span style={{ fontSize: 12, color: "var(--text-faint)" }}>
                deterministic · seeded search · runs in ~50 ms
              </span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}