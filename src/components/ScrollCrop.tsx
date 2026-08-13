import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface Props {
  Icon: LucideIcon;
  x: string;
  y: string;
  size: number;
  speed: number;
  peak?: number;
  color?: string;
  blur?: string;
  drift?: number;
}

export default function ScrollCrop({
  Icon,
  x,
  y,
  size,
  speed,
  peak = 0.45,
  color = "#2c7a4f",
  blur = "blur(1px)",
  drift = 0,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  // foreground fast, background slow → classic depth
  const move = useTransform(scrollYProgress, [0, 1], [-speed, speed]);
  // grow as it passes center-screen, shrink and fade as it exits
  const scale = useTransform(scrollYProgress, [0, 0.42, 0.58, 1], [0.7, 1.18, 1.18, 0.7]);
  const opacity = useTransform(scrollYProgress, [0, 0.16, 0.84, 1], [0, peak, peak, 0]);
  const rotate = useTransform(scrollYProgress, [0, 1], [drift * 16, drift * -16]);

  return (
    <div
      ref={ref}
      aria-hidden
      style={{ position: "absolute", left: x, top: y, zIndex: 0 }}
    >
      <motion.div
        style={{ y: move, scale, opacity, rotate, filter: blur }}
      >
        <Icon size={size} strokeWidth={1.4} style={{ color }} />
      </motion.div>
    </div>
  );
}