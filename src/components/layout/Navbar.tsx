import { useEffect, useRef, useState } from "react";
import "./Navbar.css";

const LINKS = [
  { label: "¿Por qué TI?", href: "#por-que-ti" },
  { label: "Carreras", href: "#carreras" },
  { label: "Eventos", href: "#eventos" },
  { label: "Aspirantes", href: "#aspirantes" },
];

export default function Navbar() {
  const [activeIndex, setActiveIndex] = useState(0);
  const linkRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const centerRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);

  const moveIndicator = (el: HTMLAnchorElement | null) => {
    if (!el || !centerRef.current || !indicatorRef.current) return;
    const parentRect = centerRef.current.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    indicatorRef.current.style.left = `${r.left - parentRect.left}px`;
    indicatorRef.current.style.width = `${r.width}px`;
  };

  useEffect(() => {
    moveIndicator(linkRefs.current[activeIndex]);
    const onResize = () => moveIndicator(linkRefs.current[activeIndex]);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex]);

  return (
    <nav className="tid-nav">
      <div className="tid-logo-mark">
        <div className="tid-logo-glyph">
          <svg viewBox="0 0 40 40" fill="none">
            <path
              d="M20 3 C24 10 30 12 36 12 C32 17 32 23 36 28 C30 28 24 30 20 37 C16 30 10 28 4 28 C8 23 8 17 4 12 C10 12 16 10 20 3Z"
              fill="url(#navGrad)"
            />
            <defs>
              <linearGradient
                id="navGrad"
                x1="4"
                y1="3"
                x2="36"
                y2="37"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#3ddc84" />
                <stop offset="1" stopColor="#ff7a45" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div className="tid-logo-text">
          UTT
          <span>TLAXCALA · GOB.MX</span>
        </div>
      </div>

      <div className="tid-nav-center" ref={centerRef}>
        <ul className="tid-nav-links">
          {LINKS.map((link, i) => (
            <li key={link.label}>
              <a
                href={link.href}
                ref={(el) => (linkRefs.current[i] = el)}
                className={activeIndex === i ? "active" : ""}
                onMouseEnter={() => moveIndicator(linkRefs.current[i])}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveIndex(i);
                }}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="tid-nav-indicator" ref={indicatorRef} />
      </div>

      <button className="tid-nav-cta">Inscríbete</button>
    </nav>
  );
}