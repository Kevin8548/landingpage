/* eslint-disable react-refresh/only-export-components */
import { useEffect, useState } from "react";
import { FiArrowUpRight, FiBookOpen, FiCode, FiExternalLink, FiMusic, FiUsers, FiX } from "react-icons/fi";
import type { IconType } from "react-icons";
import { listPublicProjects, type ManagedProject } from "../../services/manageProjects";
import EventosAdmin from "../dashboard/EventosAdmin";

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

export default function Eventos() {
  const [projects, setProjects] = useState<ManagedProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<ManagedProject | null>(null);

  useEffect(() => {
    const loadContent = async () => {
      const loadedProjects = await listPublicProjects().catch((error) => {
        console.error("Error cargando proyectos:", error);
        return [] as ManagedProject[];
      });
      setProjects(loadedProjects);
      setIsLoading(false);
    };
    void loadContent();
  }, []);

  return <>
    <section id="eventos"><EventosAdmin allowEditing={false} /></section>

    {projects.length > 0 && <section className="eventos-board relative bg-[var(--bg)] px-6 py-20 sm:px-8" id="proyectos">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 max-w-4xl"><div className="mb-4 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.25em] text-[var(--muted)]"><span className="h-px w-6 bg-[var(--line)]" /> Talento estudiantil</div><div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><h2 className="font-display text-4xl font-extrabold tracking-tight text-[var(--ink)] sm:text-5xl">Proyectos</h2><p className="max-w-sm text-sm leading-relaxed text-[var(--muted)] sm:text-right">Soluciones, experiencias e ideas creadas por estudiantes de la UTT.</p></div></div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{projects.map((project) => <button key={project.id} type="button" onClick={() => setSelectedProject(project)} className="event-card-glow group relative flex min-h-[320px] flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--glass)] text-left"><span className="absolute inset-x-0 top-0 z-20 h-[3px] bg-[linear-gradient(90deg,var(--green),var(--orange))]" /><div className="relative h-40 w-full shrink-0 overflow-hidden bg-[radial-gradient(circle_at_25%_20%,color-mix(in_srgb,var(--green)_30%,var(--bg))_0%,var(--bg)_75%)]"><FiCode className="absolute inset-0 m-auto h-14 w-14 text-[var(--green)] opacity-20" />{project.imagen_url && <img src={project.imagen_url} alt={`Imagen de ${project.titulo}`} className="relative z-10 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" onError={(event) => { event.currentTarget.style.display = "none"; }} />}<div className="pointer-events-none absolute inset-0 z-20 bg-[linear-gradient(180deg,transparent_45%,color-mix(in_srgb,var(--bg)_65%,transparent)_100%)]" /></div><div className="flex flex-1 flex-col p-5"><span className="font-mono text-[11px] uppercase tracking-wide text-[var(--green)]">{project.categoria || "Proyecto estudiantil"}</span><h3 className="mt-2 font-display text-xl font-bold text-[var(--ink)]">{project.titulo}</h3><p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[var(--muted)]">{project.descripcion}</p><div className="mt-auto flex items-center justify-between gap-3 border-t border-[var(--line)] pt-4 font-mono text-[11px] text-[var(--muted)]"><span className="truncate">{project.autores}</span><FiArrowUpRight className="h-4 w-4 shrink-0 text-[var(--orange)]" /></div></div></button>)}</div>
      </div>
    </section>}

    {selectedProject && <div className="fixed inset-0 z-[100] grid place-items-center bg-black/65 p-4" role="presentation" onMouseDown={() => setSelectedProject(null)}><article role="dialog" aria-modal="true" aria-labelledby="public-project-title" className="w-full max-w-3xl overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--bg)] shadow-2xl" onMouseDown={(event) => event.stopPropagation()}><div className="grid md:grid-cols-[.9fr_1.1fr]"><div className="relative min-h-48 bg-[radial-gradient(circle_at_25%_20%,color-mix(in_srgb,var(--green)_30%,var(--bg))_0%,var(--bg)_75%)] md:min-h-full"><FiCode className="absolute inset-0 m-auto h-16 w-16 text-[var(--green)] opacity-20" />{selectedProject.imagen_url && <img src={selectedProject.imagen_url} alt={`Imagen de ${selectedProject.titulo}`} className="relative z-10 h-full w-full object-cover" onError={(event) => { event.currentTarget.style.display = "none"; }} />}<button type="button" onClick={() => setSelectedProject(null)} className="absolute right-4 top-4 z-20 grid h-9 w-9 place-items-center rounded-full border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] shadow" aria-label="Cerrar"><FiX /></button></div><div className="max-h-[75dvh] overflow-y-auto p-6 sm:p-8"><p className="font-mono text-[11px] uppercase tracking-[.2em] text-[var(--orange)]">{selectedProject.categoria || "Proyecto estudiantil"}</p><h3 id="public-project-title" className="mt-3 font-display text-2xl font-bold text-[var(--ink)]">{selectedProject.titulo}</h3><p className="mt-2 text-sm font-medium text-[var(--green)]">{selectedProject.autores}</p><p className="mt-5 whitespace-pre-line text-sm leading-7 text-[var(--muted)]">{selectedProject.descripcion}</p><dl className="mt-6 grid gap-4 border-y border-[var(--line)] py-5 text-sm"><div><dt className="font-mono text-[10px] uppercase tracking-wider text-[var(--muted)]">Carrera</dt><dd className="mt-1 text-[var(--ink)]">{selectedProject.carrera || "No especificada"}</dd></div><div><dt className="font-mono text-[10px] uppercase tracking-wider text-[var(--muted)]">Tecnologías</dt><dd className="mt-1 text-[var(--ink)]">{selectedProject.tecnologias.length ? selectedProject.tecnologias.join(" · ") : "No especificadas"}</dd></div></dl>{selectedProject.enlace && <a href={selectedProject.enlace} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--ink)] px-4 py-2.5 font-mono text-xs uppercase tracking-wide text-[var(--bg)] transition-colors hover:bg-[var(--green)]">Ver proyecto <FiExternalLink /></a>}</div></div></article></div>}
  </>;
}
export { Eventos };
