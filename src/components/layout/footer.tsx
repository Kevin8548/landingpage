import React from "react";
import {
  FaFacebookF,
  FaInstagram,
  FaGlobe,
  FaYoutube,
  FaWhatsapp,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaClock,
} from "react-icons/fa";


const Footer = () => {
  const socialLinks = [
    { icon: <FaFacebookF />, href: "https://www.facebook.com/UniversidadTecnologicadeTlaxcala/?ref=embed_page#", label: "Facebook" },
    { icon: <FaInstagram />, href: "https://www.instagram.com/ut_tlaxcala/?igsh=OXRubmtnenp4d2Rx", label: "Instagram" },
    { icon: <FaYoutube />, href: "https://www.youtube.com/@uttoficial", label: "YouTube" },
    { icon: <FaWhatsapp />, href: "https://chat.whatsapp.com/IuDjMt9CBicDloHkIPTy5F", label: "WhatsApp" },
    { icon: <FaGlobe />, href: "https://www.uttlaxcala.edu.mx/", label: "Sitio oficial" },
  ];

  const careers = [
    { name: "Ingeniería en Desarrollo y Gestión de Software Multiplataforma", href: "#isc" },
    { name: "Ingeniería en Entornos Virtuales y Negocios Digitales", href: "#iti" },
    { name: "Ingeniería en Infraestructura de Redes Digitales y Ciberseguridad", href: "#ic" },
  ];

  const quickLinks = [
    { name: "Inicio", href: "#inicio" },
    { name: "Oferta Educativa", href: "#carreras" },
    { name: "Admisiones", href: "#admisiones" },
    { name: "Bolsa de Trabajo", href: "#bolsa" },
    { name: "Investigación", href: "#investigacion" },
    { name: "Contacto", href: "#contacto" },
  ];

  const schedule = [
    { days: "Lunes – Viernes", hours: "9:00 – 17:00" },
    { days: "Sabado – Domingo", hours: "Cerrado" },
  ];

  return (
    <footer style={styles.footer}>
      {/* Accent bar */}
      <div style={styles.accentBar} />

      <div style={styles.container}>
        {/* ── Col 1: Brand + redes ── */}
        <div style={styles.col}>
          <div style={styles.logoArea}>
            <div style={styles.logoIcon}>TIC</div>
            <div>
              <p style={styles.institutionName}>División de Tecnologías</p>
              <p style={styles.institutionSub}>de la Información y Comunicación</p>
            </div>
          </div>
          <p style={styles.description}>
            Formando ingenieros y profesionistas en tecnología con visión crítica,
            ética y competencias para el mundo digital.
          </p>
          <div style={styles.socialRow}>
            {socialLinks.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                style={styles.socialBtn}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background = "#7c3aed";
                  (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.08)";
                  (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
                }}
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* ── Col 2: Carreras ── */}
        <div style={styles.col}>
          <h3 style={styles.colTitle}>Carreras TIC</h3>
          <ul style={styles.linkList}>
            {careers.map((c) => (
              <li key={c.name}>
                <a
                  href={c.href}
                  style={styles.link}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#a78bfa")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#c4b5fd")}
                >
                  <span style={styles.linkDot}>▸</span> {c.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Col 3: Navegación ── */}
        <div style={styles.col}>
          <h3 style={styles.colTitle}>Navegación</h3>
          <ul style={styles.linkList}>
            {quickLinks.map((l) => (
              <li key={l.name}>
                <a
                  href={l.href}
                  style={styles.link}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#a78bfa")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#c4b5fd")}
                >
                  <span style={styles.linkDot}>▸</span> {l.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Col 4: Contacto + Ubicación + Horario ── */}
        <div style={styles.col}>
          {/* Contacto */}
          <h3 style={styles.colTitle}>Contacto</h3>
          <ul style={styles.contactList}>
            <li style={styles.contactItem}>
              <FaMapMarkerAlt style={styles.contactIcon} />
              <div>
                <p style={styles.contactLabel}>Ubicación</p>
                <a
                  href="https://maps.app.goo.gl/BfakwLm6X1L5A27a9"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.contactLink}
                >
                  El Carmen Xalpatlahuaya s/n<br />
                  90513 Huamantla, Tlax.
                </a>
              </div>
            </li>
            <li style={styles.contactItem}>
              <FaPhone style={styles.contactIcon} />
              <div>
                <p style={styles.contactLabel}>Teléfono</p>
                <a href="tel:+522474725300" style={styles.contactLink}>
                  247 472 5300
                </a>
              </div>
            </li>
            <li style={styles.contactItem}>
              <FaEnvelope style={styles.contactIcon} />
              <div>
                <p style={styles.contactLabel}>Correo</p>
                <a href="mailto:contacto@uttlaxcala.edu.mx" style={styles.contactLink}>
                  contacto@uttlaxcala.edu.mx
                </a>
              </div>
            </li>
          </ul>

          {/* Horario */}
          <div style={styles.scheduleBox}>
            <div style={styles.scheduleHeader}>
              <FaClock style={styles.scheduleIcon} />
              <span style={styles.scheduleTitle}>Horario de atención</span>
            </div>
            <table style={styles.scheduleTable}>
              <tbody>
                {schedule.map(({ days, hours }) => (
                  <tr key={days} style={styles.scheduleRow}>
                    <td style={styles.scheduleDay}>{days}</td>
                    <td
                      style={{
                        ...styles.scheduleHours,
                        ...(hours === "Cerrado" ? styles.scheduleClosed : {}),
                      }}
                    >
                      {hours}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Badge admisiones */}
          <div style={styles.badge}>
            <span style={styles.badgeDot} />
            Periodo de admisiones abierto
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={styles.bottomBar}>
        <p style={styles.bottomText}>
          © {new Date().getFullYear()} División TIC — Institución Educativa. Todos los derechos reservados.
        </p>
        <div style={styles.bottomLinks}>
          <a href="#aviso" style={styles.bottomLink}>Aviso de Privacidad</a>
          <span style={styles.sep}>·</span>
          <a href="#terminos" style={styles.bottomLink}>Términos de Uso</a>
          <span style={styles.sep}>·</span>
          <a href="#accesibilidad" style={styles.bottomLink}>Accesibilidad</a>
        </div>
      </div>
    </footer>
  );
};

// Styles

const styles: Record<string, React.CSSProperties> = {
  footer: {
    background: "linear-gradient(180deg, #2e1065 0%, #1e0a4a 100%)",
    color: "#e9d5ff",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    borderTop: "1px solid rgba(167,139,250,0.15)",
  },
  accentBar: {
    height: "3px",
    background: "linear-gradient(90deg, #7c3aed, #a855f7, #c084fc, #7c3aed)",
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "3rem 2rem 2rem",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "2.5rem",
  },
  col: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },

  // Brand
  logoArea: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },
  logoIcon: {
    width: "44px",
    height: "44px",
    borderRadius: "10px",
    background: "linear-gradient(135deg, #7c3aed, #a855f7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
    fontSize: "0.85rem",
    letterSpacing: "0.05em",
    color: "#fff",
    flexShrink: 0,
    boxShadow: "0 0 16px rgba(167,139,250,0.3)",
  },
  institutionName: {
    margin: 0,
    fontWeight: "700",
    fontSize: "0.9rem",
    color: "#f5f3ff",
    lineHeight: 1.2,
  },
  institutionSub: {
    margin: 0,
    fontSize: "0.72rem",
    color: "#a78bfa",
    lineHeight: 1.3,
  },
  description: {
    fontSize: "0.82rem",
    lineHeight: "1.65",
    color: "#c4b5fd",
    margin: 0,
  },
  socialRow: {
    display: "flex",
    gap: "0.5rem",
    flexWrap: "wrap",
  },
  socialBtn: {
    width: "36px",
    height: "36px",
    borderRadius: "8px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(167,139,250,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#e9d5ff",
    fontSize: "0.85rem",
    textDecoration: "none",
    transition: "background 0.2s, transform 0.2s",
    cursor: "pointer",
  },

  // Column headings
  colTitle: {
    margin: 0,
    fontSize: "0.78rem",
    fontWeight: "700",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "#a78bfa",
    paddingBottom: "0.5rem",
    borderBottom: "1px solid rgba(167,139,250,0.2)",
  },

  // Link lists
  linkList: {
    listStyle: "none",
    margin: 0,
    padding: 0,
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  link: {
    color: "#c4b5fd",
    textDecoration: "none",
    fontSize: "0.83rem",
    display: "flex",
    alignItems: "flex-start",
    gap: "0.4rem",
    lineHeight: "1.4",
    transition: "color 0.15s",
  },
  linkDot: {
    color: "#7c3aed",
    fontSize: "0.7rem",
    marginTop: "2px",
    flexShrink: 0,
  },

  // Contact
  contactList: {
    listStyle: "none",
    margin: 0,
    padding: 0,
    display: "flex",
    flexDirection: "column",
    gap: "0.9rem",
  },
  contactItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "0.65rem",
    fontSize: "0.82rem",
    color: "#c4b5fd",
    lineHeight: "1.5",
  },
  contactIcon: {
    color: "#a78bfa",
    marginTop: "3px",
    flexShrink: 0,
    fontSize: "0.9rem",
  },
  contactLabel: {
    margin: "0 0 1px",
    fontSize: "0.68rem",
    fontWeight: "600",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: "#7c6fa0",
  },
  contactLink: {
    color: "#c4b5fd",
    textDecoration: "none",
    fontSize: "0.82rem",
    lineHeight: "1.5",
  },

  // Schedule
  scheduleBox: {
    background: "rgba(124,58,237,0.1)",
    border: "1px solid rgba(167,139,250,0.18)",
    borderRadius: "10px",
    padding: "0.9rem 1rem",
  },
  scheduleHeader: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    marginBottom: "0.65rem",
  },
  scheduleIcon: {
    color: "#a78bfa",
    fontSize: "0.82rem",
  },
  scheduleTitle: {
    fontSize: "0.74rem",
    fontWeight: "700",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#a78bfa",
  },
  scheduleTable: {
    width: "100%",
    borderCollapse: "collapse",
  },
  scheduleRow: {
    borderBottom: "1px solid rgba(167,139,250,0.08)",
  },
  scheduleDay: {
    fontSize: "0.78rem",
    color: "#c4b5fd",
    padding: "0.3rem 0.5rem 0.3rem 0",
    fontWeight: "500",
  },
  scheduleHours: {
    fontSize: "0.78rem",
    color: "#e9d5ff",
    textAlign: "right",
    fontWeight: "600",
    padding: "0.3rem 0",
  },
  scheduleClosed: {
    color: "#7c6fa0",
    fontWeight: "400",
    fontStyle: "italic",
  },

  // Badge
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    background: "rgba(124,58,237,0.2)",
    border: "1px solid rgba(124,58,237,0.4)",
    borderRadius: "20px",
    padding: "0.35rem 0.85rem",
    fontSize: "0.75rem",
    color: "#c4b5fd",
    width: "fit-content",
  },
  badgeDot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    background: "#4ade80",
    boxShadow: "0 0 6px #4ade80",
    display: "inline-block",
  },

  // Bottom bar
  bottomBar: {
    borderTop: "1px solid rgba(167,139,250,0.12)",
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "1.25rem 2rem",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "0.75rem",
  },
  bottomText: {
    margin: 0,
    fontSize: "0.76rem",
    color: "#7c6fa0",
  },
  bottomLinks: {
    display: "flex",
    gap: "0.5rem",
    alignItems: "center",
  },
  bottomLink: {
    color: "#7c6fa0",
    textDecoration: "none",
    fontSize: "0.76rem",
  },
  sep: {
    color: "#4a3970",
  },
};

export default Footer;