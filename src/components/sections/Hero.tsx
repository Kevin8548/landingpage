import { useEffect, useMemo, useRef, useState } from "react";
import "./Hero.css";

const PRELOADER_TEXT = "UTT · TIID";

type Ember = {
  id: number;
  left: number;
  top: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
};

export default function Hero() {
  const [typed, setTyped] = useState("");
  const [subShow, setSubShow] = useState(false);
  const [ringGo, setRingGo] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [preloaderDone, setPreloaderDone] = useState(false);
  const [ready, setReady] = useState(false);

  const vantaRef = useRef<HTMLDivElement>(null);
  const vantaEffect = useRef<any>(null);

  const reduced = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );

  const embers: Ember[] = useMemo(() => {
    const colors = ["#3ddc84", "#ff7a45", "#38e6c9"];
    return Array.from({ length: 26 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: 60 + Math.random() * 40,
      size: Math.random() * 3 + 1.5,
      color: colors[i % colors.length],
      duration: 5 + Math.random() * 5,
      delay: Math.random() * 6,
    }));
  }, []);

  // Preloader: bloquea scroll + animación de tipeo
  useEffect(() => {
    document.documentElement.classList.add("tid-locked");

    let i = 0;
    let timeoutId: ReturnType<typeof setTimeout>;

    const typeChar = () => {
      if (i < PRELOADER_TEXT.length) {
        const ch = PRELOADER_TEXT[i];
        setTyped((prev) => prev + ch);
        i++;
        timeoutId = setTimeout(
          typeChar,
          reduced ? 1 : ch === "·" ? 260 : 110 + Math.random() * 70
        );
      } else {
        setSubShow(true);
        timeoutId = setTimeout(finishAndExit, reduced ? 30 : 750);
      }
    };

    const finishAndExit = () => {
      setRingGo(true);
      timeoutId = setTimeout(() => {
        setLeaving(true);
        setReady(true);
        document.documentElement.classList.remove("tid-locked");
        timeoutId = setTimeout(() => setPreloaderDone(true), 1150);
      }, reduced ? 10 : 260);
    };

    timeoutId = setTimeout(typeChar, reduced ? 0 : 450);

    return () => clearTimeout(timeoutId);
  }, [reduced]);

  // Vanta.js — fondo interactivo de puntos 3D
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const THREE = await import("three");
      // vanta.dots.min es un módulo UMD: espera THREE en window
      (window as any).THREE = THREE;

      // @ts-ignore - vanta no trae tipos oficiales
      const vantaModule = await import("vanta/dist/vanta.dots.min");
      const DOTS =
        (vantaModule as any).default?.default ??
        (vantaModule as any).default ??
        (vantaModule as any);

      if (cancelled || !vantaRef.current || vantaEffect.current) return;

      if (typeof DOTS !== "function") {
        console.error("No se pudo cargar VANTA.DOTS correctamente", vantaModule);
        return;
      }

      vantaEffect.current = DOTS({
        el: vantaRef.current,
        THREE,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.0,
        minWidth: 200.0,
        scale: 1.0,
        scaleMobile: 1.0,
        color: 0x3ddc84,
        color2: 0xff7a45,
        backgroundColor: 0x050b08,
        size: 3.8,
        spacing: 30.0,
        showLines: false,
      });

      vantaRef.current.classList.add("on");
    })();

    return () => {
      cancelled = true;
      if (vantaEffect.current) {
        vantaEffect.current.destroy();
        vantaEffect.current = null;
      }
    };
  }, []);

  return (
    <>
      {!preloaderDone && (
        <div className={`tid-preloader ${leaving ? "leaving" : ""}`}>
          <div className="tid-pl-aurora">
            <div className="tid-pl-blob" />
            <div className="tid-pl-blob" />
            <div className="tid-pl-blob" />
          </div>
          <div className="tid-pl-embers">
            {embers.map((e) => (
              <div
                key={e.id}
                className="tid-pl-ember"
                style={{
                  left: `${e.left}%`,
                  top: `${e.top}%`,
                  width: e.size,
                  height: e.size,
                  color: e.color,
                  background: "currentColor",
                  animationDuration: `${e.duration}s`,
                  animationDelay: `${e.delay}s`,
                }}
              />
            ))}
          </div>
          <div className={`tid-pl-ring ${ringGo ? "go" : ""}`} />
          <div className="tid-pl-center">
            <div className="tid-pl-type">
              {typed.split("").map((ch, idx) => (
                <span
                  key={idx}
                  className={`tid-letter ${ch === "·" ? "accent-dot" : ""}`}
                >
                  {ch === " " ? "\u00A0" : ch}
                </span>
              ))}
              <span className="tid-caret" />
            </div>
            <div className={`tid-pl-sub ${subShow ? "show" : ""}`}>
              Ingeniería en Tecnologías de la Información
            </div>
          </div>
        </div>
      )}

      <div className={`tid-hero ${ready ? "ready" : ""}`}>
        <div id="tid-vanta-bg" ref={vantaRef} />
        <div className="tid-vignette" />
        <div className="tid-grain" />

        <div className="tid-tech-chip c1">
          <span className="tid-sq" style={{ background: "var(--green)" }} />
          &lt;/&gt; desarrollo
        </div>
        <div className="tid-tech-chip c2">
          <span className="tid-sq" style={{ background: "var(--orange)" }} />
          entornos virtuales
        </div>
        <div className="tid-tech-chip c3">
          <span className="tid-sq" style={{ background: "var(--teal)" }} />
          datos &amp; IA
        </div>
        <div className="tid-tech-chip c4">
          <span className="tid-sq" style={{ background: "var(--green)" }} />
          ciberseguridad
        </div>

        <div className="tid-content">
          <div className="tid-eyebrow tid-rise">
            <span className="tid-dot" /> Universidad Tecnológica de Tlaxcala — Ingeniería en
          </div>

          <h1>
            <span className="tid-line tid-rise">Tecnologías de la</span>
            <span className="tid-line tid-rise">Información e</span>
            <span className="tid-line tid-rise tid-accent">
              Innovación Digital
            </span>
          </h1>

          

          {/* <p className="tid-sub tid-rise">
            Formamos a quienes diseñan, programan y sostienen la
            infraestructura digital de Tlaxcala —{" "}
            <b>con criterio, con datos, con propósito</b>.
          </p> */}

          <div className="tid-cta-row">
            <button className="tid-btn tid-btn-primary tid-pop">
              Más información
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <path
                  d="M3 8H13M13 8L9 4M13 8L9 12"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button className="tid-btn tid-btn-secondary tid-pop">
              Plan de estudios
            </button>
          </div>
          <div className="tid-socials tid-rise">
            <a href="#" aria-label="Facebook" title="Facebook">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 8h-2a2 2 0 0 0-2 2v10M8 13h5" />
                <circle cx="12" cy="12" r="10" />
              </svg>
            </a>
            <a href="#" aria-label="Instagram" title="Instagram">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.2" cy="6.8" r="1" />
              </svg>
            </a>
            <a href="#" aria-label="WhatsApp" title="WhatsApp">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 20l1.4-4.1A8 8 0 1 1 8.6 19L4 20Z" />
                <path d="M8.5 9.7c0 3 2.8 5.8 5.8 5.8.5 0 1-.7 1.2-1.2.1-.3 0-.6-.2-.8l-1.3-1a.6.6 0 0 0-.7 0l-.5.4a4 4 0 0 1-2.7-2.7l.4-.5a.6.6 0 0 0 0-.7l-1-1.3a.6.6 0 0 0-.8-.2c-.5.2-1.2.7-1.2 1.2Z" />
              </svg>
            </a>
            <a href="#" aria-label="Teléfono" title="Teléfono">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />
              </svg>
            </a>
          </div>
        </div>

      

        <div className="tid-scroll-cue">
          <div className="tid-mouse">
            <div className="tid-wheel" />
          </div>
          Desplázate
        </div>
      </div>
    </>
  );
}
