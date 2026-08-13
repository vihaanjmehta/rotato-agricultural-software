import type { CSSProperties, ReactNode } from "react";

export type FlowerTone = "rose" | "daisy" | "lavender" | "sun";

const TONES: Record<
  FlowerTone,
  { p1: string; p2: string; p3: string; core: string; glow: string }
> = {
  rose: { p1: "#f6c8d2", p2: "#ec9ab0", p3: "#cd6482", core: "#d76a7c", glow: "rgba(215,106,124,0.4)" },
  daisy: { p1: "#ffffff", p2: "#f5ead0", p3: "#ddcaa0", core: "#e0b53a", glow: "rgba(224,181,58,0.4)" },
  lavender: { p1: "#e4d9f4", p2: "#c9b3e8", p3: "#9a7ecb", core: "#9a7ecb", glow: "rgba(154,126,203,0.4)" },
  sun: { p1: "#ffeaa6", p2: "#f6c95e", p3: "#dd9d2e", core: "#d88a1e", glow: "rgba(216,138,30,0.4)" },
};

interface Props {
  children: ReactNode;
  icon?: ReactNode;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  tone?: FlowerTone;
  ariaLabel?: string;
  className?: string;
}

export default function FlowerButton({
  children,
  icon,
  onClick,
  href,
  disabled,
  size = "md",
  tone = "rose",
  ariaLabel,
  className,
}: Props) {
  const t = TONES[tone];
  const style = {
    "--p1": t.p1,
    "--p2": t.p2,
    "--p3": t.p3,
    "--core": t.core,
    "--glow": t.glow,
  } as CSSProperties;

  const inner = (
    <>
      <span className="flower-petals" aria-hidden>
        <span className="flower-rotor">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="flower-petal" style={{ "--i": i } as CSSProperties} />
          ))}
        </span>
        <span className="flower-core">{icon}</span>
      </span>
      <span className="flower-label">{children}</span>
    </>
  );

  if (href) {
    return (
      <a href={href} aria-label={ariaLabel} className={`flower-btn flower-btn-${size} ${className ?? ""}`} style={style}>
        {inner}
      </a>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`flower-btn flower-btn-${size} ${className ?? ""}`}
      style={style}
    >
      {inner}
    </button>
  );
}