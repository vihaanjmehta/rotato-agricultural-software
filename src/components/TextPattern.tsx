import { motion } from "framer-motion";

const WORD = "ROTATO";
const ROWS = 14;
const COLS = 22;

export default function TextPattern({ opacity = 0.045 }: { opacity?: number }) {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        zIndex: 0,
        pointerEvents: "none",
      }}
    >
      <motion.div
        animate={{ x: [0, -800] }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        style={{ width: "fit-content" }}
      >
        {Array.from({ length: ROWS }).map((_, r) => (
          <div
            key={r}
            style={{
              display: "flex",
              gap: "2.8vw",
              whiteSpace: "nowrap",
              opacity,
              transform: `translateX(${(r % 2) * -120}px)`,
            }}
          >
            {Array.from({ length: COLS }).map((_, c) => (
              <span
                key={c}
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: "clamp(14px, 2.2vw, 22px)",
                  letterSpacing: "0.25em",
                  color: "var(--text)",
                  userSelect: "none",
                }}
              >
                {WORD}
              </span>
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  );
}