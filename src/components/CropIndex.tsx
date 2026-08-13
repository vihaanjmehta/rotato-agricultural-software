import { motion } from "framer-motion";
import { CROPS } from "../engine/crops";
import { FAMILY_NAMES } from "../lib/meta";
import { familyColor } from "../engine/crops";
import { CropGlyph } from "./icons";
import Reveal from "./Reveal";

function CropRow({ crop, index }: { crop: (typeof CROPS)[number]; index: number }) {
  const fc = familyColor(crop.family);
  const nFrac = Math.min(1, Math.abs(crop.n) / 14);
  const omFrac = Math.min(1, crop.om / 5);
  const rFrac = Math.min(1, crop.roots / 4);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ delay: (index % 6) * 0.04, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="list-row"
    >
      {/* index */}
      <div className="list-index">
        <span>{String(index + 1).padStart(2, "0")}</span>
      </div>

      {/* icon */}
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 10,
          display: "grid",
          placeItems: "center",
          background: "#fdfaf2",
          border: `1px solid ${fc}44`,
          flexShrink: 0,
        }}
      >
        <CropGlyph family={crop.family} size={20} />
      </div>

      {/* info */}
      <div className="list-info">
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15 }}>
            {crop.name}
          </span>
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: fc,
              background: `${fc}12`,
              border: `1px solid ${fc}30`,
              padding: "2px 8px",
              borderRadius: 999,
            }}
          >
            {FAMILY_NAMES[crop.family]}
          </span>
          {crop.coverCrop && (
            <span
              style={{
                fontSize: 9.5,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--emerald)",
                background: "var(--emerald-soft)",
                border: "1px solid rgba(15,138,84,0.2)",
                padding: "2px 7px",
                borderRadius: 999,
              }}
            >
              cover
            </span>
          )}
        </div>

        {/* stat bars */}
        <div style={{ display: "flex", gap: 20, marginTop: 8, flexWrap: "wrap" }}>
          {[
            { label: "N", frac: nFrac, val: crop.n, color: crop.n >= 0 ? "#0e8a55" : "#d05a34" },
            { label: "OM", frac: omFrac, val: crop.om, color: "#6d55c9" },
            { label: "roots", frac: rFrac, val: crop.roots, color: "#0c8496" },
          ].map((s) => (
            <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text-dim)" }}>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 10, width: 28 }}>{s.label}</span>
              <div style={{ width: 48, height: 3, borderRadius: 99, background: "rgba(20,33,26,0.06)", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${s.frac * 100}%`, background: s.color, borderRadius: 99 }} />
              </div>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 10, color: s.val >= 0 ? "var(--text)" : "var(--danger)" }}>
                {s.val >= 0 ? "+" : ""}{s.val}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* arrow */}
      <div className="list-arrow">
        <span>→</span>
      </div>
    </motion.div>
  );
}

export default function CropIndex() {
  return (
    <section id="catalog" className="section" style={{ overflow: "hidden" }}>
      <div className="container">
        <Reveal>
          <div style={{ marginBottom: 48 }}>
            <span className="eyebrow">the beds</span>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", marginTop: 14 }}>
              Twelve crops, one living soil
            </h2>
            <p style={{ color: "var(--text-dim)", marginTop: 10, maxWidth: 520, lineHeight: 1.6, fontSize: 15 }}>
              Each crop leaves the bed measurably different — nutrients drawn
              down or fixed, organic matter added, roots reshaping the tilth.
            </p>
          </div>
        </Reveal>

        <div className="list-section">
          {CROPS.map((c, i) => (
            <CropRow key={c.id} crop={c} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}