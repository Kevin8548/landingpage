import { useNavigate } from "react-router-dom";
import { CircleUserRound } from "lucide-react";
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
import { SocialLinks } from "../ui/SocialLinks";

const Footer = () => {
  const navigate = useNavigate();

  const footerSocials = [
    {
      icon: <FaFacebookF />,
      href: "https://www.facebook.com/UniversidadTecnologicadeTlaxcala/?ref=embed_page#",
      label: "Facebook",
    },
    {
      icon: <FaInstagram />,
      href: "https://www.instagram.com/ut_tlaxcala/?igsh=OXRubmtnenp4d2Rx",
      label: "Instagram",
    },
    {
      icon: <FaYoutube />,
      href: "https://www.youtube.com/@uttoficial",
      label: "YouTube",
    },
    {
      icon: <FaWhatsapp />,
      href: "https://chat.whatsapp.com/IuDjMt9CBicDloHkIPTy5F",
      label: "WhatsApp",
    },
    {
      icon: <FaGlobe />,
      href: "https://www.uttlaxcala.edu.mx/",
      label: "Sitio oficial",
    },
  ];

  const careers = [
    {
      name: "Ingeniería en Desarrollo y Gestión de Software Multiplataforma",
      href: "#isc",
    },
    {
      name: "Ingeniería en Entornos Virtuales y Negocios Digitales",
      href: "#iti",
    },
    {
      name: "Ingeniería en Infraestructura de Redes Digitales y Ciberseguridad",
      href: "#ic",
    },
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
    { days: "Sábado – Domingo", hours: "Cerrado" },
  ];

  const linkClasses =
    "group flex items-start gap-2 text-sm leading-snug text-light-text-muted dark:text-dark-text-muted transition-colors hover:text-light-orange-primary dark:hover:text-dark-orange-primary";

  return (
    <footer className="relative border-t border-light-border bg-light-bg text-light-text dark:border-dark-border dark:bg-dark-bg dark:text-dark-text">
      <div className="h-[3px] w-full bg-gradient-to-r from-light-green-primary via-light-orange-primary to-light-green-primary dark:from-dark-green-primary dark:via-dark-orange-primary dark:to-dark-green-secondary" />

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 py-12 sm:grid-cols-2 sm:px-8 lg:grid-cols-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-light-green-primary to-light-orange-primary text-[13px] font-extrabold tracking-wide text-white shadow-[0_0_16px_rgba(61,220,132,0.35)] dark:from-dark-green-primary dark:to-dark-orange-primary [font-family:'Unbounded']">
              TIC
            </div>

            <div>
              <p className="text-sm font-bold leading-tight text-light-text dark:text-dark-text [font-family:'Unbounded']">
                División de Tecnologías
              </p>
              <p className="text-xs leading-snug text-light-green-primary dark:text-dark-green-primary">
                de la Información y Comunicación
              </p>
            </div>
          </div>

          <p className="text-sm leading-relaxed text-light-text-muted dark:text-dark-text-muted">
            Formando ingenieros y profesionistas en tecnología con visión
            crítica, ética y competencias para el mundo digital.
          </p>

          <SocialLinks links={footerSocials} />
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="border-b border-light-border pb-2 text-xs font-bold uppercase tracking-[0.15em] text-light-green-primary dark:border-dark-border dark:text-dark-green-primary [font-family:'JetBrains_Mono']">
            Carreras TIC
          </h3>

          <ul className="flex flex-col gap-2">
            {careers.map((career) => (
              <li key={career.name}>
                <a href={career.href} className={linkClasses}>
                  <span className="mt-0.5 flex-shrink-0 text-[10px] text-light-orange-primary dark:text-dark-orange-primary [font-family:'JetBrains_Mono']">
                    ▸
                  </span>
                  {career.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="border-b border-light-border pb-2 text-xs font-bold uppercase tracking-[0.15em] text-light-green-primary dark:border-dark-border dark:text-dark-green-primary [font-family:'JetBrains_Mono']">
            Navegación
          </h3>

          <ul className="flex flex-col gap-2">
            {quickLinks.map((link) => (
              <li key={link.name}>
                <a href={link.href} className={linkClasses}>
                  <span className="mt-0.5 flex-shrink-0 text-[10px] text-light-orange-primary dark:text-dark-orange-primary [font-family:'JetBrains_Mono']">
                    ▸
                  </span>
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-5">
          <div>
            <h3 className="mb-4 border-b border-light-border pb-2 text-xs font-bold uppercase tracking-[0.15em] text-light-green-primary dark:border-dark-border dark:text-dark-green-primary [font-family:'JetBrains_Mono']">
              Contacto
            </h3>

            <ul className="flex flex-col gap-4">
              <li className="flex items-start gap-3">
                <FaMapMarkerAlt className="mt-0.5 flex-shrink-0 text-sm text-light-green-primary dark:text-dark-green-primary" />
                <div>
                  <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-widest text-light-text-muted/70 dark:text-dark-text-muted/60 [font-family:'JetBrains_Mono']">
                    Ubicación
                  </p>
                  <a
                    href="https://maps.app.goo.gl/BfakwLm6X1L5A27a9"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm leading-relaxed text-light-text-muted transition-colors hover:text-light-orange-primary dark:text-dark-text-muted dark:hover:text-dark-orange-primary"
                  >
                    El Carmen Xalpatlahuaya s/n
                    <br />
                    90513 Huamantla, Tlax.
                  </a>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <FaPhone className="mt-0.5 flex-shrink-0 text-sm text-light-green-primary dark:text-dark-green-primary" />
                <div>
                  <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-widest text-light-text-muted/70 dark:text-dark-text-muted/60 [font-family:'JetBrains_Mono']">
                    Teléfono
                  </p>
                  <a
                    href="tel:+522474725300"
                    className="text-sm text-light-text-muted transition-colors hover:text-light-orange-primary dark:text-dark-text-muted dark:hover:text-dark-orange-primary"
                  >
                    247 472 5300
                  </a>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <FaEnvelope className="mt-0.5 flex-shrink-0 text-sm text-light-green-primary dark:text-dark-green-primary" />
                <div>
                  <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-widest text-light-text-muted/70 dark:text-dark-text-muted/60 [font-family:'JetBrains_Mono']">
                    Correo
                  </p>
                  <a
                    href="mailto:contacto@uttlaxcala.edu.mx"
                    className="text-sm text-light-text-muted transition-colors hover:text-light-orange-primary dark:text-dark-text-muted dark:hover:text-dark-orange-primary"
                  >
                    contacto@uttlaxcala.edu.mx
                  </a>
                </div>
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-light-border bg-light-green-primary/5 p-4 dark:border-dark-border dark:bg-dark-green-primary/10">
            <div className="mb-3 flex items-center gap-2">
              <FaClock className="text-sm text-light-green-primary dark:text-dark-green-primary" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-light-green-primary dark:text-dark-green-primary [font-family:'JetBrains_Mono']">
                Horario de atención
              </span>
            </div>

            <table className="w-full border-collapse">
              <tbody>
                {schedule.map(({ days, hours }) => (
                  <tr
                    key={days}
                    className="border-b border-light-border/50 last:border-none dark:border-dark-border/50"
                  >
                    <td className="py-1.5 pr-2 text-sm font-medium text-light-text-muted dark:text-dark-text-muted">
                      {days}
                    </td>
                    <td
                      className={
                        hours === "Cerrado"
                          ? "py-1.5 text-right text-sm italic text-light-text-muted/60 dark:text-dark-text-muted/60"
                          : "py-1.5 text-right text-sm font-semibold text-light-text dark:text-dark-text"
                      }
                    >
                      {hours}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex w-fit items-center gap-2 rounded-full border border-light-green-primary/40 bg-light-green-primary/10 px-3 py-1.5 text-[11px] uppercase tracking-wider text-light-green-primary dark:border-dark-green-primary/40 dark:bg-dark-green-primary/15 dark:text-dark-green-primary [font-family:'JetBrains_Mono']">
            <span className="relative flex h-2 w-2">
              <span className="node-halo absolute inline-flex h-full w-full rounded-full bg-light-green-primary dark:bg-dark-green-primary" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-light-green-primary dark:bg-dark-green-primary" />
            </span>
            Periodo de admisiones abierto
          </div>


          <button
            type="button"
            className="tid-nav-login"
            onClick={() => navigate("/acceso")}
          >
            {/* <span className="tid-nav-login__icon">
              <CircleUserRound size={20} strokeWidth={2} />
            </span> */}

            <span className="tid-nav-login__text">Universidad Tecnológica de Tlaxcala</span>
          </button>
        </div>
      </div>


      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 border-t border-light-border px-6 py-5 dark:border-dark-border sm:px-8">
        <p className="text-xs text-light-text-muted/70 dark:text-dark-text-muted/60">
          © {new Date().getFullYear()} División TIC — Institución Educativa.
          Todos los derechos reservados.
        </p>

        <div className="flex items-center gap-2 text-xs text-light-text-muted/70 dark:text-dark-text-muted/60">
          <a
            href="#aviso"
            className="transition-colors hover:text-light-orange-primary dark:hover:text-dark-orange-primary"
          >
            Aviso de Privacidad
          </a>
          <span className="text-light-border dark:text-dark-border">·</span>
          <a
            href="#terminos"
            className="transition-colors hover:text-light-orange-primary dark:hover:text-dark-orange-primary"
          >
            Términos de Uso
          </a>
          <span className="text-light-border dark:text-dark-border">·</span>
          <a
            href="#accesibilidad"
            className="transition-colors hover:text-light-orange-primary dark:hover:text-dark-orange-primary"
          >
            Accesibilidad
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;