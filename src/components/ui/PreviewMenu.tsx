import { useEffect, useRef, useState } from "react";
import { FiCalendar, FiChevronDown, FiCode, FiEye, FiUsers } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

interface PreviewMenuProps {
  className?: string;
}

// Botón "Previsualizar":
// al hacer click muestra las opciones Eventos y Aspirantes.
// La navegación ocurre en la misma pestaña.
export default function PreviewMenu({ className }: PreviewMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
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
    // fromDashboard: true es la bandera que RequirePreviewAccess exige
    // para dejar entrar a /eventos. Se pierde si el usuario escribe la
    // URL directo o recarga la página, así que fuerza volver a pasar
    // por aquí (o por /acceso) cada vez.
    navigate(path, { state: { fromDashboard: true } });
  };

  return (
    <div
      ref={containerRef}
      className={`relative inline-block ${className ?? ""}`}
    >
      <style>{`
        .preview-menu-font {
          font-family: "JetBrains Mono", monospace;
        }

        .preview-menu-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          min-height: 43px;
          padding: 0 16px;
          border: 1px solid var(--dash-line);
          border-radius: 10px;
          color: var(--dash-ink);
          background: transparent;
          font-family: "JetBrains Mono", monospace;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: .06em;
          text-transform: uppercase;
          cursor: pointer;
          transition:
            background-color .2s ease,
            border-color .2s ease,
            color .2s ease,
            transform .2s ease;
        }

        .preview-menu-button:hover {
          color: var(--dash-green);
          border-color: var(--dash-green);
          background: rgba(31, 121, 80, .05);
          transform: translateY(-1px);
        }

        .preview-menu-dropdown {
          position: absolute;
          right: 0;
          top: calc(100% + 8px);
          z-index: 50;
          width: 180px;
          overflow: hidden;
          border: 1px solid var(--dash-line);
          border-radius: 12px;
          background: var(--dash-bg, #fff);
          box-shadow: 0 16px 35px rgba(20, 35, 25, .16);
        }

        .preview-menu-option {
          display: flex;
          width: 100%;
          align-items: center;
          gap: 9px;
          padding: 11px 13px;
          border: 0;
          color: var(--dash-ink);
          background: transparent;
          font-family: "JetBrains Mono", monospace;
          font-size: 10px;
          letter-spacing: .05em;
          text-align: left;
          text-transform: uppercase;
          cursor: pointer;
          transition: background-color .2s ease, color .2s ease;
        }

        .preview-menu-option:hover {
          color: var(--dash-green);
          background: rgba(31, 121, 80, .07);
        }

        .preview-menu-option svg {
          flex-shrink: 0;
        }

        html.dark .preview-menu-button {
          color: var(--dash-ink);
          border-color: var(--dash-line);
          background: transparent;
        }

        html.dark .preview-menu-button:hover {
          color: var(--dash-green);
          border-color: var(--dash-green);
          background: rgba(114, 208, 142, .07);
        }

        html.dark .preview-menu-dropdown {
          background: #1b1f25;
          border-color: #3a424d;
          box-shadow: 0 18px 45px rgba(0, 0, 0, .42);
        }

        html.dark .preview-menu-option {
          color: #edf1f5;
        }

        html.dark .preview-menu-option:hover {
          color: #a6e9b7;
          background: #303842;
        }
      `}</style>

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="true"
        aria-expanded={open}
        className="preview-menu-button"
      >
        <FiEye size={15} />

        Previsualizar

        <FiChevronDown
          size={13}
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform .2s ease",
          }}
        />
      </button>

      {open && (
        <div className="preview-menu-dropdown">
          <button
            type="button"
            onClick={() => goTo("/eventos")}
            className="preview-menu-option"
          >
            <FiCalendar size={14} />
            Eventos
          </button>

          <button
            type="button"
            onClick={() => goTo("/dashboard/aspirantes")}
            className="preview-menu-option"
          >
            <FiUsers size={14} />
            Aspirantes
          </button>

          <button
            type="button"
            onClick={() => goTo("/proyectos")}
            className="preview-menu-option"
          >
            <FiCode size={14} />
            Proyectos
          </button>
        </div>
      )}
    </div>
  );
}
