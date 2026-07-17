// src/components/cards/CuatrimestreAccordion.tsx
import { useState } from "react";
import type { Cuatrimestre, Materia } from "../../data/careerDetails";

interface CuatrimestreAccordionProps {
  cuatrimestre: Cuatrimestre;
}

export default function CuatrimestreAccordion({
  cuatrimestre,
}: CuatrimestreAccordionProps) {
  const primeraClave = cuatrimestre.materias.find((m) => m.clave);
  const [seleccionada, setSeleccionada] = useState<Materia | null>(
    primeraClave ?? null
  );

  return (
    <div>
      <ul className="space-y-2 mb-4">
        {cuatrimestre.materias.map((materia) => (
          <li
            key={materia.nombre}
            onClick={() => setSeleccionada(materia)}
            className={`cursor-pointer flex items-center gap-2 text-sm transition-colors ${
              seleccionada?.nombre === materia.nombre
                ? "text-dark-green-primary font-semibold"
                : "text-neutral-300 hover:text-white"
            }`}
          >
            {materia.clave && (
              <span className="w-1.5 h-1.5 rounded-full bg-dark-green-primary shrink-0" />
            )}
            {materia.nombre}
          </li>
        ))}
      </ul>

      {seleccionada && (
        <div
          className={`rounded-lg border p-4 ${
            seleccionada.clave
              ? "border-dark-green-primary bg-dark-green-primary/10"
              : "border-neutral-600 bg-neutral-800/40"
          }`}
        >
          {seleccionada.clave ? (
            <>
              <span className="text-xs uppercase tracking-wide text-dark-green-primary font-semibold">
                Materia Importante
              </span>
              <p className="font-bold mt-1">{seleccionada.nombre}</p>
              <p className="text-sm text-neutral-300 mt-1">
                {seleccionada.descripcion}
              </p>
            </>
          ) : (
            <>
              <span className="text-xs uppercase tracking-wide text-neutral-400">
                No es una materia clave
              </span>
              <p className="font-bold mt-1">{seleccionada.nombre}</p>
              <p className="text-sm text-neutral-400 mt-1">
                Es parte de la formación general, sin impacto directo en el
                perfil técnico de esta carrera.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}