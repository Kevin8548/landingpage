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
    title: "Hackathon TIC",
    date: "2027-11-12",
    time: "00:00",
    location: "Edificio P",
    category: "academico",
    description:
      "24 horas para construir un proyecto desde cero. Equipos de hasta 6 integrantes, mentores en sitio y premios para los tres primeros lugares.",
  },
  {
    id: "congreso",
    title: "Congreso de Tecnología y Ciberseguridad",
    date: "2027-10-15",
    time: "10:00",
    location: "Plaza cívica",
    category: "academico",
    description:
      "Dos días de conferencias, talleres y demostraciones con ponentes invitados de distintas industrias.",
  },
  {
    id: "concurso-ofrendas",
    title: "Concurso de Ofrendas",
    date: "2027-10-20",
    time: "10:00",
    location: "Plaza cívica",
    category: "comunidad",
    description:
      "Concurso de ofrendas por carrera, realizada a nivel institucional.",
  },
  {
    id: "cine-terror",
    title: "Cine de Terror",
    date: "2027-10-25",
    time: "09:00",
    location: "Edificio P",
    category: "cultural",
    description:
      "Películas de terror y suspenso proyectadas en el edificio P, con palomitas y bebidas para los asistentes.",
  },
  {
    id: "rally",
    title: "Rally",
    date: "2027-11-12",
    time: "09:00",
    location: "Edificio P",
    category: "cultural",
    description:
      "Competencia entre equipos de estudiantes de distintas carreras, con pruebas de ingenio y destreza física.",
  },
  {
    id: "integradora-terceros",
    title: "Integradora de Tercer Cuatrimestre",
    date: "2027-08-01",
    time: "10:00",
    location: "Sala P",
    category: "academico",
    description:
      "Presentación de proyectos finales de los estudiantes de tercer cuatrimestre de las tres carreras",
  },
  {
    id: "integradora-quintos",
    title: "Integradora de Quinto Cuatrimestre",
    date: "2027-04-01",
    time: "10:00",
    location: "Sala P",
    category: "academico",
    description:
      "Presentación de proyectos finales de los estudiantes de quinto cuatrimestre de las tres carreras",
  },
  {
    id: "integradora-novenos",
    title: "Integradora de Noveno Cuatrimestre",
    date: "2027-12-01",
    time: "10:00",
    location: "Sala P",
    category: "academico",
    description:
      "Presentación de proyectos finales de los estudiantes de noveno cuatrimestre de las tres carreras",
  },
];

export const CATEGORY_META: Record<Category, CategoryMeta> = {
  academico: { label: "Académico", icon: FiBookOpen, color: "var(--green)" },
  cultural: { label: "Cultural", icon: FiMusic, color: "var(--orange)" },
  comunidad: { label: "Comunidad", icon: FiUsers, color: "var(--teal)" },
};

export const CATEGORY_ORDER: Category[] = ["academico", "cultural", "comunidad"];
