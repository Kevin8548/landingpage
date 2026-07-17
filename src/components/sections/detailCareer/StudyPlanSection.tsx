// src/components/sections/detail/StudyPlanSection.tsx
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { Cuatrimestre } from "../../../data/careerDetails";
import CuatrimestreAccordion from "../../cards/CuatrimestreAccordion";

interface StudyPlanSectionProps {
  cuatrimestres: Cuatrimestre[];
  metodologia: { titulo: string; texto: string };
  continuacionDesde?: number; // índice donde empieza Ingeniería en TI
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

  return (
    <section className="py-24 px-6 md:px-16">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-12">
        <div>
          <h2 className="font-serif text-4xl mb-4">Plan de Estudios</h2>
          <p className="text-neutral-400 mb-8">
            Una ruta académica diseñada para llevarte desde la lógica básica
            hasta la ingeniería...
          </p>

          <div className="border border-dark-orange-primary rounded-lg p-6">
            <h3 className="font-serif text-xl text-dark-orange-primary mb-2">
              {metodologia.titulo}
            </h3>
            <p className="text-sm text-neutral-300">{metodologia.texto}</p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {cuatrimestres.map((cuatrimestre, index) => (
            <div key={cuatrimestre.numero}>
              {/* Separador antes del primer cuatrimestre de Ingeniería en TI */}
              {continuacionDesde === index && (
                <div className="flex items-center gap-4 my-6">
                  <div className="h-px flex-1 bg-dark-green-primary/40" />
                  <span className="text-xs uppercase tracking-widest text-dark-green-primary">
                    Continúa con Ingeniería en TI
                  </span>
                  <div className="h-px flex-1 bg-dark-green-primary/40" />
                </div>
              )}

              <div className="border border-neutral-700 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggle(cuatrimestre.numero)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <div className="flex items-center gap-4">
                    <span className="font-serif italic text-2xl text-dark-green-primary">
                      {String(cuatrimestre.numero).padStart(2, "0")}
                    </span>
                    <div>
                      <p className="font-bold uppercase tracking-wide">
                        Cuatrimestre {cuatrimestre.numero}
                      </p>
                      <p className="text-xs text-neutral-400 uppercase">
                        {cuatrimestre.nivel}
                      </p>
                    </div>
                  </div>
                  <ChevronDown
                    className={`transition-transform ${
                      abierto === cuatrimestre.numero ? "rotate-180" : ""
                    }`}
                    size={20}
                  />
                </button>

                {abierto === cuatrimestre.numero && (
                  <div className="px-5 pb-5">
                    <CuatrimestreAccordion cuatrimestre={cuatrimestre} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}