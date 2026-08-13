import { lazy, Suspense, useCallback, useState } from "react";
import { Sprout } from "lucide-react";
import type { SetupData } from "./engine/types";
import { solveAll } from "./engine/solver";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import FloatingPetals from "./components/FloatingPetals";
import CropIndex from "./components/CropIndex";
import HowItWorks from "./components/HowItWorks";
import Simulator from "./components/Simulator";
import ModelPanel from "./components/ModelPanel";
import Footer from "./components/Footer";
import type { SolveOutput } from "./components/Results";

const Results = lazy(() => import("./components/Results"));

export default function App() {
  const [setup, setSetup] = useState<SetupData | null>(null);
  const [data, setData] = useState<SolveOutput | null>(null);
  const [busy, setBusy] = useState(false);

  const run = useCallback((s: SetupData) => {
    setBusy(true);
    setSetup(s);
    requestAnimationFrame(() => {
      const out = solveAll(s, s.presetSequence);
      setData({
        all: out.all,
        ranked: out.ranked,
        learningCurve: out.learningCurve,
      });
      setBusy(false);
      setTimeout(() => {
        document.getElementById("results")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 120);
    });
  }, []);

  return (
    <>
      <Navbar />
      <FloatingPetals />
      <main style={{ perspective: "1200px" }}>
        <Hero />
        <CropIndex />
        <HowItWorks />
        <Simulator onRun={run} busy={busy} />

        {data !== null && setup !== null && (
          <Suspense
            fallback={
              <div className="section" style={{ paddingTop: 40 }}>
                <div className="container">
                  <div className="glass" style={{ padding: 60, textAlign: "center" }}>
                    <div style={{ display: "grid", placeItems: "center", animation: "floaty 2.4s ease-in-out infinite" }}>
                      <Sprout size={44} strokeWidth={1.5} style={{ color: "var(--emerald)" }} />
                    </div>
                    <h3 style={{ marginTop: 18, fontSize: 20 }}>Rendering your dashboard…</h3>
                  </div>
                </div>
              </div>
            }
          >
            <Results data={data} setup={setup} />
          </Suspense>
        )}

        <ModelPanel />
      </main>
      <Footer />
    </>
  );
}