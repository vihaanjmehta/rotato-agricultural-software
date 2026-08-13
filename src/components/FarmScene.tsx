import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function FarmScene() {
  const ref = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const sunY = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const farY = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const nearY = useTransform(scrollYProgress, [0, 1], [0, 180]);

  return (
    <div
      ref={ref as never}
      aria-hidden
      style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 0, background: "#faf7ef" }}
    >
      {/* sky */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, #eae6da 0%, #f2ede2 35%, #f8f4eb 60%, #faf7ef 100%)",
        }}
      />

      {/* sun */}
      <motion.div style={{ y: sunY, position: "absolute", left: "76%", top: "6%", zIndex: 1 }}>
        <div
          style={{
            width: 68,
            height: 68,
            borderRadius: "50%",
            background: "radial-gradient(circle, #f6e2a2 25%, #f0d68a 55%, transparent 100%)",
            boxShadow: "0 0 50px 20px rgba(246,226,162,0.2), 0 0 100px 40px rgba(246,226,162,0.08)",
          }}
        />
      </motion.div>

      {/* far hills */}
      <motion.svg
        style={{ y: farY, position: "absolute", left: 0, right: 0, bottom: 0, width: "100%", height: "48%" }}
        viewBox="0 0 1440 360"
        preserveAspectRatio="none"
      >
        <path d="M0 280 Q180 180 420 260 T780 220 T1140 250 T1440 210 V360 H0 Z" fill="#e4e8d9" opacity="0.7" />
        <path d="M0 310 Q300 230 600 290 T1440 260 V360 H0 Z" fill="#daddca" opacity="0.85" />
      </motion.svg>

      {/* near hills */}
      <motion.svg
        style={{ y: nearY, position: "absolute", left: 0, right: 0, bottom: 0, width: "100%", height: "38%" }}
        viewBox="0 0 1440 360"
        preserveAspectRatio="none"
      >
        <path d="M0 300 Q260 215 560 290 T1440 258 V360 H0 Z" fill="#cdd8be" />
        <path d="M0 336 Q400 270 800 326 T1440 308 V360 H0 Z" fill="#c2cfb2" />
      </motion.svg>
    </div>
  );
}