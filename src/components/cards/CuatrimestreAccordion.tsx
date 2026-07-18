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
                ? "text-light-green-primary font-semibold"
                : "text-light-text-muted hover:text-light-green-primary"
            }`}
          >
            {materia.clave && (
              <span className="w-1.5 h-1.5 rounded-full bg-light-green-primary shrink-0" />
            )}
            {materia.nombre}
          </li>
        ))}
      </ul>

      {seleccionada && (
        <div
          className={`rounded-lg border p-4 ${
            seleccionada.clave
              ? "border-light-green-primary bg-light-green-primary/10"
              : "border-light-border bg-light-border/30"
          }`}
        >
          {seleccionada.clave ? (
            <>
              <span className="text-xs uppercase tracking-wide text-light-green-primary font-semibold">
                Materia Importante
              </span>
              <p className="font-bold mt-1 text-light-text">
                {seleccionada.nombre}
              </p>
              <p className="text-sm text-light-text-muted mt-1">
                {seleccionada.descripcion}
              </p>
            </>
          ) : (
            <>
              <span className="text-xs uppercase tracking-wide text-light-text-muted">
                Materia de Formación General
              </span>
              <p className="font-bold mt-1 text-light-text">
                {seleccionada.nombre}
              </p>
              <p className="text-sm text-light-text-muted mt-1">
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