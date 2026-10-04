import { useEffect, useRef, useState, type DragEvent, type FormEvent } from "react";
import { ArrowUpRight, CalendarDays, ChevronLeft, ChevronRight, Code2, ExternalLink, Eye, FolderKanban, ImagePlus, LayoutDashboard, LogOut, Menu, Pencil, Plus, Trash2, Upload, Users, X } from "lucide-react";
import { Link } from "react-router-dom";
import { AnimatedThemeToggler } from "../components/ui/AnimatedThemeToggler";
import "../components/dashboard/Dashboard.css";
import "../components/dashboard/DashboardOverrides.css";
import "../components/dashboard/Projects.css";
import { showDashboardAlert } from "../lib/dashboardAlerts";
import DashboardSelect from "../components/dashboard/DashboardSelect";
import { createManagedProject, deleteManagedProject, listManagedProjects, updateManagedProject, type ManagedProject, type ProjectPayload } from "../services/manageProjects";

const projectCategories = ["TSU en Desarrollo de Software Multiplataforma", "TSU Redes y Ciberseguridad", "TSU Entornos Virtuales", "Ingeniería en TI e Innovación Digital"];

export default function Projects() {
  const [projects, setProjects] = useState<ManagedProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isFormOpen, setFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ManagedProject | null>(null);
  const [viewingProject, setViewingProject] = useState<ManagedProject | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | undefined>();
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const loadProjects = async () => {
    try {
      setProjects(await listManagedProjects());
    } catch (error) {
      console.error("No fue posible cargar los proyectos:", error);
      void showDashboardAlert({ icon: "error", title: "No se pudieron cargar los proyectos", text: "Inténtalo nuevamente en unos momentos." });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { void loadProjects(); }, []);
  useEffect(() => {
    if (!isFormOpen && !viewingProject) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [isFormOpen, viewingProject]);

  const openCreator = () => {
    setEditingProject(null);
    setSelectedImage(undefined);
    setFormOpen(true);
  };

  const openEditor = (project: ManagedProject) => {
    setEditingProject(project);
    setSelectedImage(project.imagen_url ?? undefined);
    setFormOpen(true);
  };

  const loadImage = (file?: File) => {
    if (!file) return;
    if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
      void showDashboardAlert({ icon: "warning", title: "Archivo no válido", text: "Selecciona una imagen PNG, JPG o WEBP." });
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      void showDashboardAlert({ icon: "warning", title: "Imagen demasiado pesada", text: "Elige una imagen de hasta 3 MB." });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setSelectedImage(String(reader.result));
    reader.readAsDataURL(file);
  };

  const handleImageDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingImage(false);
    loadImage(event.dataTransfer.files[0]);
  };

  const saveProject = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const tecnologias = String(data.get("tecnologias") ?? "").split(",").map((item) => item.trim()).filter(Boolean);
    const payload: ProjectPayload = {
      titulo: String(data.get("titulo") ?? "").trim(),
      descripcion: String(data.get("descripcion") ?? "").trim(),
      autores: String(data.get("autores") ?? "").trim(),
      carrera: String(data.get("carrera") ?? "").trim() || null,
      categoria: String(data.get("categoria") ?? "").trim() || null,
      tecnologias,
      enlace: String(data.get("enlace") ?? "").trim() || null,
      imageDataUrl: selectedImage?.startsWith("data:image/") ? selectedImage : undefined,
      removeImage: Boolean(editingProject?.imagen_url && !selectedImage),
    };

    if (!payload.titulo || !payload.descripcion || !payload.autores) return;
    if (payload.enlace) {
      try { new URL(payload.enlace); } catch {
        void showDashboardAlert({ icon: "warning", title: "Enlace no válido", text: "Escribe una dirección completa, por ejemplo https://ejemplo.com." });
        return;
      }
    }

    try {
      const saved = editingProject ? await updateManagedProject(editingProject.id, payload) : await createManagedProject(payload);
      setProjects((current) => editingProject ? current.map((project) => project.id === saved.id ? saved : project) : [saved, ...current]);
      setFormOpen(false);
      setEditingProject(null);
      void showDashboardAlert({ icon: "success", title: editingProject ? "Proyecto editado" : "Proyecto creado", text: editingProject ? "Los cambios se guardaron." : "El proyecto se guardó." });
    } catch (error) {
      console.error(error);
      void showDashboardAlert({ icon: "error", title: "No fue posible guardar el proyecto", text: error instanceof Error ? error.message : "Inténtalo de nuevo." });
    }
  };

  const removeProject = async (project: ManagedProject) => {
    const result = await showDashboardAlert({ icon: "warning", title: "¿Eliminar este proyecto?", text: `“${project.titulo}” se eliminará.`, showCancelButton: true, confirmButtonText: "Sí, eliminar", cancelButtonText: "Cancelar" });
    if (!result.isConfirmed) return;
    try {
      await deleteManagedProject(project.id);
      setProjects((current) => current.filter((item) => item.id !== project.id));
      void showDashboardAlert({ icon: "success", title: "Proyecto eliminado", timer: 1600, showConfirmButton: false });
    } catch (error) {
      console.error(error);
      void showDashboardAlert({ icon: "error", title: "No fue posible eliminar el proyecto" });
    }
  };

  return <main className="dashboard-page">
    <aside className={`dashboard-sidebar ${isSidebarOpen ? "is-open" : ""} ${isSidebarCollapsed ? "is-collapsed" : ""}`}>
      <button className="dashboard-sidebar-collapse" onClick={() => setSidebarCollapsed((value) => !value)} aria-label={isSidebarCollapsed ? "Expandir barra lateral" : "Contraer barra lateral"}>{isSidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}</button>
      <div className="dashboard-brand"><span className="dashboard-brand__mark">UTT</span><span>Universidad Tecnológica<br />de Tlaxcala</span><button className="dashboard-sidebar__close" onClick={() => setSidebarOpen(false)} aria-label="Cerrar menú"><X size={19} /></button></div>
      <nav className="dashboard-nav" aria-label="Navegación del panel"><Link to="/dashboard"><LayoutDashboard size={18} />Resumen</Link><Link to="/dashboard/eventos"><CalendarDays size={18} />Eventos</Link><Link className="is-active" to="/dashboard/proyectos"><FolderKanban size={18} />Proyectos <span>{isLoading ? "" : projects.length}</span></Link><Link to="/dashboard/padron"><Users size={18} />Padrón de Alumnos</Link><button type="button" onClick={openCreator}><Plus size={18} />Crear proyecto</button></nav>
      <div className="dashboard-sidebar__bottom"><div className="dashboard-profile"><span className="dashboard-avatar">AD</span><div><strong>Administrador</strong><small>Proyectos destacados</small></div></div><Link to="/" className="dashboard-signout"><LogOut size={17} />Salir al sitio</Link></div>
    </aside>

    <section className="dashboard-content"><header className="dashboard-topbar"><button className="dashboard-menu-button" onClick={() => setSidebarOpen(true)} aria-label="Abrir menú"><Menu size={21} /></button><div className="dashboard-breadcrumb"><Link to="/dashboard">Panel</Link><span>/</span><strong>Proyectos</strong></div><div className="dashboard-topbar__actions"><AnimatedThemeToggler className="dashboard-theme-toggle" /><span className="dashboard-avatar dashboard-avatar--small">AD</span></div></header>
      <div className="dashboard-body dashboard-body--events"><div className="dashboard-welcome"><div><p className="dashboard-eyebrow"><Code2 size={14} /> PROYECTOS DESTACADOS</p><h1>Talento que inspira<span>.</span></h1><p>Comparte los trabajos relevantes de las y los estudiantes.</p></div><button className="dashboard-primary-button" onClick={openCreator}><Plus size={18} />Crear proyecto</button></div>
        <section className="dashboard-projects"><div className="dashboard-section-heading"><div><p>PORTAFOLIO ESTUDIANTIL</p><h2>{isLoading ? "Cargando proyectos..." : `${projects.length} ${projects.length === 1 ? "proyecto" : "proyectos"}`}</h2></div></div>
          {isLoading ? <div className="dashboard-project-grid" aria-busy="true">{Array.from({ length: 3 }, (_, index) => <div key={index} className="dashboard-project-card dashboard-project-card--placeholder placeholder-glow" />)}</div> : projects.length === 0 ? <div className="dashboard-empty-state"><FolderKanban size={28} /><h3>Aún no hay proyectos destacados</h3><p>Cuando publiques uno, aparecerá aquí y en la landing principal.</p><button className="dashboard-primary-button" onClick={openCreator}><Plus size={17} />Crear el primero</button></div> : <div className="dashboard-project-grid">{projects.map((project) => <article className="dashboard-project-card" key={project.id}><button className="dashboard-project-card__open" onClick={() => setViewingProject(project)} aria-label={`Ver ${project.titulo}`}><div className="dashboard-project-card__image">{project.imagen_url ? <img src={project.imagen_url} alt="" /> : <Code2 size={32} />}<span>{project.categoria || "Proyecto estudiantil"}</span></div><div className="dashboard-project-card__content"><p>{project.carrera || "Universidad Tecnológica de Tlaxcala"}</p><h3>{project.titulo}</h3><small>{project.autores}</small><div>{project.tecnologias.slice(0, 3).map((technology) => <i key={technology}>{technology}</i>)}</div></div></button><div className="dashboard-project-card__actions"><button onClick={() => setViewingProject(project)}><Eye size={15} />Ver</button><button onClick={() => openEditor(project)}><Pencil size={15} />Editar</button><button className="is-danger" onClick={() => void removeProject(project)}><Trash2 size={15} />Eliminar</button></div></article>)}</div>}
        </section>
      </div>
    </section>

    {isFormOpen && <div className="dashboard-modal-backdrop" role="presentation" onMouseDown={() => setFormOpen(false)}><section className="dashboard-modal" role="dialog" aria-modal="true" aria-labelledby="project-form-title" onMouseDown={(event) => event.stopPropagation()}><div className="dashboard-modal__header"><div><p className="dashboard-eyebrow">{editingProject ? "EDITAR PROYECTO" : "NUEVO PROYECTO"}</p><h2 id="project-form-title">{editingProject ? "Actualiza el proyecto" : "Haz visible el talento"}</h2></div><button onClick={() => setFormOpen(false)} aria-label="Cerrar"><X size={20} /></button></div><form className="dashboard-event-form dashboard-project-form" onSubmit={saveProject}><div className={`dashboard-image-upload ${isDraggingImage ? "is-dragging" : ""}`} onClick={() => imageInputRef.current?.click()} onDragOver={(event) => { event.preventDefault(); setIsDraggingImage(true); }} onDragLeave={() => setIsDraggingImage(false)} onDrop={handleImageDrop} role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") imageInputRef.current?.click(); }}><input ref={imageInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(event) => loadImage(event.target.files?.[0])} />{selectedImage ? <><img src={selectedImage} alt="Vista previa del proyecto" /><div className="dashboard-image-upload__overlay"><Upload size={18} /><span>Cambiar imagen</span></div><button type="button" className="dashboard-image-upload__remove" onClick={(event) => { event.stopPropagation(); setSelectedImage(undefined); if (imageInputRef.current) imageInputRef.current.value = ""; }} aria-label="Quitar imagen"><X size={16} /></button></> : <div className="dashboard-image-upload__empty"><ImagePlus size={25} /><strong>Agrega una imagen del proyecto</strong><span>Haz clic o arrastra la imagen aquí</span><small>Opcional · PNG, JPG o WEBP · Máximo 3 MB</small></div>}</div><label>Título del proyecto<input name="titulo" defaultValue={editingProject?.titulo} required autoFocus /></label><label>Descripción<textarea name="descripcion" defaultValue={editingProject?.descripcion} rows={4} placeholder="" required /></label><label>Autores o equipo<input name="autores" defaultValue={editingProject?.autores} placeholder="" required /></label><div className=""><label>Carrera<DashboardSelect name="" defaultValue={editingProject?.categoria ?? ""} placeholder="" options={projectCategories.map((category) => ({ value: category, label: category }))} /></label></div><label>Tecnologías utilizadas<input name="tecnologias" defaultValue={editingProject?.tecnologias.join(", ")} placeholder="" /><small>Sepáralas con comas.</small></label><label>Enlace del proyecto<input name="enlace" type="url" defaultValue={editingProject?.enlace ?? ""} placeholder="https://..." /></label><div className="dashboard-modal__footer"><button type="button" onClick={() => setFormOpen(false)}>Cancelar</button><button className="dashboard-primary-button" type="submit">{editingProject ? "Guardar cambios" : "Publicar proyecto"}<ArrowUpRight size={17} /></button></div></form></section></div>}

    {viewingProject && <div className="dashboard-modal-backdrop" role="presentation" onMouseDown={() => setViewingProject(null)}><section className="dashboard-modal dashboard-view-modal dashboard-project-view-modal" role="dialog" aria-modal="true" aria-labelledby="project-view-title" onMouseDown={(event) => event.stopPropagation()}><div className="dashboard-modal__header"><div><p className="dashboard-eyebrow">PROYECTO DESTACADO</p><h2 id="project-view-title">{viewingProject.titulo}</h2></div><button onClick={() => setViewingProject(null)} aria-label="Cerrar"><X size={20} /></button></div><div className="dashboard-view-image">{viewingProject.imagen_url ? <img src={viewingProject.imagen_url} alt={`Imagen de ${viewingProject.titulo}`} /> : <div className="dashboard-view-image__empty"><Code2 size={25} /><span>Este proyecto no tiene imagen</span></div>}</div><div className="dashboard-view-description"><strong>Descripción</strong><p>{viewingProject.descripcion}</p></div><div className="dashboard-view-details"><p><Users size={18} /><span><strong>Autores</strong>{viewingProject.autores}</span></p>{viewingProject.carrera && <p><FolderKanban size={18} /><span><strong>Carrera</strong>{viewingProject.carrera}</span></p>}{viewingProject.categoria && <p><Code2 size={18} /><span><strong>Categoría</strong>{viewingProject.categoria}</span></p>}<p><Code2 size={18} /><span><strong>Tecnologías</strong>{viewingProject.tecnologias.length ? viewingProject.tecnologias.join(" · ") : "No especificadas"}</span></p></div><div className="dashboard-modal__footer"><button type="button" onClick={() => setViewingProject(null)}>Cerrar</button>{viewingProject.enlace && <a className="dashboard-primary-button" href={viewingProject.enlace} target="_blank" rel="noreferrer">Ver proyecto<ExternalLink size={16} /></a>}<button className="dashboard-primary-button" onClick={() => { setViewingProject(null); openEditor(viewingProject); }}><Pencil size={16} />Editar</button></div></section></div>}
  </main>;
}
