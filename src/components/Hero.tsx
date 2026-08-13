import { Fragment, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Sprout, Sparkles } from "lucide-react";
import TextPattern from "./TextPattern";
import FlowerButton from "./FlowerButton";
import HeroPlant from "./HeroPlant";

const STATS = [
  { v: "12", l: "crops" },
  { v: "7", l: "families" },
  { v: "5D", l: "soil state" },
  { v: "4", l: "engines" },
];

export default function Hero() {
  const ref = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const textY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const patternOpacity = useTransform(scrollYProgress, [0, 0.6], [0.045, 0]);

  const [glow, setGlow] = useState({ x: 0, y: 0, active: false });
  const onMove = (e: React.MouseEvent) => {
    const r = e.currentTarget.getBoundingClientRect();
    setGlow({ x: e.clientX - r.left, y: e.clientY - r.top, active: true });
  };

  return (
    <section
      ref={ref}
      id="top"
      className="section"
      onMouseMove={onMove}
      onMouseLeave={() => setGlow((g) => ({ ...g, active: false }))}
      style={{
        position: "relative",
        overflow: "hidden",
        minHeight: "100vh",
        padding: "0",
        display: "flex",
        alignItems: "center",
      }}
    >
      {/* bg */}
      <div style={{ position: "absolute", inset: 0, background: "#faf7ef", zIndex: 0 }} />
      <motion.div style={{ opacity: patternOpacity, position: "absolute", inset: 0, zIndex: 0 }}>
        <TextPattern />
      </motion.div>

      {/* cursor glow */}
      {glow.active && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            left: glow.x - 200,
            top: glow.y - 200,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(15,138,84,0.06), transparent 70%)",
            pointerEvents: "none",
            zIndex: 1,
            transition: "left 0.12s ease-out, top 0.12s ease-out",
          }}
        />
      )}

      <div style={{ position: "relative", zIndex: 2, width: "100%" }} className="container">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "clamp(24px, 5vw, 80px)", flexWrap: "wrap" }}>
          {/* text */}
          <motion.div style={{ y: textY, opacity: textOpacity, flex: "1 1 320px", maxWidth: 500, textAlign: "center" }}>
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="eyebrow">a farm, in numbers</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              style={{
                fontSize: "clamp(34px, 4.8vw, 58px)",
                fontWeight: 700,
                lineHeight: 1.06,
                margin: "18px auto 0",
              }}
            >
              Grow the rotation the soil deserves
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
              style={{
                color: "var(--text-dim)",
                fontSize: "clamp(14px, 1.6vw, 16.5px)",
                maxWidth: 440,
                margin: "14px auto 0",
                lineHeight: 1.65,
              }}
            >
              Three optimizer engines racing the same living soil model —
              all inspectable below.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
              style={{ display: "flex", gap: 14, justifyContent: "center", marginTop: 30, flexWrap: "wrap" }}
            >
              <FlowerButton href="#catalog" size="lg" tone="rose" icon={<Sprout size={20} />}>
                Explore the crops
              </FlowerButton>
              <FlowerButton href="#method" size="lg" tone="daisy" icon={<Sparkles size={18} />}>
                How the math works
              </FlowerButton>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.34, ease: [0.22, 1, 0.36, 1] }}
              style={{ perspective: 800, marginTop: 36 }}
            >
              <div
                className="glass"
                style={{
                  margin: "0 auto",
                  maxWidth: 480,
                  padding: "13px 6px",
                  display: "flex",
                  alignItems: "stretch",
                  borderRadius: 999,
                }}
              >
                {STATS.map((s, i) => (
                  <Fragment key={s.l}>
                    {i > 0 && <div style={{ width: 1, background: "var(--border)" }} />}
                    <div style={{ flex: 1, textAlign: "center", padding: "0 10px" }}>
                      <div style={{ fontFamily: "var(--font-display)", fontSize: 19, fontWeight: 700, letterSpacing: "-0.02em" }}>
                        {s.v}
                      </div>
                      <div style={{ fontSize: 10.5, color: "var(--text-dim)", marginTop: 1 }}>{s.l}</div>
                    </div>
                  </Fragment>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* plant */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            style={{ flex: "0 0 auto" }}
          >
            <HeroPlant />
          </motion.div>
        </div>
      </div>

      {/* scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
        style={{ position: "absolute", left: "50%", bottom: 20, transform: "translateX(-50%)", zIndex: 3 }}
      >
        <div
          style={{
            width: 18,
            height: 11,
            borderLeft: "1.5px solid var(--text-faint)",
            borderBottom: "1.5px solid var(--text-faint)",
            transform: "rotate(-45deg)",
            animation: "cueFade 2s ease-in-out infinite",
          }}
        />
      </motion.div>
    </section>
  );
}