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
        {/* <div className="tid-logo-glyph">
          <img 
          className="logo-h" src="/logo_utt.png" alt="Logo UTT" />
        </div> */}

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
                ref={(el) => { linkRefs.current[i] = el; }}
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

      <button className="tid-nav-cta">Iniciar Sesión</button>
    </nav>
  );
}