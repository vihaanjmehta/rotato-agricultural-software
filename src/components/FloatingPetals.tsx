import { motion } from "framer-motion";

const PETALS = Array.from({ length: 8 }).map((_, i) => ({
  id: i,
  x: 10 + ((i * 41 + 7) % 80),
  delay: (i * 2.3) % 14,
  dur: 22 + (i % 4) * 4,
  size: 5 + (i % 3) * 2,
  rot: (i * 53) % 360,
  hue: ["#f6c8d2", "#e4d9f4", "#f5ead0", "#dce6d3", "#ec9ab0"][i % 5],
  opacity: 0.14 + (i % 3) * 0.05,
  drift: -30 - (i % 3) * 20,
}));

export default function FloatingPetals() {
  return (
    <div
      aria-hidden
      style={{ position: "fixed", inset: 0, zIndex: 4, pointerEvents: "none", overflow: "hidden" }}
    >
      {PETALS.map((p) => (
        <motion.div
          key={p.id}
          initial={{ x: `${p.x}vw`, y: "-6vh", rotate: p.rot, opacity: 0 }}
          animate={{
            y: ["-6vh", "106vh"],
            x: [`${p.x}vw`, `${p.x + p.drift}vw`],
            rotate: [p.rot, p.rot + 280],
            opacity: [0, p.opacity, p.opacity, 0],
          }}
          transition={{
            duration: p.dur,
            delay: p.delay,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            position: "absolute",
            width: p.size,
            height: p.size * 1.4,
            borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
            background: `radial-gradient(circle at 38% 30%, ${p.hue}, ${p.hue}cc)`,
            boxShadow: "inset 0 -1px 3px rgba(0,0,0,0.06)",
          }}
        />
      ))}
    </div>
  );
}