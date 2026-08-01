"use client";

import { useEffect, useRef } from "react";
import "./Hero.css";

/**
 * Hero — Tecnologías de la Información e Innovación Digital
 * Universidad Tecnológica de Tlaxcala
 *
 * El fondo (un degradado tipo "circuito digital") está cubierto por una capa
 * oscura. Al mover el cursor (o el dedo, en táctil) se "pinta"/destapa el
 * arte de abajo con la forma irregular de un trapo/brocha —no un círculo—
 * dejando un rastro que se vuelve a cubrir lentamente con el tiempo.
 */

// Puntos fijos (semilla) que definen el contorno irregular del "trapo".
// Un polígono de radios variables da la silueta de tela arrugada en vez
// de un círculo perfecto.
const RAG_POINTS = [

1.45,
0.92,
1.38,
0.62,
1.62,
0.84,
1.28,
0.58,
1.74,
0.78,
1.18,
0.65,
1.44,
0.96,
0.58,
1.56,
0.76,
1.30,
0.60,
1.68,
0.82,
1.24,
0.64,
1.48,
0.88,
1.36,
0.56,
1.60

];

// ---- Ajustes rápidos ----
// Tamaño del trapo principal (en px). Súbelo para un rastro más grande
// en ambos ejes por igual.
const BRUSH_RADIUS = 300;
// Qué tan separados están los "sellos" satélite que dan textura de tela.
// Se escalan junto con BRUSH_RADIUS para que no se vean desproporcionados.
const SATELLITE_OFFSET = 36;
// Qué tan rápido se vuelve a cubrir el rastro. Más alto = se tapa más
// rápido. Más bajo = el rastro dura más tiempo destapado.
const COVER_SPEED = 0.028;

// Proporción de la mancha respecto al radio base (BRUSH_RADIUS).
// 1 = círculo perfecto en ese eje. Súbelo para estirar ese eje,
// bájalo para achatarlo.
const BLOB_SCALE_X = 1.20; // más alto = mancha más larga/ancha
const BLOB_SCALE_Y = 1.20; // más alto = mancha más alta

// Cantidad de puntos que forman la mancha.
// Entre más puntos, más suave se verá.
const BLOB_POINTS = 80;

// Qué tan rápido se suaviza el ÁNGULO de rotación del trapo (0-1).
// Más bajo = giro más suave pero con más "delay". Más alto = responde
// más rápido pero puede volver a temblar un poco.
const ANGLE_SMOOTHING = 0.12;
// Distancia mínima (px) entre dos posiciones del puntero para considerar
// que hay un movimiento "real" y actualizar el ángulo objetivo. Filtra
// el ruido de microtemblores del mouse/dedo que antes hacía vibrar el
// contorno del trapo.
const ANGLE_MOVE_THRESHOLD = 4;

/**
 * Genera una mancha orgánica que cambia ligeramente con el tiempo.
 */
function getBlobPoints(radius: number, time: number) {
  const points: { x: number; y: number }[] = [];

  for (let i = 0; i < BLOB_POINTS; i++) {

    const angle = (Math.PI * 2 * i) / BLOB_POINTS;

    // Velocidades y amplitudes reducidas respecto a la versión original:
    // el contorno sigue "respirando" (textura de tela) pero más despacio
    // y con menos fuerza, para que no compita visualmente con el
    // suavizado del ángulo de rotación y se perciba como vibración.
    const wave1 = Math.sin(angle * 3 + time * 0.0006);
    const wave2 = Math.sin(angle * 7 - time * 0.0010);
    const wave3 = Math.cos(angle * 11 + time * 0.0005);


    const irregularity =
      wave1 * 25 +
      wave2 * 15 +
      wave3 * 10;


    const r = radius + irregularity;


    points.push({
      x: Math.cos(angle) * r * BLOB_SCALE_X,
      y: Math.sin(angle) * r * BLOB_SCALE_Y,
    });
  }


  return points;
}

/**
 * Dibuja una mancha usando curvas Bézier.
 */
function buildRagPath(
  ctx: CanvasRenderingContext2D,
  radius: number,
  time: number
) {
  const pts = getBlobPoints(radius, time);

  ctx.beginPath();

  for (let i = 0; i < pts.length; i++) {
    const current = pts[i];
    const next = pts[(i + 1) % pts.length];

    const mx = (current.x + next.x) / 2;
    const my = (current.y + next.y) / 2;

    if (i === 0) {
      ctx.moveTo(mx, my);
    }

    ctx.quadraticCurveTo(
      current.x,
      current.y,
      mx,
      my
    );
  }

  ctx.closePath();
}

function drawBlob(
  ctx: CanvasRenderingContext2D,
  pts: { x: number; y: number }[]
) {
  ctx.beginPath();

  for (let i = 0; i < pts.length; i++) {
    const current = pts[i];
    const next = pts[(i + 1) % pts.length];

    const mx = (current.x + next.x) / 2;
    const my = (current.y + next.y) / 2;

    if (i === 0) {
      ctx.moveTo(mx, my);
    }

    ctx.quadraticCurveTo(
      current.x,
      current.y,
      mx,
      my
    );
  }

  ctx.closePath();
}

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);
  const pointer = useRef({ x: -9999, y: -9999, active: false });
  const smoothPointer = useRef({ x: -9999, y: -9999 });
  const lastPointer = useRef({ x: -9999, y: -9999 });
  const angle = useRef(0);
  // Ángulo ya suavizado que realmente se usa para rotar el trapo.
  const smoothAngle = useRef(0);
  const hasAngle = useRef(false);
  const introStarted = useRef(false);
  const introFinished = useRef(false);
  const introProgress = useRef(0);
  const introPhase = useRef<"expand" | "close" | "done">("expand");

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // =======================
// Textura de ruido
// =======================
const noiseCanvas = document.createElement("canvas");
noiseCanvas.width = 180;
noiseCanvas.height = 180;

const noiseCtx = noiseCanvas.getContext("2d")!;

const image = noiseCtx.createImageData(
  noiseCanvas.width,
  noiseCanvas.height
);

for (let i = 0; i < image.data.length; i += 4) {

  const value = Math.random() * 120;

  image.data[i] = value;
  image.data[i + 1] = value;
  image.data[i + 2] = value;

  image.data[i + 3] = 18;
}

noiseCtx.putImageData(image, 0, 0);

let noisePattern: CanvasPattern | null = null;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let raf = 0;
    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const drawTexture = () => {

    ctx.globalCompositeOperation = "source-over";

    // Negro
    ctx.fillStyle = "#050505";
    ctx.fillRect(0,0,width,height);

    // Ruido
    if(noisePattern){

        ctx.globalAlpha = 0.5;

        ctx.fillStyle = noisePattern;
        ctx.fillRect(0,0,width,height);

        ctx.globalAlpha = 1;

    }

    // Líneas
    ctx.strokeStyle = "rgba(255,255,255,.06)";
    ctx.lineWidth = 1;

    for(let x=0;x<width;x+=3){

        ctx.beginPath();
        ctx.moveTo(x,0);
        ctx.lineTo(x,height);
        ctx.stroke();

    }

    // Viñeta
    const vignette = ctx.createRadialGradient(
        width/2,
        height/2,
        0,
        width/2,
        height/2,
        Math.max(width,height)
    );

    vignette.addColorStop(0,"rgba(0,0,0,0)");
    vignette.addColorStop(1,"rgba(0,0,0,.95)");

    ctx.fillStyle = vignette;
    ctx.fillRect(0,0,width,height);

};

const cover = (opacity = 1)=>{

    ctx.save();

    ctx.globalAlpha = opacity;

    drawTexture();

    ctx.restore();

}



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
      cover(1);
    };

    resize();
    
    window.addEventListener("resize", resize);

    if (prefersReducedMotion) {
      // Sin animación: se muestra una revelación parcial estática y accesible.
      ctx.globalCompositeOperation = "destination-out";
      const grad = ctx.createRadialGradient(
        width * 0.5,
        height * 0.42,
        0,
        width * 0.5,
        height * 0.42,
        Math.max(width, height) * 0.55
      );
      grad.addColorStop(0, "rgba(0,0,0,0.9)");
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
      return () => window.removeEventListener("resize", resize);
    }

    const onMove = (clientX: number, clientY: number) => {
      const rect = section.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      lastPointer.current = { ...pointer.current };
      pointer.current = { x, y, active: true };
      const dx = x - lastPointer.current.x;
      const dy = y - lastPointer.current.y;
      // Solo actualizamos el ángulo OBJETIVO si el movimiento es real,
      // para ignorar el ruido de microtemblores del mouse/dedo (antes
      // esto se disparaba con cualquier delta > 0.5px y hacía vibrar
      // el contorno del trapo). El giro real hacia este objetivo se
      // suaviza más abajo, en el loop de animación.
      if (Math.hypot(dx, dy) > ANGLE_MOVE_THRESHOLD) {
        angle.current = Math.atan2(dy, dx);
      }
    };

    const onPointerMove = (e: PointerEvent) => onMove(e.clientX, e.clientY);
    const onPointerLeave = () => {
      pointer.current.active = false;
    };

    section.addEventListener("pointermove", onPointerMove, { passive: true });
    section.addEventListener("pointerleave", onPointerLeave);
    section.addEventListener("pointerdown", onPointerMove);

    const stamp = (
  x:number,
  y:number,
  rot:number,
  radius:number
)=>{
  const time = performance.now();
  const blob = getBlobPoints(radius, time);

  ctx.save();


  ctx.translate(x,y);
  ctx.rotate(rot);


  ctx.globalCompositeOperation="destination-out";


  // capa exterior: mezcla con el negro
  drawBlob(ctx, blob);


  const outer = ctx.createRadialGradient(
    0,
    0,
    radius * .35,
    0,
    0,
    radius * 1.35
  );


  outer.addColorStop(
    0,
    "rgba(0,0,0,0.9)"
  );


  outer.addColorStop(
    .55,
    "rgba(0,0,0,0.55)"
  );


  outer.addColorStop(
    .8,
    "rgba(0,0,0,0.15)"
  );


  outer.addColorStop(
    1,
    "rgba(0,0,0,0)"
  );


  ctx.fillStyle = outer;
  ctx.fill();



  // núcleo donde se revela completamente

  drawBlob(ctx, blob);


  const inner = ctx.createRadialGradient(
    0,
    0,
    0,
    0,
    0,
    radius
  );


  inner.addColorStop(
    0,
    "rgba(0,0,0,1)"
  );


  inner.addColorStop(
    .75,
    "rgba(0,0,0,.95)"
  );


  inner.addColorStop(
    1,
    "rgba(0,0,0,.25)"
  );


  ctx.fillStyle = inner;
  ctx.fill();


  ctx.restore();

};

// Dibujamos la mancha inicial
// Inicio de animación cinematográfica

cover(1);

introProgress.current = 0;
introPhase.current = "expand";


const tick = () => {

    // =========================
  // INTRO ANIMADA
  // =========================

  if(!introFinished.current){

      const speed = 0.05;


      if(introPhase.current === "expand"){

    if(!introStarted.current){
        cover(1);
        introStarted.current = true;
    }

    introProgress.current += speed;


    // limpiar y volver a pintar negro


    const radius =
      BRUSH_RADIUS +
      introProgress.current * Math.max(width,height);


    stamp(
      width * 0.90,
      height * 0.95,
      0,
      radius
    );


          if(introProgress.current >= 1){

            introPhase.current="close";
            introProgress.current=1;

          }


      }


      else if(introPhase.current === "close"){


          introProgress.current -= speed;


          cover(1);


          const radius =
            BRUSH_RADIUS +
            introProgress.current * Math.max(width,height);


          stamp(
            width * 0.90,
            height * 0.95,
            0,
            radius
          );


          if(introProgress.current <= 0){


            introFinished.current=true;


            cover(1);


            stamp(
              width * 0.70,
              height * 0.55,
              0,
              BRUSH_RADIUS * 0.9
            );

          }

      }

  }

if (introFinished.current && pointer.current.active) {
    cover(1);
}


  if (pointer.current.active) {
        if (smoothPointer.current.x === -9999) {
            smoothPointer.current.x = pointer.current.x;
            smoothPointer.current.y = pointer.current.y;
          }

          smoothPointer.current.x +=
            (pointer.current.x - smoothPointer.current.x) * 0.18;

          smoothPointer.current.y +=
            (pointer.current.y - smoothPointer.current.y) * 0.18;

          const x = smoothPointer.current.x;
          const y = smoothPointer.current.y;

        // Suavizado del ÁNGULO por el camino más corto (evita que dé la
        // vuelta larga al cruzar de +π a -π) y con paso pequeño, igual
        // que ya se hace con la posición. Esto es lo que elimina el
        // temblor/vibración del contorno del trapo al moverse.
        if (!hasAngle.current) {
          smoothAngle.current = angle.current;
          hasAngle.current = true;
        }
        let angleDiff = angle.current - smoothAngle.current;
        angleDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));
        smoothAngle.current += angleDiff * ANGLE_SMOOTHING;

        // Varios sellos superpuestos, ligeramente desplazados, para dar
        // textura de trapo/tela en vez de una sola forma limpia.
        stamp(x, y, smoothAngle.current, BRUSH_RADIUS);
        // stamp(
        //   x + Math.cos(angle.current + 1.7) * SATELLITE_OFFSET,
        //   y + Math.sin(angle.current + 1.7) * SATELLITE_OFFSET,
        //   angle.current + 0.4,
        //   BRUSH_RADIUS * 0.68
        // );
        // stamp(
        //   x - Math.cos(angle.current + 1.7) * (SATELLITE_OFFSET * 1.15),
        //   y - Math.sin(angle.current + 1.7) * (SATELLITE_OFFSET * 1.15),
        //   angle.current - 0.3,
        //   BRUSH_RADIUS * 0.59
        // );
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      section.removeEventListener("pointermove", onPointerMove);
      section.removeEventListener("pointerleave", onPointerLeave);
      section.removeEventListener("pointerdown", onPointerMove);
    };
  }, []);

  return (
    <section className="hero" ref={sectionRef}>
      <div className="hero__art" aria-hidden="true">
        <video
          className="hero__art-video"
          src="/tecnologia.mp4"
          poster="/videos/hero-carrera-poster.jpg"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
        />
        {/* Ligero velo de color para que el video combine con la paleta
            del resto del sitio. Súbele o bájale la opacidad en hero.css. */}
        <div className="hero__art-tint" />
      </div>

      <canvas ref={canvasRef} className="hero__canvas" />

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
            <span className="hero__title-row"></span>
              <span className="thin-tech">Tecnologías</span>
            <span className="hero__title-row">
              <span className="fill size color">de la</span>
              <span className="fill size">Información</span>
              </span>
            <span className="hero__title-row row-1">
              <span className="thin diference">e</span>
              <span className="fill accent underline diference">Innovación</span></span>
            <span className="hero__title-row row-2">
              <span className="fill thin-2">Digital</span>
            </span>
          </h1>

          {/* <p className="hero__accent-line">
            Redes · Software · Entornos Virtuales
          </p> */}
        </div>

        <div className="hero__footer">
          <div className="hero__footer-left">
            {/* <p className="hero__subtitle">
              Formamos talento capaz de diseñar, programar y transfrmar
              procesos con software, datos e inteligencia artificial.
            </p> */}
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
              <span className="hero__scroll-line" />
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