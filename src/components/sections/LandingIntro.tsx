import { useEffect, useState } from "react";

type IntroPhase = "loading" | "exiting" | "done";
const LANDING_INTRO_KEY = "utt-landing-intro-seen-v4";

function getIntroPhase(): IntroPhase {
  if (typeof window === "undefined") return "done";
  try {
    return window.sessionStorage.getItem(LANDING_INTRO_KEY) ? "done" : "loading";
  } catch {
    return "loading";
  }
}

export default function LandingIntro() {
  const [phase, setPhase] = useState<IntroPhase>(getIntroPhase);

  useEffect(() => {
    if (phase !== "loading") return;
    try {
      window.sessionStorage.setItem(LANDING_INTRO_KEY, "true");
    } catch {
      // La animación sigue funcionando aunque el navegador bloquee el almacenamiento.
    }
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      setPhase("exiting");
    }, reducedMotion ? 400 : 4300);
    return () => window.clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "exiting") return;
    const timer = window.setTimeout(() => {
      setPhase("done");
      requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: "auto" }));
    }, 900);
    return () => window.clearTimeout(timer);
  }, [phase]);

  if (phase === "done") return null;

  return (
    <div className={`hero-intro${phase === "exiting" ? " hero-intro--exiting" : ""}`} role="status" aria-live="polite" aria-label="Cargando Universidad Tecnológica de Tlaxcala">
      <div className="hero-intro__center">
        <h1 className="hero-intro__word" aria-label="TIID">
          <svg className="hero-intro__glyph" viewBox="0 0 120 160" aria-hidden="true"><text className="hero-intro__glyph-text" x="60" y="128" textAnchor="middle">T</text></svg>
          <svg className="hero-intro__glyph" viewBox="0 0 120 160" aria-hidden="true"><text className="hero-intro__glyph-text" x="60" y="128" textAnchor="middle">I</text></svg>
          <svg className="hero-intro__glyph" viewBox="0 0 120 160" aria-hidden="true"><text className="hero-intro__glyph-text" x="60" y="128" textAnchor="middle">I</text></svg>
          <svg className="hero-intro__glyph" viewBox="0 0 120 160" aria-hidden="true"><text className="hero-intro__glyph-text" x="60" y="128" textAnchor="middle">D</text></svg>
        </h1>
        <p className="hero-intro__caption">Universidad Tecnológica de Tlaxcala</p>
        <div className="hero-intro__progress" role="progressbar" aria-label="Cargando la página" aria-valuemin={0} aria-valuemax={100}>
          <span />
        </div>
      </div>
    </div>
  );
}
