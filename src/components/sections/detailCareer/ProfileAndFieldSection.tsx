// src/components/sections/detail/ProfileAndFieldSection.tsx
import { Check } from "lucide-react";
import JobCard from "../../cards/JobCard";

interface ProfileAndFieldSectionProps {
  perfilIngreso?: string[];
  perfilEgreso: string[];
  campoLaboral: { icon: string; titulo: string; desc: string }[];
}

export default function ProfileAndFieldSection({
  perfilIngreso,
  perfilEgreso,
  campoLaboral,
}: ProfileAndFieldSectionProps) {
  return (
    <section className="py-24 px-6 md:px-16 grid grid-cols-1 md:grid-cols-2 gap-16">
      {/* Columna izquierda: Perfil de Ingreso + Perfil de Egreso */}
      <div>
        {perfilIngreso && (
          <div className="mb-12">
            <h2 className="font-serif text-4xl mb-8">Perfil de Ingreso</h2>

            <ul className="flex flex-col gap-4">
              {perfilIngreso.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full border border-dark-orange-primary flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={12} className="text-dark-orange-primary" />
                  </span>
                  <span className="text-sm text-neutral-200">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <h2 className="font-serif text-4xl mb-8">Perfil de Egreso</h2>

        <ul className="flex flex-col gap-4 mb-8">
          {perfilEgreso.map((item) => (
            <li key={item} className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full border border-dark-green-primary flex items-center justify-center shrink-0 mt-0.5">
                <Check size={12} className="text-dark-green-primary" />
              </span>
              <span className="text-sm text-neutral-200">{item}</span>
            </li>
          ))}
        </ul>

        <p className="italic text-neutral-400 border-l-2 border-dark-orange-primary pl-4">
          "Nuestros graduados no solo dominan lenguajes de programación;
          dominan el arte de resolver problemas mediante arquitectura lógica y
          diseño eficiente."
        </p>
      </div>

      {/* Columna derecha: Campo Laboral */}
      <div>
        <h2 className="font-serif text-4xl mb-8">Campo Laboral</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {campoLaboral.map((job) => (
            <JobCard key={job.titulo} {...job} />
          ))}
        </div>
      </div>
    </section>
  );
}