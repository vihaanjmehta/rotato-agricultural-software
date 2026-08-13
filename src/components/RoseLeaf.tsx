import { useId } from "react";

interface Props {
  size?: number;
  flip?: boolean;
  angle?: number;
}

// a glossy rose leaf — pointed, deeply veined, dark green, with a soft
// top-light sheen so it reads as living foliage rather than a flat shape
export default function RoseLeaf({ size = 150, flip = false, angle = -20 }: Props) {
  const gid = useId();
  return (
    <svg
      width={size}
      height={size * 0.62}
      viewBox="0 0 120 74"
      aria-hidden
      style={{
        display: "block",
        overflow: "visible",
        transformOrigin: "50% 100%",
        transform: `scaleX(${flip ? -1 : 1}) rotate(${angle}deg)`,
        filter: "drop-shadow(0 6px 10px rgba(20,45,30,0.28))",
      }}
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0.25" y2="1">
          <stop offset="0" stopColor="#5da96f" />
          <stop offset="0.45" stopColor="#2e7d4f" />
          <stop offset="1" stopColor="#1e5c3c" />
        </linearGradient>
      </defs>
      <path
        d="M60 6 C 74 14, 92 22, 98 36 C 102 46, 100 56, 94 62 C 84 70, 70 72, 60 72 C 50 72, 36 70, 26 62 C 20 56, 18 46, 22 36 C 28 22, 46 14, 60 6 Z"
        fill={`url(#${gid})`}
        stroke="#17462f"
        strokeWidth="1.4"
      />
      <path
        d="M60 70 C 62 46, 60 22, 60 8"
        stroke="#1b5236"
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
      />
      {[16, 26, 34, 42, 50].map((y, idx) => {
        const dir = idx % 2 === 0 ? 1 : -1;
        return (
          <g key={y}>
            <path
              d={`M60 ${y} C ${60 + dir * 10} ${y + 4}, ${60 + dir * 18} ${y + 6}, ${60 + dir * 26} ${y + 5}`}
              stroke="#1b5236"
              strokeWidth="1"
              fill="none"
              strokeLinecap="round"
              opacity="0.85"
            />
            <path
              d={`M60 ${y + 6} C ${60 + dir * 9} ${y + 10}, ${60 + dir * 15} ${y + 11}, ${60 + dir * 20} ${y + 10}`}
              stroke="#1b5236"
              strokeWidth="0.8"
              fill="none"
              strokeLinecap="round"
              opacity="0.6"
            />
          </g>
        );
      })}
      <path
        d="M60 6 C 70 10, 84 18, 92 30 C 96 36, 97 44, 94 52 C 92 58, 88 62, 83 65 C 78 68, 70 70, 62 70 C 58 46, 58 24, 60 6 Z"
        fill="rgba(255,255,255,0.1)"
      />
    </svg>
  );
}