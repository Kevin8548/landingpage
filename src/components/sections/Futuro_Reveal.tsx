"use client";

import { useEffect, useRef } from "react";
import "./Futuro_Reveal.css";

const PHRASE =
  "Es el momento de construir lo que siempre soñaste. Tu futuro comienza aquí";
const LETTERS = Array.from(PHRASE);

export default function FuturoReveal() {
  const wrapperRef = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const underlineRef = useRef<HTMLSpanElement | null>(null);
  const ctaRef = useRef<HTMLDivElement | null>(null);
  const entryVeilRef = useRef<HTMLDivElement | null>(null); // NUEVO: velo de entrada

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const clamp = (value: number) => Math.min(1, Math.max(0, value));
    const easeOut = (value: number) => 1 - Math.pow(1 - value, 3);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    let active = false;

    const progress = () => {
      const rect = wrapper.getBoundingClientRect();
      const distance = rect.height - window.innerHeight;
      return distance > 0 ? clamp(-rect.top / distance) : 1;
    };

    const render = (value: number) => {
      wrapper.style.setProperty("--progress", value.toFixed(4));

      // NUEVO: velo de entrada tipo "iris" (diafragma de cámara).
      // OJO: aquí NO usamos `value` (que está normalizado sobre los 900vh
      // completos de la sección) porque eso hacía que el velo tardara
      // ~72vh de scroll en destaparse — prácticamente invisible para el
      // usuario. En su lugar medimos los píxeles reales de scroll desde
      // que la sección se "fija" (pin.top llega a 0), y el velo se cierra
      // en menos de 1 pantalla de scroll (60% del alto de viewport).
      const pinTop = wrapper.getBoundingClientRect().top;
      const veilDistance = Math.max(window.innerHeight * 0.6, 1);
      const veilRaw = clamp(-pinTop / veilDistance);
      const veilProgress = easeOut(veilRaw);
      if (entryVeilRef.current) {
        // Empieza cubriendo todo (150%) y se cierra hacia el centro (0%),
        // revelando primero las orillas y al final el centro — efecto
        // de diafragma/iris cerrándose, mucho más vistoso que un fade plano.
        const radius = 150 - veilProgress * 150;
        entryVeilRef.current.style.clipPath = `circle(${radius}% at 50% 50%)`;
      }

      // Una sola frase: inicia fuera de la pantalla a la derecha y termina fuera a la izquierda.
      // El desplazamiento depende del scroll, por eso nunca se queda fija ni se repite.
      const trackWidth = trackRef.current?.scrollWidth ?? 0;
      // Lineal: cada pequeño scroll mueve el letrero la misma cantidad.
      // Antes usaba easeOut y por eso avanzaba demasiado de golpe al principio.
      const x = window.innerWidth + (-trackWidth - window.innerWidth) * value;
      if (trackRef.current) {
        trackRef.current.style.transform = `translate3d(${x}px, -50%, 0)`;
      }

      // La frase entra por la derecha; cada letra emerge alternando arriba/abajo.
      // Así la animación se siente orgánica sin que el texto entre desde una esquina.
      letterRefs.current.forEach((letter, index) => {
        if (!letter) return;
        // El desfase es mínimo: se percibe el abanico arriba/abajo, pero la
        // frase se vuelve legible casi desde que entra en pantalla.
        const start = 0.015 + (index % 5) * 0.004;
        const entrance = easeOut(clamp((value - start) / 0.10));
        const direction = index % 2 === 0 ? -1 : 1;
        const distance = 120 * (1 - entrance);
        const rotation = direction * 8 * (1 - entrance);
        // Cuando ya llegaron, conservan una ola suave durante todo el trayecto.
        // Eso mantiene el efecto vivo sin separar la frase ni hacerla ilegible.
        const wave = Math.sin(value * Math.PI * 8 + index * 0.82) * 15;
        const waveTilt = Math.sin(value * Math.PI * 8 + index * 0.82) * 2.2;
        letter.style.transform = `translate3d(0, ${direction * distance + wave}px, 0) rotate(${rotation + waveTilt}deg)`;
        letter.style.opacity = String(0.65 + entrance * 0.35);
        letter.style.filter = `blur(${(3 * (1 - entrance)).toFixed(1)}px)`;
      });

      const line = easeOut(clamp((value - 0.74) / 0.16));
      if (underlineRef.current) underlineRef.current.style.transform = `scaleX(${line})`;

      const cta = easeOut(clamp((value - 0.82) / 0.14));
      if (ctaRef.current) {
        ctaRef.current.style.opacity = String(cta);
        ctaRef.current.style.transform = `translateY(${18 * (1 - cta)}px)`;
      }
    };

    if (reducedMotion) {
      render(1);
      return;
    }

    const tick = () => {
      render(progress());
      if (active) frame = requestAnimationFrame(tick);
    };

    const onResize = () => render(progress());

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !active) {
        active = true;
        frame = requestAnimationFrame(tick);
      } else if (!entry.isIntersecting && active) {
        active = false;
        cancelAnimationFrame(frame);
      }
    }, { rootMargin: "50% 0px 50% 0px" });

    observer.observe(wrapper);
    render(progress());
    window.addEventListener("resize", onResize);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <section ref={wrapperRef} className="futuro-reveal">
      <div className="futuro-reveal__pin">
        <div className="futuro-reveal__bg" aria-hidden="true">
          <span className="futuro-reveal__blob futuro-reveal__blob--a" />
          <span className="futuro-reveal__blob futuro-reveal__blob--b" />
          <span className="futuro-reveal__blob futuro-reveal__blob--c" />
          <span className="futuro-reveal__vignette" />
        </div>

        <div className="futuro-reveal__content">
          <p className="futuro-reveal__eyebrow"><span className="futuro-reveal__eyebrow-dot" />Tecnologías de la Información e Innovación Digital</p>
          <h2 className="futuro-reveal__sr-only">{PHRASE}</h2>

          <div className="futuro-reveal__marquee" aria-hidden="true">
            <div className="futuro-reveal__track" ref={trackRef}>
              {LETTERS.map((letter, index) => (
                <span
                  className={letter === " " ? "futuro-reveal__letter futuro-reveal__letter--space" : "futuro-reveal__letter"}
                  key={`${letter}-${index}`}
                  ref={(element) => { letterRefs.current[index] = element; }}
                >
                  {letter === " " ? "\u00A0" : letter}
                </span>
              ))}
            </div>
          </div>

          <span className="futuro-reveal__underline" ref={underlineRef} />

        </div>

        {/* NUEVO: velo negro que conecta con la salida del Hero y se destapa
            en cuanto arranca el scroll dentro de esta sección "pineada". */}
        <div className="futuro-reveal__entry-veil" ref={entryVeilRef} aria-hidden="true" />
      </div>
    </section>
  );
}