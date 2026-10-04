import { useState, useRef, useEffect, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { 
  ChevronLeft, ChevronRight, ChevronDown, LayoutDashboard, CalendarDays, FolderKanban, Users, 
  LogOut, Menu, X, Upload, FileText, Plus, Pencil, Trash2, Search, Download 
} from "lucide-react";
import { AnimatedThemeToggler } from "../components/ui/AnimatedThemeToggler";
import { supabase } from "../lib/supabase";
import "../components/dashboard/Dashboard.css";
import "../components/dashboard/DashboardOverrides.css";
import { showDashboardAlert } from "../lib/dashboardAlerts";
import DashboardSelect from "../components/dashboard/DashboardSelect";

type Alumno = {
  id?: string;
  matricula: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  carrera: string;
  grado: string;
  grupo: string;
  fecha_nacimiento: string;
  registrado?: boolean;
};

const dateFromValue = (value: string) => value ? new Date(`${value}T12:00:00`) : new Date();
const dateToValue = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

function BirthDatePicker({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => dateFromValue(value));
  const firstDay = (new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay() + 6) % 7;
  const totalDays = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const label = value ? value.split("-").reverse().join("/") : "Selecciona una fecha";

  return <div className="event-inline-picker dashboard-birth-date-picker">
    <button type="button" className="event-inline-picker__trigger" onClick={() => { setViewDate(dateFromValue(value)); setIsOpen((current) => !current); }} aria-expanded={isOpen} aria-haspopup="dialog"><CalendarDays size={14} /><span>{label}</span><ChevronDown className="dashboard-birth-date-picker__chevron" size={15} aria-hidden="true" /></button>
    {isOpen && <div className="event-inline-picker__menu event-inline-calendar" role="dialog" aria-label="Seleccionar fecha de nacimiento">
      <header><button type="button" onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))} aria-label="Mes anterior">‹</button><strong>{new Intl.DateTimeFormat("es-MX", { month: "long", year: "numeric" }).format(viewDate)}</strong><button type="button" onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))} aria-label="Mes siguiente">›</button></header>
      <div className="event-inline-calendar__week">{["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"].map((day) => <span key={day}>{day}</span>)}</div>
      <div className="event-inline-calendar__days">{Array.from({ length: firstDay + totalDays }, (_, index) => { if (index < firstDay) return <i key={`empty-${index}`} />; const day = index - firstDay + 1; const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day, 12); const nextValue = dateToValue(date); return <button type="button" key={nextValue} className={nextValue === value ? "is-selected" : ""} onClick={() => { onChange(nextValue); setIsOpen(false); }}>{day}</button>; })}</div>
    </div>}
  </div>;
}

export default function PadronAdmin() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Estado principal
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  // Efecto para regresar a la página 1 cada que se usa el buscador
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);
  
  // Modales
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingAlumno, setEditingAlumno] = useState<Alumno | null>(null);
  const [selectedBirthDate, setSelectedBirthDate] = useState("");

  // Estados del CSV
  const [csvData, setCsvData] = useState<Alumno[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  

  useEffect(() => {
    fetchAlumnos();
  }, []);

  const fetchAlumnos = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('padron_alumnos')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (!error && data) {
      setAlumnos(data);
    }
    setIsLoading(false);
  };

  // Función auxiliar para quitar acentos y pasar a minúsculas
  const normalizeText = (text: string) => {
    if (!text) return "";
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  };
  // Filtrado en tiempo real
  const filteredAlumnos = alumnos.filter(a => {
    if (!searchTerm.trim()) return true;
    
    // Separamos lo que el usuario escribió en palabras individuales
    // Ej: "josé 3A" -> ["jose", "3a"]
    const searchTerms = normalizeText(searchTerm).split(/\s+/).filter(Boolean);
    
    // Creamos una "súper cadena" gigante con toda la información del alumno
    // Incluimos `${a.grado}${a.grupo}` pegado para que si buscan "3A", lo encuentre.
    const alumnoData = normalizeText(`
      ${a.matricula} 
      ${a.nombre} ${a.apellido_paterno} ${a.apellido_materno} 
      ${a.carrera} 
      ${a.grado} ${a.grupo} 
      ${a.grado}${a.grupo}
    `);
    
    // Condición: El alumno se muestra SOLO si TODAS las palabras que el usuario escribió
    // se encuentran en la "súper cadena" de datos, sin importar el orden.
    return searchTerms.every(term => alumnoData.includes(term));
  });

  const totalPages = Math.ceil(filteredAlumnos.length / ITEMS_PER_PAGE);
  const currentAlumnos = filteredAlumnos.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

    const exportToCSV = () => {
    if (filteredAlumnos.length === 0) return;

    const headers = ["Matricula", "Nombre", "Apellido Paterno", "Apellido Materno", "Carrera", "Grado", "Grupo", "Fecha Nacimiento", "Estado"];
    
    const rows = filteredAlumnos.map(a => [
      a.matricula, a.nombre, a.apellido_paterno, a.apellido_materno, 
      a.carrera, a.grado, a.grupo, a.fecha_nacimiento, 
      a.registrado ? "Activa" : "Pendiente"
    ]);

    // Unir todo y escapar comillas por si un nombre lleva símbolos
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(field => `"${String(field || "").replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    // El '\uFEFF' es un truco técnico para que Microsoft Excel lea perfectamente los acentos (UTF-8 BOM)
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    
    // Si buscaste algo, el archivo se llamará "Padron_3A.csv", sino "Padron_Completo.csv"
    const fileName = searchTerm ? `Padron_${searchTerm.trim().replace(/\s+/g, "_")}.csv` : "Padron_Completo.csv";
    link.setAttribute("download", fileName);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const parseCSV = (text: string) => {
    const lines = text.split('\n');
    const result: Alumno[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const cols = line.split(',');
      if (cols.length >= 8) {
        result.push({
          matricula: cols[0].trim(),
          nombre: cols[1].trim(),
          apellido_paterno: cols[2].trim(),
          apellido_materno: cols[3].trim(),
          carrera: cols[4].trim(),
          grado: cols[5].trim(),
          grupo: cols[6].trim().toUpperCase(),
          fecha_nacimiento: cols[7].trim()
        });
      }
    }
    setCsvData(result);
  };

  const handleFileUpload = (file?: File) => {
    if (!file) return;
    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      void showDashboardAlert({ icon: "warning", title: "Archivo inválido", text: "Por favor sube un archivo CSV." });
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => parseCSV(e.target?.result as string);
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files[0]);
  };

  const uploadToSupabase = async () => {
    if (csvData.length === 0) return;
    setIsUploading(true);
    try {
      const { error } = await supabase.from('padron_alumnos').upsert(csvData, { onConflict: 'matricula' });
      if (error) throw error;
      
      void showDashboardAlert({ icon: "success", title: "Padrón actualizado", text: `Se cargaron ${csvData.length} registros exitosamente.` });
      setCsvData([]);
      setIsCsvModalOpen(false);
      fetchAlumnos(); 
    } catch (err: any) {
      void showDashboardAlert({ icon: "error", title: "Error al subir padrón", text: err.message });
    } finally {
      setIsUploading(false);
    }
  };

  const openCreator = () => {
    setEditingAlumno(null);
    setSelectedBirthDate("");
    setIsFormModalOpen(true);
  };

  const openEditor = (alumno: Alumno) => {
    setEditingAlumno(alumno);
    setSelectedBirthDate(alumno.fecha_nacimiento);
    setIsFormModalOpen(true);
  };

  const saveAlumno = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const payload = {
      matricula: formData.get("matricula") as string,
      nombre: formData.get("nombre") as string,
      apellido_paterno: formData.get("apellido_paterno") as string,
      apellido_materno: formData.get("apellido_materno") as string,
      carrera: formData.get("carrera") as string,
      grado: formData.get("grado") as string,
      grupo: formData.get("grupo") as string,
      fecha_nacimiento: formData.get("fecha_nacimiento") as string,
    };

    if (!payload.carrera || !payload.grado || !payload.grupo || !payload.fecha_nacimiento) {
      void showDashboardAlert({ icon: "warning", title: "Completa los campos pendientes" });
      return;
    }

    try {
      let error;
      if (editingAlumno?.id) {
        const res = await supabase.from('padron_alumnos').update(payload).eq('id', editingAlumno.id);
        error = res.error;
      } else {
        const res = await supabase.from('padron_alumnos').insert(payload);
        error = res.error;
      }

      if (error) throw error;

      void showDashboardAlert({ 
        icon: "success", 
        title: editingAlumno ? "Alumno actualizado" : "Alumno creado", 
        showConfirmButton: false, 
        timer: 1500 
      });
      setIsFormModalOpen(false);
      fetchAlumnos();
    } catch (err: any) {
      void showDashboardAlert({ icon: "error", title: "Error al guardar", text: err.message });
    }
  };

  const deleteAlumno = async (id: string, nombre: string) => {
    const result = await showDashboardAlert({
      icon: "warning",
      title: "Confirmar eliminación",
      text: `Escribe ELIMINAR para borrar permanentemente a ${nombre}.`,
      input: "text",
      inputPlaceholder: "ELIMINAR",
      inputValidator: (value) => value === "ELIMINAR" ? undefined : "Escribe ELIMINAR exactamente, en mayúsculas, para continuar.",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar"
    });

    if (result.isConfirmed && result.value === "ELIMINAR") {
      const { error } = await supabase.from('padron_alumnos').delete().eq('id', id);
      if (error) {
        void showDashboardAlert({ icon: "error", title: "Error al eliminar", text: error.message });
      } else {
        fetchAlumnos();
      }
    }
  };

  return (
    <main className="dashboard-page">
      <aside className={`dashboard-sidebar ${isSidebarOpen ? "is-open" : ""} ${isSidebarCollapsed ? "is-collapsed" : ""}`}>
        <button className="dashboard-sidebar-collapse" onClick={() => setSidebarCollapsed((v) => !v)}>
          {isSidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
        <div className="dashboard-brand">
          <span className="dashboard-brand__mark">UTT</span>
          <span>Universidad Tecnológica<br />de Tlaxcala</span>
          <button className="dashboard-sidebar__close" onClick={() => setSidebarOpen(false)}><X size={19}/></button>
        </div>
        <nav className="dashboard-nav">
          <Link to="/dashboard"><LayoutDashboard size={18}/>Resumen</Link>
          <Link to="/dashboard/eventos"><CalendarDays size={18}/>Eventos</Link>
          <Link to="/dashboard/proyectos"><FolderKanban size={18}/>Proyectos</Link>
          <Link className="is-active" to="/dashboard/padron"><Users size={18}/>Padrón de Alumnos</Link>
        </nav>
        <div className="dashboard-sidebar__bottom">
          <div className="dashboard-profile"><span className="dashboard-avatar">AD</span><div><strong>Administrador</strong><small>Panel principal</small></div></div>
          <Link to="/" className="dashboard-signout"><LogOut size={17}/>Salir al sitio</Link>
        </div>
      </aside>

      <section className="dashboard-content">
        <header className="dashboard-topbar">
          <button className="dashboard-menu-button" onClick={() => setSidebarOpen(true)}><Menu size={21}/></button>
          <div className="dashboard-breadcrumb"><Link to="/dashboard">Panel</Link><span>/</span><strong>Padrón</strong></div>
          <div className="dashboard-topbar__actions"><AnimatedThemeToggler className="dashboard-theme-toggle" /><span className="dashboard-avatar dashboard-avatar--small">AD</span></div>
        </header>
        
        <div className="dashboard-body">
          <div className="dashboard-welcome">
            <div>
              <p className="dashboard-eyebrow"><Users size={14}/> GESTIÓN DE USUARIOS</p>
              <h1>Padrón de Alumnos<span>.</span></h1>
              <p>Administra la base de datos oficial para que los alumnos puedan registrarse.</p>
            </div>
            <div className="padron-header-actions">
              <button className="dashboard-secondary-button" onClick={() => setIsCsvModalOpen(true)}>
                <Upload size={18}/> Importar CSV
              </button>
              <button className="dashboard-primary-button" onClick={openCreator}>
                <Plus size={18}/> Nuevo alumno
              </button>
            </div>
          </div>

          <section className="dashboard-events dashboard-events--standalone">
            <div className="dashboard-section-heading padron-section-heading">
              <div>
                <p>LISTADO GENERAL</p>
                <h2>{filteredAlumnos.length} {filteredAlumnos.length === 1 ? "alumno" : "alumnos"} {searchTerm ? "filtrados" : "registrados"}</h2>
              </div>
              
              <div className="padron-toolbar">
                {/* Buscador */}
                <div className="padron-search">
                  <Search size={18} />
                  <input 
                    type="text"
                    placeholder="Buscar alumno, matrícula, carrera..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="padron-search__input"
                  />
                </div>
                
                {/* Botón de Exportar */}
                <button 
                  onClick={exportToCSV}
                  disabled={filteredAlumnos.length === 0}
                  className="padron-csv-button"
                >
                  <Download size={18} />
                  Exportar CSV
                </button>
              </div>
            </div>

            <div className="dashboard-event-list" aria-busy={isLoading}>
              {isLoading ? (
                <div className="padron-table-placeholder" aria-label="Cargando padrón">{Array.from({ length: 6 }, (_, index) => <i className="placeholder-glow" key={index} />)}</div>
              ) : alumnos.length === 0 ? (
                <div style={{ padding: "3rem", textAlign: "center", border: "1px dashed var(--line)", borderRadius: "1rem", marginTop: "1rem" }}>
                  <Users size={32} style={{ margin: "0 auto 1rem", opacity: 0.5 }} />
                  <p>Aún no hay alumnos en el padrón.</p>
                  <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginTop: "1rem" }}>
                    <button onClick={() => setIsCsvModalOpen(true)} style={{ color: "var(--orange)", textDecoration: "underline", background: "none", border: "none", cursor: "pointer", padding: 0 }}>Sube un CSV</button>
                  </div>
                </div>
              ) : filteredAlumnos.length === 0 ? (
                <p style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>No se encontraron alumnos con esa búsqueda.</p>
              ) : (
                <div className="padron-table-wrap">
                  <table className="padron-table">
                    <thead>
                      <tr>
                        <th>Matrícula</th><th>Nombre completo</th><th>Carrera</th><th>Grado y grupo</th><th>Estado</th><th className="padron-table__actions">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentAlumnos.map((alumno) => (
                        <tr key={alumno.id}>
                          <td><strong>{alumno.matricula}</strong></td><td>{alumno.nombre} {alumno.apellido_paterno} {alumno.apellido_materno}</td><td className="padron-table__muted">{alumno.carrera}</td><td>{alumno.grado}° "{alumno.grupo}"</td><td>
                            {alumno.registrado ? (
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", fontSize: "0.75rem", background: "color-mix(in srgb, var(--green) 15%, transparent)", color: "var(--green)", padding: "0.2rem 0.6rem", borderRadius: "1rem", fontWeight: 600 }}>Activa</span>
                            ) : (
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", fontSize: "0.75rem", background: "color-mix(in srgb, var(--ink) 10%, transparent)", color: "var(--text-muted)", padding: "0.2rem 0.6rem", borderRadius: "1rem", fontWeight: 600 }}>Pendiente</span>
                            )}
                          </td>
                          <td style={{ padding: "1rem", textAlign: "right", display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                            <button className="padron-action-button" onClick={() => openEditor(alumno)} aria-label="Editar">
                              <Pencil size={15} />
                            </button>
                            <button className="padron-action-button is-danger" onClick={() => alumno.id && deleteAlumno(alumno.id, alumno.nombre)} aria-label="Eliminar">
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                    {totalPages > 1 && (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", borderTop: "1px solid var(--line)", background: "color-mix(in srgb, var(--bg) 50%, transparent)" }}>
                      <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                        Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredAlumnos.length)} de {filteredAlumnos.length}
                      </span>
                      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        <button 
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          style={{ padding: "0.4rem 0.8rem", borderRadius: "0.3rem", border: "1px solid var(--line)", background: currentPage === 1 ? "transparent" : "var(--card)", color: currentPage === 1 ? "var(--text-muted)" : "var(--text)", cursor: currentPage === 1 ? "not-allowed" : "pointer" }}
                        >
                          Anterior
                        </button>
                        <span style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem", fontWeight: 600, color: "var(--text)" }}>
                          Página {currentPage} de {totalPages}
                        </span>
                        <button 
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                          style={{ padding: "0.4rem 0.8rem", borderRadius: "0.3rem", border: "1px solid var(--line)", background: currentPage === totalPages ? "transparent" : "var(--card)", color: currentPage === totalPages ? "var(--text-muted)" : "var(--text)", cursor: currentPage === totalPages ? "not-allowed" : "pointer" }}
                        >
                          Siguiente
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>
      </section>

      {isFormModalOpen && (
        <div className="dashboard-modal-backdrop" onMouseDown={() => setIsFormModalOpen(false)}>
          <section className="dashboard-modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="dashboard-modal__header">
              <div>
                <p className="dashboard-eyebrow">{editingAlumno ? "EDITAR ALUMNO" : "NUEVO ALUMNO"}</p>
                <h2>{editingAlumno ? "Actualiza los datos" : "Ingresa los datos manualmente"}</h2>
              </div>
              <button onClick={() => setIsFormModalOpen(false)}><X size={20} /></button>
            </div>
            
            <form onSubmit={saveAlumno} className="dashboard-event-form padron-student-form">
              <label>Matrícula
                <input name="matricula" defaultValue={editingAlumno?.matricula} required />
              </label>
              
              <div className="dashboard-form-grid">
                <label>Nombre(s) <input name="nombre" defaultValue={editingAlumno?.nombre} required /></label>
                <label>Fecha Nac.
                  <input type="hidden" name="fecha_nacimiento" value={selectedBirthDate} required />
                  <BirthDatePicker value={selectedBirthDate} onChange={setSelectedBirthDate} />
                </label>
              </div>

              <div className="dashboard-form-grid">
                <label>A. Paterno <input name="apellido_paterno" defaultValue={editingAlumno?.apellido_paterno} required /></label>
                <label>A. Materno <input name="apellido_materno" defaultValue={editingAlumno?.apellido_materno} /></label>
              </div>

              <label>Carrera
                <DashboardSelect name="carrera" defaultValue={editingAlumno?.carrera || ""} placeholder="Selecciona una carrera" options={[
                  { value: "TSU en Desarrollo de Software", label: "TSU en Desarrollo de Software" },
                  { value: "TSU en Redes y Ciberseguridad", label: "TSU en Redes y Ciberseguridad" },
                  { value: "TSU en Entornos Virtuales", label: "TSU en Entornos Virtuales" },
                  { value: "Ingeniería en TI e Innovación Digital", label: "Ingeniería en TI e Innovación Digital" },
                ]} />
              </label>

              <div className="dashboard-form-grid">
                <label>Grado
                  <DashboardSelect name="grado" defaultValue={editingAlumno?.grado || ""} placeholder="Selecciona..." options={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => ({ value: String(num), label: `${num}°` }))} />
                </label>
                <label>Grupo
                  <DashboardSelect name="grupo" defaultValue={editingAlumno?.grupo || ""} placeholder="Selecciona..." options={"ABCD".split("").map((letter) => ({ value: letter, label: letter }))} />
                </label>
              </div>

              <div className="dashboard-modal__footer">
                <button type="button" onClick={() => setIsFormModalOpen(false)}>Cancelar</button>
                <button className="dashboard-primary-button" type="submit">
                  {editingAlumno ? "Guardar cambios" : "Crear alumno"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {isCsvModalOpen && (
        <div className="dashboard-modal-backdrop" onMouseDown={() => setIsCsvModalOpen(false)}>
          <section className="dashboard-modal" style={{ maxWidth: "700px" }} onMouseDown={(e) => e.stopPropagation()}>
            <div className="dashboard-modal__header">
              <div>
                <p className="dashboard-eyebrow">CARGA MASIVA</p>
                <h2>Importar archivo CSV</h2>
              </div>
              <button onClick={() => { setIsCsvModalOpen(false); setCsvData([]); }}><X size={20} /></button>
            </div>
            
            <div style={{ padding: "1.5rem" }}>
              {csvData.length === 0 ? (
                <div 
                  className={`dashboard-image-upload ${isDragging ? "is-dragging" : ""}`}
                  style={{ padding: "4rem 2rem", margin: 0 }}
                  onClick={() => fileInputRef.current?.click()} 
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} 
                  onDragLeave={() => setIsDragging(false)} 
                  onDrop={handleDrop} 
                >
                  <input ref={fileInputRef} type="file" accept=".csv" className="sr-only" onChange={(e) => handleFileUpload(e.target.files?.[0])} />
                  <div className="dashboard-image-upload__empty">
                    <Upload size={32} />
                    <strong>Sube el archivo CSV del padrón</strong>
                    <span>Haz clic o arrastra el archivo aquí</span>
                    <small>Formato: Matricula, Nombre, Paterno, Materno, Carrera, Grado, Grupo, FechaNacimiento</small>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                    <FileText size={24} color="var(--green)" />
                    <div>
                      <h3 style={{ margin: 0, fontSize: "1.1rem" }}>Archivo cargado</h3>
                      <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)" }}>{csvData.length} alumnos detectados listos para importar.</p>
                    </div>
                  </div>
                  <div style={{ overflowX: "auto", border: "1px solid var(--line)", borderRadius: "0.5rem", maxHeight: "250px" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
                      <thead style={{ position: "sticky", top: 0, background: "var(--bg)", borderBottom: "1px solid var(--line)" }}>
                        <tr>
                          <th style={{ padding: "0.5rem 1rem" }}>Matrícula</th>
                          <th style={{ padding: "0.5rem 1rem" }}>Nombre</th>
                          <th style={{ padding: "0.5rem 1rem" }}>Grado y Grupo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {csvData.slice(0, 5).map((row, idx) => (
                          <tr key={idx} style={{ borderBottom: "1px solid var(--line)" }}>
                            <td style={{ padding: "0.5rem 1rem" }}><strong>{row.matricula}</strong></td>
                            <td style={{ padding: "0.5rem 1rem" }}>{row.nombre} {row.apellido_paterno}</td>
                            <td style={{ padding: "0.5rem 1rem" }}>{row.grado}° "{row.grupo}"</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="dashboard-modal__footer">
              <button type="button" onClick={() => { setIsCsvModalOpen(false); setCsvData([]); }}>Cancelar</button>
              {csvData.length > 0 && (
                <button className="dashboard-primary-button" onClick={uploadToSupabase} disabled={isUploading}>
                  {isUploading ? "Importando..." : "Confirmar Importación"}
                </button>
              )}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
