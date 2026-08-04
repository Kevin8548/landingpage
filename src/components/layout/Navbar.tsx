import { useEffect, useState } from "react";
import "./Navbar.css";

const NAV_ITEMS = [
  { label: "¿Por qué TI?", href: "#por-que-ti" },
  { label: "Carreras", href: "#carreras" },
  { label: "Eventos", href: "#eventos" },
  { label: "Aspirantes", href: "#aspirantes" },
];

const SECTION_IDS = [
  "hero",
  "por-que-ti",
  "carreras",
  "eventos",
  "aspirantes",
];

const clamp = (value: number) => Math.max(0, Math.min(100, value));

export default function Navbar() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [sectionProgress, setSectionProgress] = useState(
    Array(SECTION_IDS.length).fill(0),
  );

  useEffect(() => {
    const updateNavigation = () => {
      const scrollY = window.scrollY;
      const maxScroll = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        1,
      );

      const sectionStarts = SECTION_IDS.map(
        (id) => document.getElementById(id)?.offsetTop ?? 0,
      );

      const progressBySection = sectionStarts.map((start, index) => {
        const end =
          index < sectionStarts.length - 1
            ? sectionStarts[index + 1]
            : maxScroll;

        return clamp(((scrollY - start) / Math.max(end - start, 1)) * 100);
      });

      let currentSection = 0;

      sectionStarts.forEach((start, index) => {
        if (scrollY >= start - 120) currentSection = index;
      });

      setActiveIndex(currentSection);
      setSectionProgress(progressBySection);
    };

    window.addEventListener("scroll", updateNavigation, { passive: true });
    window.addEventListener("resize", updateNavigation);
    updateNavigation();

    return () => {
      window.removeEventListener("scroll", updateNavigation);
      window.removeEventListener("resize", updateNavigation);
    };
  }, []);

  const scrollToSection = (
    event: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    event.preventDefault();

    document.querySelector(href)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <nav className="tid-nav" aria-label="Navegación principal">
      <a
        className="tid-nav-brand"
        href="#hero"
        onClick={(event) => scrollToSection(event, "#hero")}
        aria-label="Ir al inicio"
      >
        <span className="tid-logo-text">
          UTT
          <small>TLAXCALA</small>
        </span>

        <span className="tid-nav-line" aria-hidden="true">
          <span
            className="tid-nav-line-fill"
            style={{ width: `${sectionProgress[0]}%` }}
          />
        </span>
      </a>

      {NAV_ITEMS.map((item, index) => {
        const sectionIndex = index + 1;
        const isActive = activeIndex === sectionIndex;

        return (
          <a
            key={item.href}
            className={`tid-nav-item ${isActive ? "active" : ""}`}
            href={item.href}
            onClick={(event) => scrollToSection(event, item.href)}
            aria-current={isActive ? "page" : undefined}
          >
            <span className="tid-dot" aria-hidden="true">
              <span
                className="tid-dot-fill"
                style={{ height: `${sectionProgress[sectionIndex]}%` }}
              />
            </span>

            <span>{item.label}</span>

            <span className="tid-nav-line" aria-hidden="true">
              <span
                className="tid-nav-line-fill"
                style={{ width: `${sectionProgress[sectionIndex]}%` }}
              />
            </span>
          </a>
        );
      })}
    </nav>
  );
}