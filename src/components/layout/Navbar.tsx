import { useRef } from "react";
import { CircleUserRound } from "lucide-react";
import "./Navbar.css";

const LINKS = [
  { label: "¿Por qué TI?", href: "#por-que-ti" },
  { label: "Carreras", href: "#carreras" },
  { label: "Eventos", href: "#eventos" },
  { label: "Aspirantes", href: "#aspirantes" },
];

const DEMO_ACTIVE_INDEX = 0;
const DEMO_FILL_FRACTIONS = [0.55, 0, 0, 0];
const DEMO_SCROLL_PROGRESS = 22;

export default function Navbar() {
  const linkRefs = useRef<Array<HTMLAnchorElement | null>>([]);

  return (
    <nav className="tid-nav">
      <div className="tid-logo-mark">
        <div className="tid-logo-text">UTT<span>TLAXCALA</span></div>
      </div>

        <ul className="tid-nav-links">
          {LINKS.map((link, i) => {
            const isActive = DEMO_ACTIVE_INDEX === i;
            const fillHeight = DEMO_FILL_FRACTIONS[i] * 100;
            return (
              <li key={link.label}>
                <a href={link.href} ref={(el) => { linkRefs.current[i] = el; }} className={isActive ? "active" : ""} onClick={(e) => e.preventDefault()}>
                  <span className="tid-dot">
                    <span className="tid-dot-fill" style={{ height: fillHeight + "%" }} />
                  </span>
                  {link.label}
                </a>
              </li>
            );
          })}
        </ul>

        <div className="tid-nav-track" />
        <div className="tid-nav-indicator" style={{ width: DEMO_SCROLL_PROGRESS + "%" }} />

<button className="tid-nav-login">
  <span className="tid-nav-login__icon">
    <CircleUserRound size={20} strokeWidth={2} />
  </span>
  <span className="tid-nav-login__text">
    Iniciar Sesión
  </span>
</button>
    </nav>
  );
}