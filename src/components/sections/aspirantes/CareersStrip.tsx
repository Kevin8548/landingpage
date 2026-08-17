import { FiChevronRight } from "react-icons/fi";
import { CAREERS } from "../../../data/aspirantes";

export const CareersStrip = () => {
  return (
    <div className="relative bg-[var(--bg)] border-y border-[var(--line)]">
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[var(--line)]">
        {CAREERS.map(
          ({ id, name, shortName, img, iconBg, border, bg, text, path }) => (
            <div
              key={id}
              className="flex flex-col items-center text-center gap-4 py-10 px-6 h-full"
            >
              <div
                className={`shrink-0 w-36 aspect-[4/3] rounded-2xl flex items-center justify-center shadow-lg shadow-black/20 p-3 ${iconBg}`}
              >
                <img src={img} alt={name} className="w-full h-full object-contain" />
              </div>
              <div className="flex items-center justify-center min-h-[3.5rem] md:min-h-[3.25rem]">
                <span className="font-display text-sm md:text-base font-medium text-[var(--ink)] leading-snug max-w-[240px]">
                  {name}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  // TODO: CONEXIÓN PENDIENTE — aún no hay routing conectado.
                  // Cuando exista, navegar a `path` (por ejemplo con react-router: navigate(path))
                  console.log("Ir a carrera (pendiente de conectar):", path);
                }}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full border text-xs font-data uppercase tracking-wider font-medium transition-opacity hover:opacity-80 ${border} ${bg} ${text}`}
              >
                {shortName}
                <FiChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
};