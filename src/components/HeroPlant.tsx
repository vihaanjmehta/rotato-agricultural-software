import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  useTransform as useT,
} from "framer-motion";
import type { MouseEvent } from "react";

const GOLDEN = 137.508;

function Petal({
  i,
  r,
  len,
  w,
  baseA,
  tone,
}: {
  i: number;
  r: number;
  len: number;
  w: number;
  baseA: number;
  tone: string;
}) {
  const a = baseA + i * GOLDEN;
  const rr = ((i * 7 + 3) % 10) / 10;
  const lr = len * (0.88 + rr * 0.24);
  const wr = w * (0.9 + rr * 0.2);
  return (
    <ellipse
      cx={0}
      cy={-r - lr / 2}
      rx={wr}
      ry={lr / 2}
      fill={`url(#pl-${tone})`}
      stroke={tone === "dk" ? "#5c4a1e" : "#8a7030"}
      strokeWidth="0.3"
      opacity={0.92 + rr * 0.08}
      transform={`rotate(${a})`}
    />
  );
}

export default function HeroPlant() {
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const plantY = useTransform(scrollYProgress, [0, 1], [0, 160]);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const tiltX = useSpring(useT(my, [-0.5, 0.5], [4, -4]), {
    stiffness: 120,
    damping: 18,
  });
  const tiltY = useSpring(useT(mx, [-0.5, 0.5], [-6, 6]), {
    stiffness: 120,
    damping: 18,
  });

  const onMove = (e: MouseEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ y: plantY, perspective: 800, cursor: "default" }}
    >
      <motion.svg
        viewBox="-120 -260 240 540"
        style={{
          width: "min(340px, 52vw)",
          height: "auto",
          rotateX: tiltX,
          rotateY: tiltY,
          filter: "drop-shadow(0 30px 50px rgba(30,50,20,0.25))",
          transformOrigin: "50% 85%",
        }}
        animate={{
          rotate: [0, 1.3, 0, -1, 0],
        }}
        transition={{
          rotate: { duration: 7, repeat: Infinity, ease: "easeInOut" },
        }}
      >
        <defs>
          {/* stem gradient */}
          <linearGradient id="pl-stem" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#3d7a28" />
            <stop offset="40%" stopColor="#4a9430" />
            <stop offset="100%" stopColor="#367222" />
          </linearGradient>
          {/* leaf gradients */}
          <linearGradient id="pl-leaf1" x1="0.2" y1="0" x2="0.9" y2="1">
            <stop offset="0%" stopColor="#3f8c2a" />
            <stop offset="50%" stopColor="#2d7a1e" />
            <stop offset="100%" stopColor="#1e5c14" />
          </linearGradient>
          <linearGradient id="pl-leaf2" x1="0.8" y1="0" x2="0.1" y2="1">
            <stop offset="0%" stopColor="#4a9430" />
            <stop offset="50%" stopColor="#368422" />
            <stop offset="100%" stopColor="#256818" />
          </linearGradient>
          {/* petal gradients — bright yellow + warm gold */}
          <radialGradient id="pl-yl" cx="0.35" cy="0.25" r="0.8">
            <stop offset="0%" stopColor="#ffe76a" />
            <stop offset="45%" stopColor="#ffd740" />
            <stop offset="100%" stopColor="#f0b800" />
          </radialGradient>
          <radialGradient id="pl-dk" cx="0.35" cy="0.25" r="0.8">
            <stop offset="0%" stopColor="#ffe040" />
            <stop offset="45%" stopColor="#e8a800" />
            <stop offset="100%" stopColor="#c98800" />
          </radialGradient>
          <radialGradient id="pl-gd" cx="0.4" cy="0.3" r="0.7">
            <stop offset="0%" stopColor="#ffe970" />
            <stop offset="100%" stopColor="#d4a020" />
          </radialGradient>
          {/* sepal gradient */}
          <linearGradient id="pl-sep" x1="0" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="#4a8c3a" />
            <stop offset="100%" stopColor="#2d6820" />
          </linearGradient>
          {/* center disc radial */}
          <radialGradient id="pl-center" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#7a5a20" />
            <stop offset="55%" stopColor="#5c4018" />
            <stop offset="88%" stopColor="#3e2a10" />
            <stop offset="100%" stopColor="#2a1a08" />
          </radialGradient>
          {/* shadow under flower */}
          <radialGradient id="pl-shadow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="rgba(20,40,10,0.22)" />
            <stop offset="100%" stopColor="rgba(20,40,10,0)" />
          </radialGradient>
        </defs>

        {/* stem — gentle natural curve */}
        <path
          d="M0 280 C2 230 -2 160 0 90 C1 55 -1 20 0 -10"
          fill="none"
          stroke="url(#pl-stem)"
          strokeWidth="9"
          strokeLinecap="round"
        />
        {/* stem highlight line */}
        <path
          d="M2.5 275 C4 228 0.5 158 2.5 88 C3 56 1 22 2.5 -8"
          fill="none"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* left leaf */}
        <g transform="translate(0, 185) rotate(-32)">
          <path
            d="M0 0 C-18 -14 -58 -38 -92 -52 C-82 -28 -42 -10 0 0 Z"
            fill="url(#pl-leaf1)"
            stroke="#2a6a1a"
            strokeWidth="0.5"
          />
          <path d="M0 0 C-30 -16 -65 -36 -92 -52" fill="none" stroke="#3a8a26" strokeWidth="1.1" opacity="0.6" />
          <path d="M-18 -12 C-34 -22 -54 -32 -72 -42" fill="none" stroke="#3a8a26" strokeWidth="0.7" opacity="0.4" />
          <path d="M-8 -6 C-20 -14 -38 -24 -56 -34" fill="none" stroke="#3a8a26" strokeWidth="0.7" opacity="0.4" />
        </g>

        {/* right leaf */}
        <g transform="translate(0, 130) rotate(28)">
          <path
            d="M0 0 C18 -14 58 -38 92 -52 C82 -28 42 -10 0 0 Z"
            fill="url(#pl-leaf2)"
            stroke="#2a6a1a"
            strokeWidth="0.5"
          />
          <path d="M0 0 C30 -16 65 -36 92 -52" fill="none" stroke="#4a9430" strokeWidth="1.1" opacity="0.6" />
          <path d="M18 -12 C34 -22 54 -32 72 -42" fill="none" stroke="#4a9430" strokeWidth="0.7" opacity="0.4" />
          <path d="M8 -6 C20 -14 38 -24 56 -34" fill="none" stroke="#4a9430" strokeWidth="0.7" opacity="0.4" />
        </g>

        {/* small upper leaf */}
        <g transform="translate(0, 72) rotate(-18)">
          <path
            d="M0 0 C-10 -8 -32 -22 -52 -30 C-44 -16 -22 -6 0 0 Z"
            fill="url(#pl-leaf1)"
            stroke="#2a6a1a"
            strokeWidth="0.4"
          />
          <path d="M0 0 C-16 -10 -36 -22 -52 -30" fill="none" stroke="#3a8a26" strokeWidth="0.8" opacity="0.5" />
        </g>

        {/* sepals — pointed green cup under the bloom */}
        {Array.from({ length: 7 }).map((_, i) => {
          const a = (i * 360) / 7;
          return (
            <g key={`s${i}`} transform={`rotate(${a})`}>
              <path
                d={`M0 -72 C-5 -88 0 -108 0 -108 C0 -108 5 -88 0 -72 Z`}
                fill="url(#pl-sep)"
                stroke="#2a5a1a"
                strokeWidth="0.3"
              />
            </g>
          );
        })}

        {/* back petals — wider, deeper gold, more open */}
        {Array.from({ length: 14 }).map((_, i) => (
          <Petal key={`b${i}`} i={i} r={22} len={48} w={10} baseA={5} tone="dk" />
        ))}

        {/* mid petals — bright yellow */}
        {Array.from({ length: 16 }).map((_, i) => (
          <Petal key={`m${i}`} i={i} r={18} len={44} w={9} baseA={0} tone="yl" />
        ))}

        {/* front petals — shorter, tighter */}
        {Array.from({ length: 14 }).map((_, i) => (
          <Petal key={`f${i}`} i={i} r={14} len={36} w={7.5} baseA={8} tone="gd" />
        ))}

        {/* disc — dark centre */}
        <circle cx={0} cy={0} r={22} fill="url(#pl-center)" />

        {/* disc ring — texture band */}
        <circle
          cx={0}
          cy={0}
          r={20}
          fill="none"
          stroke="#6a4a1a"
          strokeWidth="2.5"
          opacity="0.3"
        />

        {/* disc spiral seeds — fibonacci pattern */}
        {Array.from({ length: 55 }).map((_, i) => {
          const a = i * GOLDEN;
          const rad = Math.sqrt(i / 55) * 18;
          const x = Math.cos((a * Math.PI) / 180) * rad;
          const y = Math.sin((a * Math.PI) / 180) * rad;
          return (
            <circle
              key={`sd${i}`}
              cx={x}
              cy={y}
              r={1.4 - (i / 55) * 0.6}
              fill={i % 3 === 0 ? "#4a3214" : i % 3 === 1 ? "#5c421a" : "#3e2a10"}
            />
          );
        })}

        {/* centre pinhead */}
        <circle
          cx={0}
          cy={0}
          r={3.5}
          fill="#6a4a1a"
          stroke="#4a3214"
          strokeWidth="0.6"
        />
        <circle cx={-0.8} cy={-0.8} r={1.2} fill="#8a6a2e" opacity="0.6" />

        {/* shadow on ground */}
        <ellipse cx={0} cy={286} rx={38} ry={8} fill="url(#pl-shadow)" />
      </motion.svg>
    </motion.div>
  );
}