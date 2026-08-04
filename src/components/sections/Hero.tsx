"use client";

import type React from "react";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import "./Hero.css";

/**
 * Hero — Tecnologías de la Información e Innovación Digital
 * Universidad Tecnológica de Tlaxcala
 *
 * El fondo (ruido + líneas + viñeta) se dibuja en un <canvas> tal cual ya
 * lo tenías. Se quitó el efecto de "mancha/trapo" que se destapaba con el
 * mouse y el video de fondo, y en su lugar se agregó una animación
 * decorativa tipo "constelación tecnológica": un núcleo tipo chip/circuito
 * con nodos (Software / Redes / Entornos Virtuales) orbitando alrededor,
 * más partículas flotantes. Todo puramente visual (pointer-events: none),
 * no requiere mouse para verse.
 *
 * NUEVO: efecto de "salida" al hacer scroll hacia la siguiente sección.
 * Se calcula --hero-exit (0 a 1) según qué tan cerca está el borde
 * inferior del hero de salir de la pantalla, y con eso se anima un
 * encogido + blur del contenido, más un velo negro que sube de opacidad
 * (ver .hero__exit-veil en Hero.css) para fundir hacia la siguiente
 * sección en vez de cortar en seco.
 */

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
 * Constelación tecnológica: núcleo tipo chip/circuito con nodos orbitando
 * (Software / Redes / Entornos Virtuales, + un par extra de acentos) y
 * partículas. Es puramente decorativo (aria-hidden, pointer-events: none).
 */
function TechVisual() {
  const orbitStyle = (dur: string, reverse?: boolean): CSSProperties =>
    ({ "--dur": dur, animationDirection: reverse ? "reverse" : "normal" } as CSSProperties);

  return (
    <div className="tech-visual" aria-hidden="true">
      <div className="tech-visual__outer-ring" />
      <div className="tech-visual__glow" />

      <svg className="tech-visual__core" viewBox="0 0 400 400">
        <polygon
          className="tech-visual__hex tech-visual__hex--outer"
          points="200,40 340,120 340,280 200,360 60,280 60,120"
        />
        <polygon
          className="tech-visual__hex tech-visual__hex--inner"
          points="200,90 300,145 300,255 200,310 100,255 100,145"
        />
        <path
          className="tech-visual__trace"
          d="M200,40 L200,90 M340,120 L300,145 M340,280 L300,255 M200,360 L200,310 M60,280 L100,255 M60,120 L100,145"
        />
        <circle className="tech-visual__pulse" cx="200" cy="200" r="46" />
        <circle className="tech-visual__pulse tech-visual__pulse--alt" cx="200" cy="200" r="46" />
        <g className="tech-visual__circuit-dots">
          <circle cx="200" cy="90" r="3" className="dot dot--g" />
          <circle cx="300" cy="145" r="3" className="dot dot--o" />
          <circle cx="300" cy="255" r="3" className="dot dot--g" />
          <circle cx="200" cy="310" r="3" className="dot dot--o" />
          <circle cx="100" cy="255" r="3" className="dot dot--g" />
          <circle cx="100" cy="145" r="3" className="dot dot--o" />
        </g>
        <circle className="tech-visual__glyph-badge" cx="200" cy="200" r="36" />
        <text x="200" y="209" className="tech-visual__glyph" textAnchor="middle">
          {"</>"}
        </text>
      </svg>

      <div className="tech-visual__orbit tech-visual__orbit--1" style={orbitStyle("16s")}>
        <div className="tech-visual__node-inner" style={orbitStyle("16s", true)}>
          <span className="tech-visual__node tech-visual__node--cyan">
            <svg viewBox="0 0 24 24">
              <rect x="4" y="4" width="16" height="16" rx="2" />
              <path d="M9 9h6v6H9z" />
              <path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2" />
            </svg>
          </span>
        </div>
      </div>

      <div className="tech-visual__orbit tech-visual__orbit--2" style={orbitStyle("24s", true)}>
        <div className="tech-visual__node-inner" style={orbitStyle("24s")}>
          <span className="tech-visual__node tech-visual__node--violet">
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="5" r="2.4" />
              <circle cx="5" cy="19" r="2.4" />
              <circle cx="19" cy="19" r="2.4" />
              <path d="M12 7.4V14M12 14 6.6 17.2M12 14l5.4 3.2" />
            </svg>
          </span>
        </div>
      </div>

      <div className="tech-visual__orbit tech-visual__orbit--3" style={orbitStyle("32s")}>
        <div className="tech-visual__node-inner" style={orbitStyle("32s", true)}>
          <span className="tech-visual__node tech-visual__node--amber">
            <svg viewBox="0 0 24 24">
              <path d="M6 18a4 4 0 0 1-.6-7.95A5.5 5.5 0 0 1 16 8a4.5 4.5 0 0 1 1 8.9" />
              <path d="M8 18v2M12 18v3M16 18v2" />
            </svg>
          </span>
        </div>
      </div>

      <div className="tech-visual__orbit tech-visual__orbit--4" style={orbitStyle("13s", true)}>
        <div className="tech-visual__node-inner" style={orbitStyle("13s")}>
          <span className="tech-visual__node tech-visual__node--magenta">
            <svg viewBox="0 0 24 24">
              <ellipse cx="12" cy="6" rx="7" ry="2.6" />
              <path d="M5 6v6c0 1.4 3.1 2.6 7 2.6s7-1.2 7-2.6V6" />
              <path d="M5 12v6c0 1.4 3.1 2.6 7 2.6s7-1.2 7-2.6v-6" />
            </svg>
          </span>
        </div>
      </div>

      <div className="tech-visual__orbit tech-visual__orbit--5" style={orbitStyle("28s")}>
        <div className="tech-visual__node-inner" style={orbitStyle("28s", true)}>
          <span className="tech-visual__node tech-visual__node--cyan">
            <svg viewBox="0 0 24 24">
              <path d="M12 3.3 19 6v5.2c0 4.3-2.9 7.4-7 8.5-4.1-1.1-7-4.2-7-8.5V6l7-2.7Z" />
              <path d="m9.2 12 2 2 3.6-4" />
            </svg>
          </span>
        </div>
      </div>

      <div className="tech-visual__orbit tech-visual__orbit--6" style={orbitStyle("10s")}>
        <div className="tech-visual__node-inner" style={orbitStyle("10s", true)}>
          <span className="tech-visual__node tech-visual__node--teal">
            <svg viewBox="0 0 24 24">
              <rect x="7" y="7" width="10" height="10" rx="1.5" />
              <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.5 4.5l2 2M17.5 17.5l2 2M19.5 4.5l-2 2M6.5 17.5l-2 2" />
            </svg>
          </span>
        </div>
      </div>

      <div className="tech-visual__orbit tech-visual__orbit--7" style={orbitStyle("38s", true)}>
        <div className="tech-visual__node-inner" style={orbitStyle("38s")}>
          <span className="tech-visual__node tech-visual__node--amber">
            <svg viewBox="0 0 24 24">
              <path d="M2 8.5a15.5 15.5 0 0 1 20 0" />
              <path d="M5.5 12.5a10.5 10.5 0 0 1 13 0" />
              <path d="M9 16.5a5.5 5.5 0 0 1 6 0" />
              <circle cx="12" cy="20" r="1.1" fill="currentColor" stroke="none" />
            </svg>
          </span>
        </div>
      </div>

      <div className="tech-visual__orbit tech-visual__orbit--8" style={orbitStyle("9s")}>
        <div className="tech-visual__node-inner" style={orbitStyle("9s", true)}>
          <span className="tech-visual__node tech-visual__node--sm tech-visual__node--amber">
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" />
            </svg>
          </span>
        </div>
      </div>

      <span className="tech-visual__tag tech-visual__tag--software">Software</span>
      <span className="tech-visual__tag tech-visual__tag--redes">Redes</span>
      <span className="tech-visual__tag tech-visual__tag--entornos">Entornos Virtuales</span>

      <div className="tech-visual__particles">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  );
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
 * inferior de la sección de salir de la pantalla por arriba, y lo expone
 * como variable CSS para animar encogido + blur + un iris negro que se
 * cierra (ver .hero__exit-veil en Hero.css).
 *
 * OJO: la fórmula anterior (con "startAt"/"endAt" ajustados a mano)
 * hacía que el oscurecido llegara solo a ~85% justo cuando la sección
 * ya había salido por completo de la pantalla — el 15% final nunca se
 * alcanzaba a ver. Esta versión amarra el 0→1 directamente a "cuánto
 * del borde inferior ya cruzó la parte de arriba del viewport", así que
 * --hero-exit llega a 1 exactamente en el instante en que el Hero
 * termina de desaparecer, ni antes ni después.
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
      // rect.bottom == innerHeight  -> la sección todavía llena toda la
      //                                pantalla, apenas va a empezar a salir.
      // rect.bottom == 0            -> la sección acaba de terminar de
      //                                salir por completo (ya no se ve nada).
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
  useHeroExitEffect(sectionRef); // 👈 NUEVO

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // =======================
    // Textura de ruido (igual que ya la tenías)
    // =======================
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
        <TechVisual />
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
              <span className="thin-tech ">Tecnologías</span></span>
            <span className="hero__title-row row-1">
              <span className="fill size color">de la</span>
              <span className="fill size">Información</span>
              </span>
            <span className="hero__title-row row-2">
              <span className="thin dif-e diference">e</span>
              <span className="fill accent underline diference hero__title-plus">
                Innovación
              </span>
              <span className="fill thin-2">Digital</span>
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