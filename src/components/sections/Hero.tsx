"use client";

import type React from "react";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import "./Hero.css";

function SocialIcon({ children }: { children: ReactNode }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true">{children}</svg>;
}

/* Menú integrado: los cuatro botones se abren alrededor del botón central. */
function SocialOrb() {
  const [open, setOpen] = useState(false);
  const itemStyle = (x: number, y: number) => ({ "--x": `${x}px`, "--y": `${y}px` } as CSSProperties);

  return (
    <div className={`social-orb${open ? " social-orb--open" : ""}`} onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)} onFocus={() => setOpen(true)} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false); }}>
      <span className="social-orb__hit-area" aria-hidden="true" />
      <button className="social-orb__trigger" type="button" aria-label="Abrir redes sociales" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        <SocialIcon><circle cx="12" cy="12" r="8.5" /><path d="M3.8 12h16.4M12 3.5c2.2 2.3 3.3 5.1 3.3 8.5S14.2 18.2 12 20.5C9.8 18.2 8.7 15.4 8.7 12S9.8 5.8 12 3.5Z" /></SocialIcon>
      </button>
      <a className="social-orb__link social-orb__link--whatsapp" style={itemStyle(0, -66)} href="" target="_blank" rel="noreferrer" aria-label="WhatsApp"><SocialIcon><path d="M20.5 11.8a8.35 8.35 0 0 1-12.38 7.32L4 20l.95-3.93A8.35 8.35 0 1 1 20.5 11.8Z" /><path d="M8.7 7.8c.18-.4.36-.41.62-.42h.53c.17 0 .4.06.5.39l.65 1.57c.08.2.05.36-.05.5l-.33.43c-.1.12-.2.25-.09.46.12.22.52.86 1.13 1.39.78.7 1.45.92 1.67 1.03.21.11.34.09.46-.05l.58-.68c.14-.16.3-.18.5-.1l1.65.78c.25.12.4.18.46.29.06.11.06.64-.15 1.26-.2.62-1.17 1.18-1.62 1.24-.42.06-.96.09-1.55-.1-.36-.11-.82-.27-1.41-.53-2.48-1.08-4.1-3.59-4.22-3.76-.12-.16-1.01-1.34-1.01-2.55 0-1.2.63-1.8.85-2.05Z" /></SocialIcon></a>
      <a className="social-orb__link social-orb__link--instagram" style={itemStyle(0, -128)} href="" target="_blank" rel="noreferrer" aria-label="Instagram"><SocialIcon><rect x="3.2" y="3.2" width="17.6" height="17.6" rx="5" /><circle cx="12" cy="12" r="4.1" /><circle className="social-orb__dot" cx="17.5" cy="6.7" r="1" /></SocialIcon></a>
      <a className="social-orb__link social-orb__link--twitter" style={itemStyle(0, -190)} href="" target="_blank" rel="noreferrer" aria-label="X, antes Twitter"><span aria-hidden="true">𝕏</span></a>
      <a className="social-orb__link social-orb__link--phone" style={itemStyle(0, -252)} href="" aria-label="Llamar por teléfono"><SocialIcon><path d="M21 16.5v2.7a1.8 1.8 0 0 1-1.96 1.8A17.8 17.8 0 0 1 3 4.96 1.8 1.8 0 0 1 4.8 3H7.5a1.8 1.8 0 0 1 1.8 1.55c.11.84.31 1.66.6 2.46a1.8 1.8 0 0 1-.4 1.9L8.36 10.05a14.4 14.4 0 0 0 5.59 5.59l1.14-1.14a1.8 1.8 0 0 1 1.9-.4c.8.29 1.62.49 2.46.6A1.8 1.8 0 0 1 21 16.5Z" /></SocialIcon></a>
    </div>
  );
}

/**
 * Terminal que "compila" la carrera y rota sola entre tres especialidades.
 * Vive en el mismo contenedor .hero__art. Es puramente decorativo
 * (aria-hidden, pointer-events: none) y no necesita al usuario para
 * avanzar: cada "build" se escribe solo, se sostiene un momento y pasa
 * al siguiente, en loop infinito. Alrededor del dibujo activo flotan
 * etiquetas con el nombre de cada especialidad.
 */
type TerminalLine = ReactNode;

type TerminalSlide = {
  key: "software" | "redes" | "entornos";
  label: string;
  lines?: TerminalLine[];
};

const TERMINAL_SLIDES: TerminalSlide[] = [
  {
    key: "software",
    label: "Software",
    lines: [
      <><span className="term-carousel__prompt">$</span> npm run build <span className="term-carousel__path">--software</span></>,
      <><span className="term-carousel__muted">→</span> compilando módulos ... <span className="term-carousel__ok">OK</span></>,
      <><span className="term-carousel__muted">→</span> optimizando bundle ... <span className="term-carousel__ok">OK</span></>,
      <span className="term-carousel__success">✓ SOFTWARE LISTO</span>,
    ],
  },
  { key: "redes", label: "Redes" },
  { key: "entornos", label: "Entornos Virtuales" },
];

function SlideVisual({ kind }: { kind: TerminalSlide["key"] }) {
  if (kind === "software") {
    return (
      <div className="term-carousel__window">
        <div className="term-carousel__bar"><span className="term-carousel__dot term-carousel__dot--r" /><span className="term-carousel__dot term-carousel__dot--y" /><span className="term-carousel__dot term-carousel__dot--g" /><span className="term-carousel__title">tiid@utt — software</span></div>
        <div className="term-carousel__body">
          <div><span className="term-carousel__prompt">$</span> npm run build <span className="term-carousel__path">--software</span></div>
          <div><span className="term-carousel__muted">→</span> compilando módulos ... <span className="term-carousel__ok">OK</span></div>
          <div><span className="term-carousel__muted">→</span> optimizando bundle ... <span className="term-carousel__ok">OK</span></div>
          <div className="term-carousel__success">✓ SOFTWARE LISTO</div>
          <div><span className="term-carousel__prompt">$</span> <span className="term-carousel__cursor" /></div>
        </div>
      </div>
    );
  }

  if (kind === "entornos") {
    return (
      <div className="specialty-visual specialty-visual--virtual">
        <span className="specialty-visual__eyebrow">LABORATORIO VIRTUAL</span>
        <svg viewBox="0 0 360 290" role="img" aria-label="Cubos tridimensionales de un entorno virtual">
          <defs>
            <linearGradient id="cubeTop" x1="0" x2="1"><stop stopColor="#d9ffdf" stopOpacity=".9" /><stop offset="1" stopColor="#2ecc71" stopOpacity=".42" /></linearGradient>
            <linearGradient id="cubeLeft" x1="0" x2="1"><stop stopColor="#1a823f" /><stop offset="1" stopColor="#0c3d20" /></linearGradient>
            <linearGradient id="cubeRight" x1="0" x2="1"><stop stopColor="#2ecc71" /><stop offset="1" stopColor="#145c31" /></linearGradient>
            <filter id="cubeGlow"><feGaussianBlur stdDeviation="5" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          </defs>
          <g className="virtual-grid"><path d="M35 224 180 146l145 78-145 50Z" /><path d="M65 232 180 169l115 63M105 246l75-42 75 42M180 146v128M115 181v86M245 181v86" /></g>
          <g className="virtual-cube virtual-cube--back"><path d="m179 55 53 29-53 29-53-29Z" fill="url(#cubeTop)" /><path d="m126 84 53 29v61l-53-29Z" fill="url(#cubeLeft)" /><path d="m232 84-53 29v61l53-29Z" fill="url(#cubeRight)" /></g>
          <g className="virtual-cube virtual-cube--front" filter="url(#cubeGlow)"><path d="m179 115 69 38-69 38-69-38Z" fill="url(#cubeTop)" /><path d="m110 153 69 38v76l-69-38Z" fill="url(#cubeLeft)" /><path d="m248 153-69 38v76l69-38Z" fill="url(#cubeRight)" /><path d="M179 209v35M145 172l34 19 34-19" fill="none" stroke="rgba(255,255,255,.48)" /></g>
          <circle className="virtual-orbit" cx="179" cy="154" r="113" /><circle className="virtual-pulse" cx="285" cy="113" r="5" /><circle className="virtual-pulse virtual-pulse--two" cx="72" cy="196" r="4" />
        </svg>
        <div className="specialty-visual__caption"><span>VM</span><span>CONTENEDORES</span><span>CLOUD</span></div>
      </div>
    );
  }

  return (
    <div className="specialty-visual specialty-visual--network">
      <span className="specialty-visual__eyebrow">RED SEGURA</span>
      <svg viewBox="0 0 360 290" role="img" aria-label="Escudo de ciberseguridad conectado a una red">
        <defs><linearGradient id="shieldFill" x1="0" x2="1"><stop stopColor="#2ecc71" stopOpacity=".52" /><stop offset="1" stopColor="#ffb703" stopOpacity=".3" /></linearGradient><filter id="networkGlow"><feGaussianBlur stdDeviation="4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs>
        <g className="network-lines"><path d="M45 74 124 119M42 210l86-38M311 74l-80 45M315 210l-85-38M70 143h61M230 143h61" /><path d="M45 74v136M315 74v136" /></g>
        <g className="network-node"><circle cx="45" cy="74" r="9" /><circle cx="42" cy="210" r="9" /><circle cx="315" cy="74" r="9" /><circle cx="315" cy="210" r="9" /><circle cx="70" cy="143" r="7" /><circle cx="291" cy="143" r="7" /></g>
        <g filter="url(#networkGlow)"><path className="shield" d="M180 52c28 24 60 27 60 27v60c0 48-30 76-60 93-30-17-60-45-60-93V79s32-3 60-27Z" fill="url(#shieldFill)" /><path className="shield-outline" d="M180 52c28 24 60 27 60 27v60c0 48-30 76-60 93-30-17-60-45-60-93V79s32-3 60-27Z" /><rect x="153" y="126" width="54" height="43" rx="8" className="lock" /><path className="lock" d="M164 126v-13c0-21 32-21 32 0v13M180 140v14" /></g>
        <circle className="network-ring" cx="180" cy="143" r="116" />
      </svg>
      <div className="specialty-visual__caption"><span>ENLACES</span><span>DEFENSA</span><span>MONITOREO</span></div>
    </div>
  );
}

/**
 * Etiquetas que flotan alrededor del dibujo, una por especialidad.
 * Quedan siempre estáticas: iluminadas y flotando todo el tiempo, sin
 * importar cuál dibujo esté activo en el carrusel — cada una lleva su
 * propia viñeta naranja al lado.
 */
function FloatingLabels() {
  return (
    <div className="term-carousel__labels" aria-hidden="true">
      {TERMINAL_SLIDES.map((slide) => (
        <span key={slide.key} className={`term-carousel__label-wrap term-carousel__label-wrap--${slide.key}`}>
          <span className="term-carousel__float-label">
            <span className="term-carousel__float-label-glow" />
            {slide.label}
          </span>
        </span>
      ))}
    </div>
  );
}

function TerminalCarousel() {
  const [slideIndex, setSlideIndex] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const hold = window.setTimeout(() => setFading(true), 3600);
    const change = window.setTimeout(() => { setSlideIndex((index) => (index + 1) % TERMINAL_SLIDES.length); setFading(false); }, 3920);
    return () => { window.clearTimeout(hold); window.clearTimeout(change); };
  }, [slideIndex]);

  const active = TERMINAL_SLIDES[slideIndex];
  return <div className="term-carousel" aria-hidden="true">
    <FloatingLabels />
    <div className={`term-carousel__visual${fading ? " term-carousel__visual--fading" : ""}`}><SlideVisual kind={active.key} /></div>
  </div>;
}


/**
 * Red de conexiones tipo "constelación" sobre toda la sección: puntitos
 * chicos unidos por líneas finas (naranja/verde) que se reacomodan solos
 * y que, al acercar el cursor, se van "juntando" hacia él como si fuera
 * un imán. Es deliberadamente discreta: densidad baja y opacidad baja
 * para que acompañe el fondo sin competir con el dibujo ni con el texto.
 * Vive en su propio <canvas>, del tamaño de toda la sección .hero.
 */
function useConnectionsField(
  sectionRef: React.RefObject<HTMLElement | null>,
  canvasRef: React.RefObject<HTMLCanvasElement | null>
) {
  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const CONNECT_DIST = 150;
    const MAGNET_RADIUS = 140;
    const MAGNET_STRENGTH = 0.4;
    const DRIFT_RADIUS = 36;
    const DRIFT_SPEED = 2.4;
    const ORANGE = "255,183,3";
    const GREEN = "46,204,113";

    type Pt = {
      bx: number;
      by: number;
      x: number;
      y: number;
      phase: number;
      speed: number;
      color: string;
    };

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let points: Pt[] = [];

    const rand = (min: number, max: number) => min + Math.random() * (max - min);

    const seed = () => {
      // Un poco más de presencia que antes, siguiendo siendo un detalle
      // de fondo, no el protagonista.
      const area = width * height;
      const count = Math.round(Math.min(52, Math.max(24, area / 27000)));
      points = Array.from({ length: count }).map((_, i) => {
        const bx = rand(0.04, 0.96) * width;
        const by = rand(0.06, 0.94) * height;
        return {
          bx,
          by,
          x: bx,
          y: by,
          phase: rand(0, Math.PI * 2),
          speed: rand(0.35, 0.8),
          color: i % 2 === 0 ? ORANGE : GREEN,
        };
      });
    };

    const resize = () => {
      const rect = section.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };

    resize();
    window.addEventListener("resize", resize);

    const pointer = { x: -9999, y: -9999, active: false };

    const onMove = (clientX: number, clientY: number) => {
      const rect = section.getBoundingClientRect();
      pointer.x = clientX - rect.left;
      pointer.y = clientY - rect.top;
      pointer.active =
        pointer.x >= -MAGNET_RADIUS &&
        pointer.x <= width + MAGNET_RADIUS &&
        pointer.y >= -MAGNET_RADIUS &&
        pointer.y <= height + MAGNET_RADIUS;
    };
    const onPointerMove = (e: PointerEvent) => onMove(e.clientX, e.clientY);
    const onPointerLeave = () => {
      pointer.active = false;
    };

    section.addEventListener("pointermove", onPointerMove, { passive: true });
    section.addEventListener("pointerleave", onPointerLeave);

    let raf = 0;

    const drawStatic = () => {
      ctx.clearRect(0, 0, width, height);
      points.forEach((p) => {
        ctx.beginPath();
        ctx.fillStyle = `rgba(${p.color},0.6)`;
        ctx.arc(p.x, p.y, 1.7, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    const tick = (time: number) => {
      ctx.clearRect(0, 0, width, height);

      points.forEach((p) => {
        const floatX = Math.sin(time * 0.0002 * p.speed * DRIFT_SPEED + p.phase) * DRIFT_RADIUS;
        const floatY = Math.cos(time * 0.00025 * p.speed * DRIFT_SPEED + p.phase) * DRIFT_RADIUS;
        let targetX = p.bx + floatX;
        let targetY = p.by + floatY;

        if (pointer.active) {
          const dx = pointer.x - targetX;
          const dy = pointer.y - targetY;
          const dist = Math.hypot(dx, dy);
          if (dist < MAGNET_RADIUS) {
            const pull = (1 - dist / MAGNET_RADIUS) * MAGNET_STRENGTH;
            targetX += dx * pull;
            targetY += dy * pull;
          }
        }

        p.x += (targetX - p.x) * 0.15;
        p.y += (targetY - p.y) * 0.15;
      });

      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const a = points[i];
          const b = points[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < CONNECT_DIST) {
            const alpha = (1 - d / CONNECT_DIST) * 0.22;
            ctx.strokeStyle = `rgba(${a.color},${alpha})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }

        if (pointer.active) {
          const d = Math.hypot(points[i].x - pointer.x, points[i].y - pointer.y);
          const radius = MAGNET_RADIUS * 0.85;
          if (d < radius) {
            const alpha = (1 - d / radius) * 0.3;
            ctx.strokeStyle = `rgba(${points[i].color},${alpha})`;
            ctx.lineWidth = 0.5 + (1 - d / CONNECT_DIST) * 5;
            ctx.beginPath();
            ctx.moveTo(points[i].x, points[i].y);
            ctx.lineTo(pointer.x, pointer.y);
            ctx.stroke();
          }
        }
      }

      points.forEach((p) => {
        ctx.beginPath();
        ctx.fillStyle = `rgba(${p.color},0.65)`;
        ctx.arc(p.x, p.y, 1.7, 0, Math.PI * 2);
        ctx.fill();
      });

      raf = requestAnimationFrame(tick);
    };

    if (prefersReducedMotion) {
      drawStatic();
    } else {
      raf = requestAnimationFrame(tick);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      section.removeEventListener("pointermove", onPointerMove);
      section.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [sectionRef, canvasRef]);
}

/**
 * NUEVO: efecto de "salida" del Hero al acercarse la siguiente sección.
 * Calcula un valor 0→1 (--hero-exit) según qué tan cerca está el borde
 * inferior de la sección de salir de la pantalla, y lo expone como
 * variable CSS para animar encogido + blur + un iris negro que se
 * cierra (ver .hero__exit-veil en Hero.css).
 */
function useHeroExitEffect(sectionRef: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;

    let raf = 0;

    const render = () => {
      const rect = section.getBoundingClientRect();

      const raw = 1 - rect.bottom / window.innerHeight;
      const value = Math.min(1, Math.max(0, raw));
      section.style.setProperty("--hero-exit", value.toFixed(3));
      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [sectionRef]);
}

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);
  const connectionsRef = useRef<HTMLCanvasElement | null>(null);

  useConnectionsField(sectionRef, connectionsRef);
  useHeroExitEffect(sectionRef);

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;


    const noiseCanvas = document.createElement("canvas");
    noiseCanvas.width = 180;
    noiseCanvas.height = 180;

    const noiseCtx = noiseCanvas.getContext("2d")!;

    const image = noiseCtx.createImageData(noiseCanvas.width, noiseCanvas.height);

    for (let i = 0; i < image.data.length; i += 4) {
      const value = Math.random() * 120;

      image.data[i] = value;
      image.data[i + 1] = value;
      image.data[i + 2] = value;

      image.data[i + 3] = 18;
    }

    noiseCtx.putImageData(image, 0, 0);

    let noisePattern: CanvasPattern | null = null;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const drawTexture = () => {
      ctx.globalCompositeOperation = "source-over";

      // Negro
      ctx.fillStyle = "#050505";
      ctx.fillRect(0, 0, width, height);

      // Ruido
      if (noisePattern) {
        ctx.globalAlpha = 0.5;

        ctx.fillStyle = noisePattern;
        ctx.fillRect(0, 0, width, height);

        ctx.globalAlpha = 1;
      }

      // Líneas
      ctx.strokeStyle = "rgba(255,255,255,.06)";
      ctx.lineWidth = 1;

      for (let x = 0; x < width; x += 3) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Viñeta
      const vignette = ctx.createRadialGradient(
        width / 2,
        height / 2,
        0,
        width / 2,
        height / 2,
        Math.max(width, height)
      );

      vignette.addColorStop(0, "rgba(0,0,0,0)");
      vignette.addColorStop(1, "rgba(0,0,0,.95)");

      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);
    };

    const resize = () => {
      const rect = section.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      noisePattern = ctx.createPattern(noiseCanvas, "repeat");
      drawTexture();
    };

    resize();

    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <section className="hero" ref={sectionRef}>
      <canvas ref={canvasRef} className="hero__canvas" />

      <canvas ref={connectionsRef} className="hero__connections" aria-hidden="true" />

      {/* NUEVO: velo negro que sube de opacidad al salir de escena */}
      <div className="hero__exit-veil" aria-hidden="true" />

      <div className="hero__art" aria-hidden="true">
        <TerminalCarousel />
      </div>

      <div className="hero__content">
        {/* <header className="hero__nav">
          <span className="hero__logo">UTT<span className="hero__logo-dot">·</span>TIID</span>
          <nav className="hero__links">
            <a href="#programa">Programa</a>
            <a href="#perfil">Perfil de egreso</a>
            <a href="#plan">Plan de estudios</a>
            <a href="#contacto">Contacto</a>
          </nav>
          <a href="#admisiones" className="hero__cta">Admisiones</a>
        </header> */}

        <div className="hero__main">
          <p className="hero__eyebrow">
            <span className="hero__eyebrow-dot" aria-hidden="true" />
            Universidad Tecnológica de Tlaxcala
          </p>

          <h1 className="hero__title">
            <span className="hero__title-row">
              <span className="thin-tech  ">Tecnologías</span></span>
            <span className="hero__title-row row-1">
              <span className="fill size color">de la</span>
              <span className="fill size">Información</span>
              </span>
            <span className="hero__title-row row-2">
              <span className="thin dif-e diference">e</span>
              <span className="fill accent underline diference hero__title-plus">
                Innovación
              </span>
              <span className="fill underline thin-2">Digital</span>
            </span>
          </h1>

          {/* <p className="hero__accent-line">
            Redes · Software · Entornos Virtuales
          </p> */}
        </div>

        <div className="hero__footer">
          <div className="hero__footer-left">
            <SocialOrb />
            <p className="hero__subtitle">
              Prepárate para diseñar, desarrollar e innovar con las tecnologías que impulsan la transformación digital.
            </p>
          </div>

          <div className="hero__footer-right">
            <div className="hero__stats">
              <div className="hero__stat">
                <span className="hero__stat-num">3</span>
                <span className="hero__stat-label">Especialidades</span>
              </div>
              <div className="hero__stat">
                <span className="hero__stat-num">10</span>
                <span className="hero__stat-label">Cuatrimestres</span>
              </div>
              <div className="hero__stat">
                <span className="hero__stat-num">2</span>
                <span className="hero__stat-label">Títulos</span>
              </div>
            </div>

              <span className="hero__scroll">
  <span className="hero__scroll-label">Desplázate</span>

  <div className="hero__scroll-energy">
    <span className="blob blob1"></span>
    <span className="blob blob2"></span>
    <span className="blob blob3"></span>

    <span className="hero__scroll-arrow">
      ↓
    </span>
  </div>
</span>
          </div>
        </div>
      </div>
      {/* <a
        href="#admisiones"
        className="hero__corner-btn hero__corner-btn--cta"
        aria-label="Ir a admisiones"
      >
        +
      </a> */}
    </section>
  );
}