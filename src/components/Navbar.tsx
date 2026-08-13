import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Logo } from "./icons";
import FlowerButton from "./FlowerButton";

const LINKS = [
  { href: "#catalog", label: "Crops" },
  { href: "#method", label: "Method" },
  { href: "#simulate", label: "Simulator" },
  { href: "#math", label: "The Math" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 28, restDelta: 0.001 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        transition:
          "background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease, backdrop-filter 0.3s ease",
        background: scrolled ? "rgba(255,255,255,0.82)" : "transparent",
        borderBottom: scrolled ? "1px solid rgba(20,33,26,0.07)" : "1px solid transparent",
        boxShadow: scrolled ? "0 12px 40px -28px rgba(20,45,30,0.35)" : "none",
        backdropFilter: scrolled ? "blur(18px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(18px)" : "none",
      }}
    >
      <motion.div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          scaleX: progress,
          transformOrigin: "0% 50%",
          background: "linear-gradient(90deg,#1a9c57,#0c8496)",
          opacity: scrolled ? 1 : 0,
          transition: "opacity 0.3s ease",
        }}
      />
      <div
        className="container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 68,
        }}
      >
        <a href="#top" style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <Logo />
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 18,
              color: "var(--text)",
              letterSpacing: "-0.02em",
            }}
          >
            rotato
            <span style={{ color: "var(--emerald)" }}>.</span>
          </span>
        </a>

        <nav style={{ display: "flex", gap: 4, alignItems: "center" }}>
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              style={{
                padding: "8px 14px",
                borderRadius: 10,
                fontSize: 14,
                color: "var(--text-dim)",
                fontWeight: 500,
                transition: "color 0.2s ease, background 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--text)";
                e.currentTarget.style.background = "rgba(20,33,26,0.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--text-dim)";
                e.currentTarget.style.background = "transparent";
              }}
            >
              {l.label}
            </a>
          ))}
          <FlowerButton href="#simulate" size="sm" tone="rose" icon={<ArrowRight size={15} />} className="nav-cta">
            Optimize
          </FlowerButton>
        </nav>
      </div>
    </motion.header>
  );
}