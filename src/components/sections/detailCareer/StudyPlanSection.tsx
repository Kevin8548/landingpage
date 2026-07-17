// src/components/sections/detail/StudyPlanSection.tsx
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { Cuatrimestre } from "../../../data/careerDetails";
import CuatrimestreAccordion from "../../cards/CuatrimestreAccordion";
import MilestoneCard from "./MilestoneCard";

interface StudyPlanSectionProps {
  cuatrimestres: Cuatrimestre[];
  metodologia: { titulo: string; texto: string };
  continuacionDesde?: number;
}

function TrackList({
  items,
  abierto,
  toggle,
}: {
  items: Cuatrimestre[];
  abierto: number | null;
  toggle: (n: number) => void;
}) {
  return (
    <div className="flex flex-col">
      {items.map((cuatrimestre, index) => {
        const isOpen = abierto === cuatrimestre.numero;
        const isLast = index === items.length - 1;

        return (
          <div key={cuatrimestre.numero} className="flex gap-4">
            <div className="flex flex-col items-center w-9 shrink-0">
              <button
                onClick={() => toggle(cuatrimestre.numero)}
                aria-expanded={isOpen}
                className={`flex items-center justify-center w-9 h-9 rounded-full border font-serif italic text-sm shrink-0 transition-colors duration-200 ${
                  isOpen
                    ? "bg-light-green-primary border-light-green-primary text-white"
                    : "border-light-border text-light-green-primary"
                }`}
              >
                {String(cuatrimestre.numero).padStart(2, "0")}
              </button>
              {!isLast && (
                <div
                  className={`w-px flex-1 min-h-[0.75rem] transition-colors duration-200 ${
                    isOpen ? "bg-light-green-primary/50" : "bg-light-border"
                  }`}
                />
              )}
            </div>

            <div
              className={`flex-1 mb-3 rounded-lg transition-colors duration-200 ${
                isOpen
                  ? "bg-light-green-primary/5 border border-light-green-primary/30"
                  : "border-b border-light-border"
              }`}
            >
              <button
                onClick={() => toggle(cuatrimestre.numero)}
                className="w-full flex items-center justify-between px-4 py-3 text-left"
              >
                <div>
                  <p className="font-bold text-sm uppercase tracking-wide text-light-text">
                    Cuatrimestre {cuatrimestre.numero}
                  </p>
                  <p className="text-[11px] uppercase tracking-wide text-light-text-muted">
                    {cuatrimestre.nivel}
                  </p>
                </div>
                <ChevronDown
                  className={`transition-transform duration-200 shrink-0 ${
                    isOpen ? "rotate-180 text-light-green-primary" : "text-light-text-muted"
                  }`}
                  size={16}
                />
              </button>

              {isOpen && (
                <div className="px-4 pb-4">
                  <CuatrimestreAccordion cuatrimestre={cuatrimestre} />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function StudyPlanSection({
  cuatrimestres,
  metodologia,
  continuacionDesde,
}: StudyPlanSectionProps) {
  const [abierto, setAbierto] = useState<number | null>(
    cuatrimestres[0]?.numero ?? null
  );

  const toggle = (numero: number) => {
    setAbierto((actual) => (actual === numero ? null : numero));
  };

  const primerTramo =
    continuacionDesde !== undefined
      ? cuatrimestres.slice(0, continuacionDesde)
      : cuatrimestres;
  const segundoTramo =
    continuacionDesde !== undefined
      ? cuatrimestres.slice(continuacionDesde)
      : [];

  return (
    <section className="py-16 px-6 md:px-16 bg-light-bg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-10">
        {/* Columna izquierda: TSU */}
        <div>
          <p className="text-xs uppercase tracking-widest text-light-text-muted mb-4">
            TSU — 1 a {primerTramo.length}
          </p>
          <TrackList items={primerTramo} abierto={abierto} toggle={toggle} />
        </div>

        {/* Columna derecha: header + metodología + hito + TI */}
        <div>
          <span className="block text-xs uppercase tracking-[0.2em] text-light-green-primary mb-2">
            Ruta académica
          </span>
          <h2 className="font-serif text-4xl mb-2 text-light-text">
            Plan de Estudios
          </h2>
          <p className="text-light-text-muted mb-6 max-w-md">
            Una ruta académica diseñada para llevarte desde la lógica básica
            hasta la ingeniería...
          </p>

          <div className="flex items-start gap-4 border-l-2 border-light-orange-primary pl-4 mb-10">
            <div>
              <h3 className="font-serif text-base text-light-orange-primary mb-1">
                {metodologia.titulo}
              </h3>
              <p className="text-xs text-light-text-muted leading-relaxed">
                {metodologia.texto}
              </p>
            </div>
          </div>

          {segundoTramo.length > 0 && (
            <div className="flex flex-col">
              <MilestoneCard
                titulo="Ingeniería en TIID"
                descripcion="sistemas inteligentes e infraestructura"
                desde={segundoTramo[0].numero}
                hasta={segundoTramo[segundoTramo.length - 1].numero}
              />
              <TrackList
                items={segundoTramo}
                abierto={abierto}
                toggle={toggle}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}