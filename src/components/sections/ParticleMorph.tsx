"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

type Pt = [number, number, number];

const rnd = Math.random;
const gauss = () => rnd() + rnd() + rnd() - 1.5;

/* Orden = el mismo de TERMINAL_SLIDES: software, redes, entornos */
function buildShapes(count: number): Float32Array[] {
  const fill = (fn: () => Pt) => {
    const a = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const v = fn();
      a[i * 3] = v[0];
      a[i * 3 + 1] = v[1];
      a[i * 3 + 2] = v[2];
    }
    return a;
  };

  // Nodos de la red sobre una esfera de Fibonacci + 3 vecinos más cercanos
  const nodes: Pt[] = [];
  const edges: [number, number][] = [];
  for (let i = 0; i < 64; i++) {
    const y = 1 - (2 * (i + 0.5)) / 64;
    const r = Math.sqrt(1 - y * y);
    const th = i * 2.39996;
    nodes.push([Math.cos(th) * r * 2.1, y * 2.1, Math.sin(th) * r * 2.1]);
  }
  nodes.forEach((a, i) => {
    nodes
      .map((b, j) => ({ j, d: Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) }))
      .filter((x) => x.j !== i)
      .sort((x, y) => x.d - y.d)
      .slice(0, 3)
      .forEach((x) => edges.push([i, x.j]));
  });

  // SOFTWARE: nudo toroidal (2,3)
  const knot = fill(() => {
    const u = rnd() * 6.2832;
    const r = Math.cos(3 * u) + 2;
    const j = 0.34;
    return [
      (r * Math.cos(2 * u) + gauss() * j) * 0.78,
      (r * Math.sin(2 * u) + gauss() * j) * 0.78,
      (-Math.sin(3 * u) + gauss() * j) * 0.78,
    ];
  });

  // REDES: grafo de nodos y aristas
  const network = fill(() => {
    if (rnd() < 0.3) {
      const n = nodes[(rnd() * 64) | 0];
      return [n[0] + gauss() * 0.16, n[1] + gauss() * 0.16, n[2] + gauss() * 0.16];
    }
    const e = edges[(rnd() * edges.length) | 0];
    const a = nodes[e[0]];
    const b = nodes[e[1]];
    const t = rnd();
    return [
      a[0] + (b[0] - a[0]) * t + gauss() * 0.03,
      a[1] + (b[1] - a[1]) * t + gauss() * 0.03,
      a[2] + (b[2] - a[2]) * t + gauss() * 0.03,
    ];
  });

  // ENTORNOS VIRTUALES: cubo dentro de otro cubo
  const cube = fill(() => {
    const h = (rnd() < 0.3 ? 0.55 : 1) * 1.6;
    const v: Pt = [(rnd() * 2 - 1) * h, (rnd() * 2 - 1) * h, (rnd() * 2 - 1) * h];
    const ax = (rnd() * 3) | 0;
    const ay = (ax + 1) % 3;
    const az = (ax + 2) % 3;
    const sg = rnd() < 0.5 ? -h : h;
    if (rnd() < 0.6) {
      v[ay] = sg;
      v[az] = rnd() < 0.5 ? -h : h;
    } else {
      v[ax] = sg;
    }
    return v;
  });

  return [knot, network, cube];
}

const VERTEX = /* glsl */ `
attribute vec3 aB;
attribute vec4 aR;
uniform float uTime, uMix, uIntro, uAspect, uPx, uClickT;
uniform vec2 uMouse, uClick;
varying float vC, vG;
void main(){
  float t = smoothstep(0., 1., uMix);
  float s = sin(t * 3.14159);
  vec3 p = mix(position, aB, t);
  float a = s * aR.x * 3.;
  p.xz = mat2(cos(a), -sin(a), sin(a), cos(a)) * p.xz;
  p += normalize(p + 1e-4) * s * aR.y * 1.4;
  p += .04 * vec3(sin(uTime*aR.z*2.+aR.w*6.28), cos(uTime*aR.w*2.+aR.z*6.28), sin(uTime*aR.y+aR.x*6.28));
  float ie = 1. - pow(1. - clamp(uIntro*1.2 - aR.w*.2, 0., 1.), 3.);
  vec3 sc = normalize(vec3(aR.x-.5, aR.y-.5, aR.z-.5) + 1e-3) * (6. + aR.w*5.);
  p = mix(sc, p, ie);
  vec4 mv = modelViewMatrix * vec4(p, 1.);
  vec4 cl = projectionMatrix * mv;
  vec2 nd = cl.xy / cl.w;
  vec2 ax = vec2(uAspect, 1.);
  vec2 d = (nd - uMouse) * ax;
  float f = 1. - smoothstep(0., .23, length(d));
  vec2 push = normalize(d + 1e-5) / ax * f * .085;
  vec2 dc = (nd - uClick) * ax;
  float rg = length(dc) - uClickT * 1.4;
  float w = exp(-rg*rg*40.) * exp(-uClickT*1.3) * step(uClickT, 3.);
  push += normalize(dc + 1e-5) / ax * w * .16;
  cl.xy += push * cl.w;
  vG = f * .46 + w * 1.1;
  vC = clamp(aR.w*.6 + (p.y*.25 + .5)*.45, 0., 1.);
  gl_Position = cl;
  gl_PointSize = uPx * (1. + aR.z*1.5 + vG*.65) * (5. / -mv.z);
}`;

const FRAGMENT = /* glsl */ `
uniform vec3 uGreen;
uniform vec3 uAmber;
varying float vC, vG;
void main(){
  float d = length(gl_PointCoord - .5);
  if (d > .5) discard;
  float a = pow(1. - d*2., 2.4);
  vec3 col = mix(uGreen, uAmber, smoothstep(.6, .92, vC));
  vec3 hoverTint = vec3(.55, 1., .78);
  col = mix(col, hoverTint, min(vG * .42, .24));
  gl_FragColor = vec4(col * (.6 + vG*.22), a * .9);
}`;

/**
 * Nube de puntos que se transforma entre las tres especialidades:
 * nudo (Software) → red (Redes) → cubo anidado (Entornos Virtuales).
 * Reacciona al cursor y al clic sobre la sección .hero.
 */
export default function ParticleMorph() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const hero = canvas.closest<HTMLElement>(".hero") ?? document.body;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const count = window.innerWidth < 768 ? 5000 : 9000;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
    } catch {
      return; // sin WebGL: simplemente no se dibuja
    }
    renderer.setPixelRatio(dpr);
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 8.2;

    const shapes = buildShapes(count);
    let current = 2; // arranca en el cubo, como tu dibujo de Entornos Virtuales

    const aR = new Float32Array(count * 4);
    for (let i = 0; i < aR.length; i++) aR[i] = rnd();

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(shapes[current].slice(), 3));
    geometry.setAttribute("aB", new THREE.BufferAttribute(shapes[current].slice(), 3));
    geometry.setAttribute("aR", new THREE.BufferAttribute(aR, 4));

    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      uniforms: {
        uTime: { value: 0 },
        uMix: { value: 1 },
        uIntro: { value: reduce ? 1 : 0 },
        uAspect: { value: 1 },
        uPx: { value: dpr * 3 },
        uClickT: { value: 99 },
        uMouse: { value: new THREE.Vector2(9, 9) },
        uClick: { value: new THREE.Vector2() },
        uGreen: { value: new THREE.Color("#2ecc71") },
        uAmber: { value: new THREE.Color("#ffb703") },
      },
    });
    const u = material.uniforms;

    const points = new THREE.Points(geometry, material);
    points.frustumCulled = false;
    scene.add(points);

    /* ---- Tamaño ---- */
    const resize = () => {
      const w = canvas.clientWidth || 1;
      const h = canvas.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      u.uAspect.value = w / h;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    /* ---- Cursor y clic (se escuchan en la sección, igual que tu constelación) ---- */
    const m = { x: 0, y: 0, tx: 0, ty: 0 };
    const toNdc = (cx: number, cy: number) => {
      const r = canvas.getBoundingClientRect();
      return {
        x: ((cx - r.left) / r.width) * 2 - 1,
        y: -(((cy - r.top) / r.height) * 2 - 1),
      };
    };
    const onMove = (e: PointerEvent) => {
      const p = toNdc(e.clientX, e.clientY);
      u.uMouse.value.set(p.x, p.y);
      m.tx = Math.max(-1, Math.min(1, p.x));
      m.ty = Math.max(-1, Math.min(1, p.y));
    };
    const onLeave = () => {
      u.uMouse.value.set(9, 9);
      m.tx = 0;
      m.ty = 0;
    };
    const onDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest("button, a")) return;
      const p = toNdc(e.clientX, e.clientY);
      u.uClick.value.set(p.x, p.y);
      u.uClickT.value = 0;
    };
    hero.addEventListener("pointermove", onMove, { passive: true });
    hero.addEventListener("pointerleave", onLeave);
    hero.addEventListener("pointerdown", onDown);

    /* ---- Transformación entre figuras ---- */
    let mixing = false;
    const goTo = (next: number) => {
      if (next === current || (mixing && u.uMix.value < 0.5)) return;
      const pos = geometry.getAttribute("position") as THREE.BufferAttribute;
      const tgt = geometry.getAttribute("aB") as THREE.BufferAttribute;
      (pos.array as Float32Array).set(tgt.array as Float32Array);
      pos.needsUpdate = true;
      (tgt.array as Float32Array).set(shapes[next]);
      tgt.needsUpdate = true;
      u.uMix.value = 0;
      mixing = true;
      current = next;
    };
    const cycle = reduce ? 0 : window.setInterval(() => goTo((current + 1) % shapes.length), 5500);

    /* ---- Bucle (se pausa cuando el hero no se ve) ---- */
    let raf = 0;
    let last = performance.now();
    let visible = true;

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      u.uTime.value += dt;
      if (u.uIntro.value < 1) u.uIntro.value = Math.min(1, u.uIntro.value + dt / 2.6);
      if (mixing) {
        u.uMix.value = Math.min(1, u.uMix.value + dt / 1.8);
        if (u.uMix.value >= 1) mixing = false;
      }
      if (u.uClickT.value < 90) u.uClickT.value += dt;

      m.x += (m.tx - m.x) * 0.08;
      m.y += (m.ty - m.y) * 0.08;
      if (!reduce) points.rotation.y += dt * 0.16;
      points.rotation.x = 0.35 - m.y * 0.22;
      points.rotation.z = -m.x * 0.08;

      renderer.render(scene, camera);
      if (visible && !reduce) raf = requestAnimationFrame(frame);
    };

    if (reduce) {
      frame(performance.now());
    } else {
      raf = requestAnimationFrame(frame);
    }

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !reduce) {
        last = performance.now();
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(frame);
      }
    });
    io.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      window.clearInterval(cycle);
      io.disconnect();
      ro.disconnect();
      hero.removeEventListener("pointermove", onMove);
      hero.removeEventListener("pointerleave", onLeave);
      hero.removeEventListener("pointerdown", onDown);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className="particle-morph" aria-hidden="true" />;
}
