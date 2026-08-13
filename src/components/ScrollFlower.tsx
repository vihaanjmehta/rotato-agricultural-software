import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Flower3D from "./Flower3D";

interface Props {
  x: string;
  y: string;
  size?: number;
  speed?: number;
  peak?: number;
  petals?: number;
  petalColor?: string;
  centerColor?: string;
  tilt?: number;
  spin?: number;
}

// A 3D flower that drifts with the field: parallax speed per depth,
// scales up as it passes center-screen, fades at the edges.
export default function ScrollFlower({
  x,
  y,
  size = 100,
  speed = 60,
  peak = 0.5,
  petals,
  petalColor,
  centerColor,
  tilt,
  spin,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const move = useTransform(scrollYProgress, [0, 1], [-speed, speed]);
  const scale = useTransform(scrollYProgress, [0, 0.42, 0.58, 1], [0.7, 1.16, 1.16, 0.7]);
  const opacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0, peak, peak, 0]);

  return (
    <div
      ref={ref}
      aria-hidden
      style={{ position: "absolute", left: x, top: y, zIndex: 0 }}
    >
      <motion.div style={{ y: move, scale, opacity }}>
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <Flower3D
            size={size}
            petals={petals}
            petalColor={petalColor}
            centerColor={centerColor}
            tilt={tilt}
            spin={spin}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}