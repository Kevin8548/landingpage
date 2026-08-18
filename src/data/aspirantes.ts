import cbtisLogo from "../assets/cbtis.png";
import cobatLogo from "../assets/cobat.png";
import desarrollosIcon from "../assets/icons/desarrollo.png";
import entornosIcon from "../assets/icons/entornos.png";
import redesIcon from "../assets/icons/redes.png";

export interface KeyDate {
  id: string;
  title: string;
  description: string;
  date: string;
}

export interface Institution {
  id: string;
  name: string;
  description: string;
  logo?: string;
}

export interface Career {
  id: string;
  name: string;
  shortName: string;
  img: string;
  iconBg: string;
  border: string;
  bg: string;
  text: string;
  path: string;
}

export const DEFAULT_HERO_TITLE = "Inscríbete en tu mejor opción para tu futuro";
export const DEFAULT_HERO_SUBTITLE =
  "Tres ingenierías con un gran impacto que el día de hoy manejan la industria.";

// Contenido semilla. Una vez que exista backend, esto puede pasar a ser
// el "fallback" que se usa mientras carga la data real.
// TODO: reemplaza el campo `date` de cada etapa con la fecha real cuando se confirme el calendario oficial.
export const dates: KeyDate[] = [
  {
    id: "convocatoria",
    title: "Publicación de convocatoria",
    description:
      "Se libera la convocatoria oficial con los requisitos y el calendario completo del proceso.",
    date: "Fecha por definir",
  },
  {
    id: "registro-apertura",
    title: "Apertura de registro",
    description:
      "Comienza el registro en línea. Consulta los requisitos y prepara tu documentación.",
    date: "Fecha por definir",
  },
  {
    id: "propedeutico",
    title: "Curso propedéutico",
    description:
      "Sesiones de preparación para el examen de admisión, dirigidas a los aspirantes registrados.",
    date: "Fecha por definir",
  },
  {
    id: "registro-cierre",
    title: "Cierre de registro",
    description:
      "Última fecha para entregar tu documentación y confirmar tu lugar en el proceso.",
    date: "Fecha por definir",
  },
  {
    id: "examen",
    title: "Examen de admisión",
    description:
      "Presenta tu examen en la fecha y sede asignadas durante tu proceso de registro.",
    date: "Fecha por definir",
  },
  {
    id: "resultados",
    title: "Publicación de resultados",
    description:
      "Consulta el resultado de tu proceso de admisión con tu número de folio.",
    date: "Fecha por definir",
  },
  {
    id: "inscripcion",
    title: "Inscripción",
    description:
      "Los aspirantes aceptados formalizan su inscripción y quedan listos para iniciar el semestre.",
    date: "Fecha por definir",
  },
];

export const institutions: Institution[] = [
  {
    id: "cbtis",
    name: "CBTIs",
    logo: cbtisLogo,
    description:
      "Egresados del Centro de Bachillerato Tecnológico Industrial y de Servicios acceden a pase directo cumpliendo los requisitos académicos.",
  },
  {
    id: "cobat",
    name: "Cobat",
    logo: cobatLogo,
    description:
      "Estudiantes del Colegio de Bachilleres de Tlaxcala cuentan con convenio de ingreso directo a la institución.",
  },
  {
    id: "el-valle",
    name: "El Valle",
    description:
      "Egresados de preparatoria El Valle tienen acceso preferente mediante el convenio institucional vigente.",
  },
];

// Las tres ingenierías, con su ícono personalizado, acento de marca
// (verde / naranja / teal) y ruta destino (pendiente de conectar). No es
// editable desde el admin — es contenido fijo de la franja bajo el hero.
export const CAREERS: Career[] = [
  {
    id: "software",
    name: "Desarrollo y Gestión de Software Multiplataforma",
    shortName: "Software Multiplataforma",
    img: desarrollosIcon,
    // Fondo sólido (no transparente) para que el dibujo negro del ícono resalte.
    iconBg: "bg-[var(--green)]",
    border: "border-[var(--green)]/25",
    bg: "bg-[var(--green)]/[0.08]",
    text: "text-[var(--green)]",
    // TODO: CONEXIÓN PENDIENTE — ruta real de la página de la carrera
    path: "/carreras/ingenieria-ti",
  },
  {
    id: "negocios-digitales",
    name: "Entornos Virtuales y Negocios Digitales",
    shortName: "Negocios Digitales",
    img: entornosIcon,
    iconBg: "bg-[var(--orange)]",
    border: "border-[var(--orange)]/25",
    bg: "bg-[var(--orange)]/[0.08]",
    text: "text-[var(--orange)]",
    // TODO: CONEXIÓN PENDIENTE — ruta real de la página de la carrera
    path: "/carreras/entornos-virtuales",
  },
  {
    id: "redes-ciberseguridad",
    name: "Redes y Ciberseguridad",
    shortName: "Redes y Ciberseguridad",
    img: redesIcon,
    iconBg: "bg-[var(--teal)]",
    border: "border-[var(--teal)]/25",
    bg: "bg-[var(--teal)]/[0.08]",
    text: "text-[var(--teal)]",
    // TODO: CONEXIÓN PENDIENTE — ruta real de la página de la carrera
    path: "/carreras/redes",
  },
];