import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import "./Navbar.css";

const NAV_ITEMS = [
  { label: "¿Por qué estudiar esta carrera?", href: "#detalle-por-que" },
  { label: "Plan de estudios", href: "#detalle-plan" },
  { label: "Perfil y campo laboral", href: "#detalle-perfil" },
  { label: "Vida estudiantil", href: "#detalle-vida" },
];

const SECTION_IDS = [
  "detalle-inicio",
  "detalle-por-que",
  "detalle-plan",
  "detalle-perfil",
  "detalle-vida",
];

const clamp = (value: number) => Math.max(0, Math.min(100, value));

export default function CareerNavbar() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState<number[]>(
    Array(SECTION_IDS.length).fill(0),
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const updateNavbar = () => {
      const scrollY = window.scrollY;

      const maxScroll = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        1,
      );

      const starts = SECTION_IDS.map(
        (id) => document.getElementById(id)?.offsetTop ?? 0,
      );

      const nextProgress = starts.map((start, index) => {
        const end =
          index < starts.length - 1 ? starts[index + 1] : maxScroll;

        return clamp(((scrollY - start) / Math.max(end - start, 1)) * 100);
      });

      let current = 0;

      starts.forEach((start, index) => {
        if (scrollY >= start - 100) {
          current = index;
        }
      });

      setProgress(nextProgress);
      setActiveIndex(current);
    };

    window.addEventListener("scroll", updateNavbar, { passive: true });
    window.addEventListener("resize", updateNavbar);

    updateNavbar();

    return () => {
      window.removeEventListener("scroll", updateNavbar);
      window.removeEventListener("resize", updateNavbar);
    };
  }, []);

  const goBackToCareers = () => {
    sessionStorage.setItem("landing-scroll-target", "carreras");

    // Lleva siempre a /landingpage/ con la diagonal final.
    window.location.assign(import.meta.env.BASE_URL);
  };

  const scrollToSection = (
    event: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    event.preventDefault();
    setMobileMenuOpen(false);

    document.querySelector(href)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <nav className="tid-nav" aria-label="Navegación de la carrera">
      <a
        className="tid-nav-brand"
        href={import.meta.env.BASE_URL}
        onClick={(event) => {
          event.preventDefault();
          goBackToCareers();
        }}
      >
        <span className="tid-logo-text">
          UTT
          <small>VOLVER A CARRERAS</small>
        </span>

        <span className="tid-nav-line">
          <span
            className="tid-nav-line-fill"
            style={{ width: `${progress[0]}%` }}
          />
        </span>
      </a>

      <button
        type="button"
        className="tid-mobile-toggle"
        onClick={() => setMobileMenuOpen((prev) => !prev)}
        aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú de navegación"}
        aria-expanded={mobileMenuOpen}
      >
        {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {NAV_ITEMS.map((item, index) => {
        const sectionIndex = index + 1;
        const isActive = activeIndex === sectionIndex;

        return (
          <a
            key={item.href}
            className={`tid-nav-item ${isActive ? "active" : ""}`}
            href={item.href}
            onClick={(event) => scrollToSection(event, item.href)}
          >
            <span className="tid-dot" aria-hidden="true">
              <span
                className="tid-dot-fill"
                style={{ height: `${progress[sectionIndex]}%` }}
              />
            </span>

            <span>{item.label}</span>

            <span className="tid-nav-line" aria-hidden="true">
              <span
                className="tid-nav-line-fill"
                style={{ width: `${progress[sectionIndex]}%` }}
              />
            </span>
          </a>
        );
      })}

      <div
        className={`tid-mobile-menu ${mobileMenuOpen ? "is-open" : ""}`}
        aria-hidden={!mobileMenuOpen}
      >
        {NAV_ITEMS.map((item, index) => {
          const sectionIndex = index + 1;
          const isActive = activeIndex === sectionIndex;

          return (
            <a
              key={item.href}
              className={`tid-mobile-nav-item ${isActive ? "active" : ""}`}
              href={item.href}
              onClick={(event) => scrollToSection(event, item.href)}
            >
              <span className="tid-dot" aria-hidden="true">
                <span
                  className="tid-dot-fill"
                  style={{ height: `${progress[sectionIndex]}%` }}
                />
              </span>
              <span>{item.label}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}