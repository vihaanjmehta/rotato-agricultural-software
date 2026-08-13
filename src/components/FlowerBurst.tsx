import { motion } from "framer-motion";

const PETAL =
  "M0,0 C-7,-11 -9,-24 0,-33 C9,-24 7,-11 0,0 Z";

interface Props {
  tone?: string;
  tone2?: string;
  size?: number;
  top?: number;
  left?: string;
  count?: number;
}

export default function FlowerBurst({
  tone = "#0e8a55",
  tone2 = "#0c8496",
  size = 88,
  top = 22,
  left = "50%",
  count = 9,
}: Props) {
  const half = size / 2;
  const viewport = { once: true, margin: "0px 0px -10% 0px" } as const;

  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        left,
        top,
        zIndex: 4,
        pointerEvents: "none",
        transform: "translateX(-50%)",
      }}
    >
      {/* burst center (fade in first, tiny) */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={viewport}
        transition={{ duration: 0.25 }}
        style={{ position: "relative", width: 0, height: 0 }}
      >
        {Array.from({ length: count }).map((_, i) => {
          const angle = (i * 360) / count;
          const petalTone = i % 2 === 0 ? tone : tone2;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: -half,
                top: -half,
                width: size,
                height: size,
                transform: `rotate(${angle}deg)`,
              }}
            >
              <motion.svg
                viewBox="-40 -40 80 80"
                width={size}
                height={size}
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 0.95 }}
                viewport={viewport}
                transition={{
                  delay: 0.1 + i * 0.055,
                  type: "spring",
                  stiffness: 260,
                  damping: 14,
                }}
                style={{ display: "block" }}
              >
                <path d={PETAL} fill={petalTone} opacity={0.9} />
              </motion.svg>
            </div>
          );
        })}
        {/* center of the bloom */}
        <motion.div
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={viewport}
          transition={{
            delay: 0.1 + count * 0.05,
            type: "spring",
            stiffness: 320,
            damping: 12,
          }}
          style={{
            position: "absolute",
            left: -8,
            top: -8,
            width: 16,
            height: 16,
            borderRadius: "50%",
            background: `radial-gradient(circle at 35% 35%, #fdf6d8, ${tone})`,
            boxShadow: `0 2px 10px ${tone}55`,
          }}
        />
      </motion.div>
    </div>
  );
}