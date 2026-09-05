import React, { useRef } from "react";
import { ArrowLeft, Compass } from "lucide-react";
import { Link } from "react-router-dom";
import monitosUtt from "../assets/monitos-utt.webp";
import "./NotFound.css";

export default function NotFound() {
  const containerRef = useRef<HTMLElement>(null);

  // Manejador ultra-fluido del cursor interactivo
  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!containerRef.current) return;
    const { left, top } = containerRef.current.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;
    containerRef.current.style.setProperty("--mouse-x", `${x}px`);
    containerRef.current.style.setProperty("--mouse-y", `${y}px`);
  };

  return (
    <main 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="not-found-page"
    >
      {/* Grid cibernético interactivo que se ilumina con el cursor */}
      <div className="not-found-page__grid" aria-hidden="true" />
      
      {/* Orbes flotantes animados de fondo */}
      <div className="not-found-page__orb not-found-page__orb--green" aria-hidden="true" />
      <div className="not-found-page__orb not-found-page__orb--orange" aria-hidden="true" />

      <section className="not-found-content" aria-labelledby="not-found-title">
        {/* COLUMNA IZQUIERDA: TEXTO Y ACCIONES */}
        <div className="not-found-copy">
          <p className="not-found-eyebrow">
            <Compass size={17} className="not-found-eyebrow__icon" /> 
            <span>RUTA NO ENCONTRADA</span>
          </p>

          <h1 id="not-found-title">
            Parece que esta ruta se perdió en la red.
          </h1>

          <p className="not-found-description">
            La página que buscas no existe, fue movida o la dirección no es correcta.
            Regresemos a un punto conocido.
          </p>

          <div className="not-found-actions">
            <Link className="not-found-primary-action" to="/">
              <ArrowLeft size={20} /> Volver al inicio
            </Link>
            <Link className="not-found-secondary-action" to="/aspirantes">
              Información para aspirantes <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>

        {/* COLUMNA DERECHA: ILUSTRACIÓN Y PUNTOS DE RED ACTIVOS */}
        <div className="not-found-visual">
          <span className="not-found-visual__label">
            <span className="not-found-visual__ping" />
            CONEXIÓN EN BÚSQUEDA...
          </span>

          <div className="not-found-visual__frame">
            <img
              src={monitosUtt}
              alt="Ilustración de estudiantes de la Universidad Tecnológica de Tlaxcala"
            />
          </div>

        </div>
      </section>
    </main>
  );
}