import { motion } from "framer-motion";

interface Props {
  size?: number;
  petals?: number;
  petalColor?: string;
  centerColor?: string;
  spin?: number;
  tilt?: number;
}

// A real 3D bloom: petals arranged on a cone with preserve-3d,
// the whole flower slowly rotating around its vertical axis.
export default function Flower3D({
  size = 110,
  petals = 10,
  petalColor = "#eef6ef",
  centerColor = "#d69e2e",
  spin = 16,
  tilt = 0,
}: Props) {
  const r = size * 0.3;
  const pw = size * 0.32;
  const ph = size * 0.5;
  const sc = size * 0.16;

  return (
    <div style={{ width: size, height: size, perspective: 700 }}>
      <motion.div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          transformStyle: "preserve-3d",
        }}
        animate={{ rotateY: [0, 360], rotateX: [tilt, tilt + 8, tilt] }}
        transition={{
          rotateY: { duration: spin, repeat: Infinity, ease: "linear" },
          rotateX: { duration: 7, repeat: Infinity, ease: "easeInOut" },
        }}
      >
        {Array.from({ length: petals }).map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: pw,
              height: ph,
              marginLeft: -pw / 2,
              marginTop: -ph,
              borderRadius: "50% 50% 50% 50% / 62% 62% 38% 38%",
              background: `radial-gradient(circle at 50% 18%, #ffffff 0%, ${petalColor} 66%, ${petalColor} 100%)`,
              border: "1px solid rgba(255,255,255,0.6)",
              boxShadow: "inset 0 -12px 18px -10px rgba(20,33,26,0.12)",
              transform: `rotateY(${(i * 360) / petals}deg) translateZ(${r}px) rotateX(58deg)`,
            }}
          />
        ))}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: sc,
            height: sc,
            marginLeft: -sc / 2,
            marginTop: -sc / 2,
            borderRadius: "50%",
            background: `radial-gradient(circle at 35% 32%, #fbe9b0, ${centerColor})`,
            boxShadow: `0 0 0 3px rgba(255,255,255,0.55), 0 8px 20px -8px ${centerColor}77`,
            transform: `translateZ(${r * 0.55}px)`,
          }}
        />
      </motion.div>
    </div>
  );
}