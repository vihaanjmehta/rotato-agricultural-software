import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Flower3D from "./Flower3D";
import Rose3D from "./Rose3D";

interface PatchProps {
  height?: number;
  tone?: string;
  accent?: string;
  spin?: number;
}

// the living plant itself — no scroll coupling, ready to be placed anywhere
export function PatchVisual({
  height = 150,
  tone = "#f472a0",
  accent = "#ff8a5c",
  spin = 18,
}: PatchProps) {
  const roseSize = Math.round(height * 0.58);
  const sideSize = Math.round(height * 0.42);
  const stemTop = Math.round(roseSize * 0.55);
  const stemH = height - stemTop;

  const leaf = (top: number, size: number, color: string, flip: boolean) => (
    <div
      key={`${top}-${size}`}
      style={{
        position: "absolute",
        left: `calc(50% ${flip ? "-" : "+"} ${size * 0.42}px)`,
        top,
        width: size,
        height: size * 0.55,
        borderRadius: "100% 0 100% 0",
        transform: flip ? "rotate(16deg) scaleX(-1)" : "rotate(-16deg)",
        background: `linear-gradient(135deg, #a3d99e, ${color})`,
        boxShadow: "inset 0 -3px 6px rgba(20,45,30,0.18)",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "8%",
          bottom: "8%",
          width: 1.5,
          background: "rgba(20,45,30,0.22)",
          transform: "rotate(6deg)",
        }}
      />
    </div>
  );

  return (
    <motion.div
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      style={{ position: "relative", width: height * 1.1, height }}
    >
      {/* side daisy on its own stem */}
      <div style={{ position: "absolute", right: 8, top: height * 0.3, width: sideSize, zIndex: 1 }}>
        <Flower3D size={sideSize} petals={8} petalColor={accent} centerColor="#c97b00" spin={spin + 6} tilt={4} />
        <div
          style={{
            position: "absolute",
            left: "50%",
            marginLeft: -2.5,
            top: sideSize * 0.92,
            width: 5,
            height: sideSize * 0.55,
            borderRadius: 99,
            background: "linear-gradient(180deg,#8fd08a,#3f9d63)",
          }}
        />
      </div>

      {/* main rose */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 0,
          transform: "translateX(-50%)",
          zIndex: 2,
        }}
      >
        <Rose3D size={roseSize} tone={tone} spin={spin} tilt={-6} />
      </div>

      {/* stem + leaves */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: stemTop,
          width: 9,
          height: stemH,
          marginLeft: -4.5,
          borderRadius: 999,
          background: "linear-gradient(180deg,#8fd08a,#3f9d63)",
        }}
      >
        {leaf(stemH * 0.22, 28, "#3f9d63", false)}
        {leaf(stemH * 0.45, 24, "#57a56b", true)}
        {leaf(stemH * 0.68, 22, "#3f9d63", false)}
      </div>
    </motion.div>
  );
}

interface Props extends PatchProps {
  x: string;
  y: string;
  speed?: number;
  peak?: number;
  parallax?: boolean;
}

// a scroll-coupled patch: drifts at parallax depth, scales up at center-screen
export default function FlowerPatch({
  x,
  y,
  height = 150,
  tone,
  accent,
  spin,
  speed = 80,
  peak = 0.6,
  parallax = true,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: parallax ? ref : undefined,
    offset: ["start end", "end start"],
  });
  const move = useTransform(scrollYProgress, [0, 1], [-speed, speed]);
  const scale = useTransform(scrollYProgress, [0, 0.42, 0.58, 1], [0.72, 1.16, 1.16, 0.72]);
  const opacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0, peak, peak, 0]);

  if (!parallax) {
    return (
      <div aria-hidden style={{ width: height * 1.1, height }}>
        <PatchVisual height={height} tone={tone} accent={accent} spin={spin} />
      </div>
    );
  }

  return (
    <div
      ref={ref}
      aria-hidden
      style={{ position: "absolute", left: x, top: y, zIndex: 0, width: height * 1.1, height }}
    >
      <motion.div style={{ y: move, scale, opacity }}>
        <PatchVisual height={height} tone={tone} accent={accent} spin={spin} />
      </motion.div>
    </div>
  );
}