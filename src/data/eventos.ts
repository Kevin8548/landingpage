import { FiBookOpen, FiMusic, FiUsers } from "react-icons/fi";
import type { IconType } from "react-icons";

export type Category = "academico" | "cultural" | "comunidad";

export interface EventItem {
  id: string;
  title: string;
  date: string; // ISO yyyy-mm-dd
  time: string; // "09:00"
  location: string;
  category: Category;
  description: string;
  image?: string; // URL opcional. Sin imagen, se usa un fondo generado por categoría.
  registrationUrl?: string;
}

export interface CategoryMeta {
  label: string;
  icon: IconType;
  color: string; // referencia a variable CSS del tema (index.css)
}

// Contenido semilla. Una vez que exista backend, esto puede pasar a ser el
// estado inicial que se usa mientras carga la data real.
export const events: EventItem[] = [
  {
    id: "hackathon-tic",
    title: "Hackathon TIC 2026",
    date: "2026-08-22",
    time: "09:00",
    location: "Explanada principal",
    category: "academico",
    description:
      "24 horas para construir un proyecto desde cero. Equipos de hasta 4 integrantes, mentores en sitio y premios para los tres primeros lugares.",
  },
  {
    id: "semana-ciencia",
    title: "Semana de la Ciencia y la Tecnología",
    date: "2026-09-08",
    time: "10:00",
    location: "Auditorio central",
    category: "academico",
    description:
      "Cinco días de conferencias, talleres y demostraciones con investigadores invitados de distintas industrias.",
  },
  {
    id: "torneo-voleibol",
    title: "Torneo Intramuros de Voleibol",
    date: "2026-09-16",
    time: "12:00",
    location: "Canchas deportivas",
    category: "cultural",
    description:
      "Fase de grupos entre todas las carreras. Inscribe a tu equipo en Servicios Escolares antes del cierre de convocatoria.",
  },
  {
    id: "noche-talentos",
    title: "Noche de Talentos UTT",
    date: "2026-09-25",
    time: "18:00",
    location: "Explanada principal",
    category: "cultural",
    description:
      "Música, danza y stand-up hecho por estudiantes. Convocatoria para participar abierta dos semanas antes.",
  },
  {
    id: "feria-ingenierias",
    title: "Feria de Ingenierías y Vinculación Empresarial",
    date: "2026-10-07",
    time: "09:30",
    location: "Domo institucional",
    category: "academico",
    description:
      "Empresas del corredor industrial de Tlaxcala presentan vacantes, retos y proyectos de residencia profesional.",
  },
  {
    id: "conferencia-ia",
    title: "IA aplicada a la industria",
    date: "2026-10-15",
    time: "17:00",
    location: "Sala audiovisual",
    category: "academico",
    description:
      "Conferencia abierta sobre casos reales de automatización e inteligencia artificial en manufactura local.",
  },
  {
    id: "brigada-comunitaria",
    title: "Brigada de Servicio Social Comunitario",
    date: "2026-10-24",
    time: "08:00",
    location: "Salida desde el campus",
    category: "comunidad",
    description:
      "Jornada de apoyo con una comunidad vecina: talleres para niños y mantenimiento de espacios públicos.",
  },
  {
    id: "dia-muertos",
    title: "Festival de Día de Muertos",
    date: "2026-11-02",
    time: "11:00",
    location: "Plaza central del campus",
    category: "cultural",
    description:
      "Concurso de ofrendas por carrera, comida tradicional y proyección de cortometrajes al caer la tarde.",
  },
  {
    id: "graduacion-2026",
    title: "Ceremonia de Graduación — Generación 2026",
    date: "2026-12-11",
    time: "10:00",
    location: "Auditorio central",
    category: "comunidad",
    description:
      "Entrega de reconocimientos para egresados de las tres ingenierías. Cupo limitado por invitación.",
  },
];

export const CATEGORY_META: Record<Category, CategoryMeta> = {
  academico: { label: "Académico", icon: FiBookOpen, color: "var(--green)" },
  cultural: { label: "Cultural", icon: FiMusic, color: "var(--orange)" },
  comunidad: { label: "Comunidad", icon: FiUsers, color: "var(--teal)" },
};

export const CATEGORY_ORDER: Category[] = ["academico", "cultural", "comunidad"];
