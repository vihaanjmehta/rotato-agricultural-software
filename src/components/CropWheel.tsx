import { useRef } from "react";
import type { MotionValue } from "framer-motion";
import { motion, useScroll, useTransform } from "framer-motion";
import { Bean, Flower, Flower2, Leaf, Sprout, Wheat } from "lucide-react";
import { Logo } from "./icons";

const RING = [
  { Icon: Wheat, color: "#c9a227" },
  { Icon: Bean, color: "#3f9d63" },
  { Icon: Sprout, color: "#2c7a4f" },
  { Icon: Flower2, color: "#a78bfa" },
  { Icon: Leaf, color: "#57a56b" },
  { Icon: Flower, color: "#d69e2e" },
  { Icon: Bean, color: "#4fae77" },
  { Icon: Wheat, color: "#b98f1f" },
];

export default function CropWheel({
  size = 300,
  progress,
}: {
  size?: number;
  progress?: MotionValue<number>;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  // walking sideways physically rotates the crop wheel
  const src = progress ?? scrollYProgress;
  const rotate = useTransform(src, [0, 1], [0, 720]);
  const breathe = useTransform(src, [0, 0.5, 1], [0.96, 1.05, 0.96]);

  const r = size / 2 - 36;
  const half = size / 2;

  return (
    <div ref={ref} style={{ position: "relative", width: size, height: size, perspective: 900 }}>
      {/* fixed gauge marker — shows the wheel is turning */}
      <div
        style={{
          position: "absolute",
          left: half - 6,
          top: -6,
          width: 12,
          height: 12,
          borderRadius: "50%",
          background: "var(--emerald)",
          boxShadow: "0 0 0 4px rgba(14,138,85,0.16)",
          zIndex: 3,
        }}
      />
      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          rotate,
          rotateX: 18,
          scale: breathe,
          transformPerspective: 900,
          transformStyle: "preserve-3d",
          display: "grid",
          placeItems: "center",
        }}
      >
        {/* orbit rings */}
        <div
          style={{
            position: "absolute",
            inset: 16,
            borderRadius: "50%",
            border: "1.5px dashed rgba(20,33,26,0.16)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 44,
            borderRadius: "50%",
            border: "1px solid rgba(14,138,85,0.22)",
          }}
        />
        {/* rotating crops */}
        {RING.map(({ Icon, color }, i) => {
          const a = (i * 360) / RING.length;
          const rad = (a * Math.PI) / 180;
          const cx = half + r * Math.cos(rad);
          const cy = half + r * Math.sin(rad);
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: cx - 19,
                top: cy - 19,
                width: 38,
                height: 38,
                borderRadius: 12,
                display: "grid",
                placeItems: "center",
                background: "#fdfaf2",
                border: `1px solid ${color}55`,
                boxShadow: "0 8px 20px -12px rgba(20,45,30,0.35)",
              }}
            >
              <Icon size={19} strokeWidth={1.9} style={{ color }} />
            </div>
          );
        })}
      </motion.div>
      {/* center hub — stays upright while the wheel spins */}
      <div
        style={{
          position: "absolute",
          left: half - 30,
          top: half - 30,
          zIndex: 2,
          transform: "rotateX(18deg)",
        }}
      >
        <Logo size={60} iconSize={30} />
      </div>
    </div>
  );
}