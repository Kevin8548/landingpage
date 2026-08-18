import { useEffect, useRef, useState } from "react";
import { FiCalendar, FiChevronDown, FiEye, FiUsers } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

interface PreviewMenuProps {
  className?: string;
}

// Botón "Previsualizar": al hacer click pregunta a cuál sección ir
// (Eventos o Aspirantes) y navega ahí en la MISMA pestaña — sin
// window.open, para no romper el flujo de navegación del admin.
export default function PreviewMenu({ className }: PreviewMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const goTo = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <div ref={containerRef} className={`relative inline-block ${className ?? ""}`}>
      <style>{`
        .preview-menu-font { font-family: "JetBrains Mono", monospace; }
      `}</style>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        className="preview-menu-font inline-flex items-center gap-1.5 rounded-full border border-[var(--line)] px-3 py-1.5 text-[11px] uppercase tracking-wide text-[var(--ink)] transition-colors hover:border-[var(--ink)]/40"
      >
        <FiEye className="h-3.5 w-3.5" />
        Previsualizar
        <FiChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="preview-menu-font absolute right-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--bg)] shadow-xl">
          <button
            type="button"
            onClick={() => goTo("/eventos")}
            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs uppercase tracking-wide text-[var(--ink)] transition-colors hover:bg-[var(--ink)]/5"
          >
            <FiCalendar className="h-3.5 w-3.5" /> Eventos
          </button>
          <button
            type="button"
            onClick={() => goTo("/aspirantes")}
            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs uppercase tracking-wide text-[var(--ink)] transition-colors hover:bg-[var(--ink)]/5"
          >
            <FiUsers className="h-3.5 w-3.5" /> Aspirantes
          </button>
        </div>
      )}
    </div>
  );
}