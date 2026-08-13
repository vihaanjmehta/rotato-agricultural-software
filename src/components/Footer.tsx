import { Leaf } from "lucide-react";
import { Logo } from "./icons";
import FlowerButton from "./FlowerButton";

const LINKS = [
  { href: "#catalog", label: "Crops" },
  { href: "#method", label: "Method" },
  { href: "#simulate", label: "Simulator" },
  { href: "#math", label: "The Math" },
];

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--border)",
        padding: "56px 0 52px",
        background: "transparent",
      }}
    >
      <div className="container">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 20,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <Logo size={30} iconSize={17} />
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16 }}>
              rotato<span style={{ color: "var(--emerald)" }}>.</span>
            </span>
          </div>

          <div style={{ display: "flex", gap: 6, color: "var(--text-faint)", fontSize: 12.5, flexWrap: "wrap" }}>
            {LINKS.map((l) => (
              <a key={l.href} href={l.href} style={{ padding: "6px 12px", borderRadius: 8, transition: "color .2s" }}>
                {l.label}
              </a>
            ))}
          </div>

          <FlowerButton href="#top" size="sm" tone="daisy" icon={<Leaf size={15} />}>
            Top
          </FlowerButton>
        </div>

        <div
          style={{
            marginTop: 28,
            color: "var(--text-faint)",
            fontSize: 12.5,
            lineHeight: 1.7,
            maxWidth: 720,
          }}
        >
          A hackathon exploration of applied optimization — constraint-based
          search (simulated annealing + hill-climb) and model-free
          reinforcement learning (tabular Q-Learning) racing the same
          deterministic soil model. Built with React, Recharts, and
          TypeScript. The numbers are modeled stylizations, not agronomic
          guarantees — but the math is real.
        </div>
      </div>
    </footer>
  );
}