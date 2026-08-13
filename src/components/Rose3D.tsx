import { motion } from "framer-motion";

function shade(hex: string, amt: number): string {
  const n = hex.replace("#", "");
  const full = n.length === 3 ? n.split("").map((c) => c + c).join("") : n;
  const num = parseInt(full, 16);
  const r = Math.max(0, Math.min(255, (num >> 16) + amt));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + amt));
  const b = Math.max(0, Math.min(255, (num & 0xff) + amt));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

interface Layer {
  count: number;
  r: number;
  open: number;
  w: number;
  h: number;
  dark: number;
}

// a velvet rose: petals spiral in on the golden angle, wider and flared at the
// base, closing into a tight dark swirl at the heart — with organic jitter so
// no two petals sit exactly alike
const LAYERS: Layer[] = [
  { count: 10, r: 0.42, open: 18, w: 0.56, h: 0.5, dark: 0 },
  { count: 9, r: 0.34, open: 38, w: 0.48, h: 0.44, dark: -14 },
  { count: 8, r: 0.27, open: 55, w: 0.41, h: 0.38, dark: -28 },
  { count: 8, r: 0.2, open: 68, w: 0.34, h: 0.32, dark: -40 },
  { count: 7, r: 0.14, open: 78, w: 0.27, h: 0.26, dark: -50 },
  { count: 6, r: 0.08, open: 85, w: 0.19, h: 0.2, dark: -58 },
  { count: 7, r: 0.045, open: 86, w: 0.15, h: 0.15, dark: -62 },
];

interface Props {
  size?: number;
  tone?: string;
  spin?: number;
  tilt?: number;
}

export default function Rose3D({
  size = 110,
  tone = "#a6162e",
  spin = 14,
  tilt = -8,
}: Props) {
  return (
    <div style={{ width: size, height: size, perspective: size * 2.4 }}>
      <motion.div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          transformStyle: "preserve-3d",
        }}
        animate={{
          // a real rose sways in the breeze — it never spins like a trophy
          rotateY: [0, -12, 0, 14, 0],
          rotateX: [tilt, tilt + 4, tilt],
          scale: [1, 1.03, 1],
        }}
        transition={{
          rotateY: { duration: spin, repeat: Infinity, ease: "easeInOut" },
          rotateX: { duration: 6.5, repeat: Infinity, ease: "easeInOut" },
          scale: { duration: 5.5, repeat: Infinity, ease: "easeInOut" },
        }}
      >
        {/* dark green calyx — pointed sepals cupping the bloom */}
        {Array.from({ length: 5 }).map((_, i) => {
          const a = (i * 72 + 20) % 360;
          const pw = size * 0.38;
          const ph = size * 0.34;
          return (
            <div
              key={`c${i}`}
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: pw,
                height: ph,
                marginLeft: -pw / 2,
                marginTop: -ph / 2,
                borderRadius: "100% 0 100% 0",
                background: "linear-gradient(160deg,#4f8f5a,#24593b)",
                boxShadow: "inset 0 -4px 8px rgba(10,30,20,0.35)",
                transform: `rotateY(${a}deg) translateZ(${size * 0.46}px) rotateX(-30deg)`,
              }}
            />
          );
        })}

        {LAYERS.map((L, li) =>
          Array.from({ length: L.count }).map((_, i) => {
            const a = (i * 137.5 + li * 55) % 360;
            const j = ((i * 7 + li * 13) % 10) / 10;
            const wj = 0.92 + j * 0.18;
            const oj = (j - 0.45) * 7;
            const rj = (j - 0.45) * 0.018;
            const base = shade(tone, L.dark);
            const light = shade(tone, L.dark + 86);
            const mid = shade(tone, L.dark + 30);
            const deep = shade(tone, L.dark - 20);
            const deeper = shade(tone, L.dark - 36);
            const pw = size * L.w * wj;
            const ph = size * L.h * wj;
            return (
              <div
                key={`${li}-${i}`}
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  width: pw,
                  height: ph,
                  marginLeft: -pw / 2,
                  marginTop: -ph,
                  borderRadius: "55% 45% 58% 42% / 62% 58% 40% 36%",
                  background: `radial-gradient(circle at 36% 26%, ${light} 0%, ${mid} 30%, ${base} 55%, ${deep} 82%, ${deeper} 100%)`,
                  border: `1px solid ${deeper}55`,
                  boxShadow: `inset 0 -16px 18px -16px ${deeper}, 0 18px 34px -26px rgba(45,5,12,0.55)`,
                  transform: `rotateY(${a}deg) translateZ(${size * L.r * (1 + rj)}px) rotateX(${L.open + oj}deg)`,
                }}
              />
            );
          })
        )}

        {/* dark swirl at the heart, like the folded center of a real rose */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: size * 0.12,
            height: size * 0.12,
            marginLeft: -size * 0.06,
            marginTop: -size * 0.06,
            borderRadius: "50%",
            background: `radial-gradient(circle at 38% 30%, ${shade(tone, 30)}, ${shade(tone, -52)})`,
            boxShadow: `0 0 0 1.5px ${shade(tone, -56)}66, 0 0 16px 3px ${shade(tone, 10)}44`,
            transform: `translateZ(${size * 0.06}px)`,
          }}
        />
      </motion.div>
    </div>
  );
}