import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { 
  ChevronLeft, ChevronRight, LayoutDashboard, CalendarDays, Users, 
  LogOut, Menu, X, Upload, FileText, CheckCircle2, AlertCircle 
} from "lucide-react";
import { AnimatedThemeToggler } from "../components/ui/AnimatedThemeToggler";
import { supabase } from "../lib/supabase";
import "../components/dashboard/Dashboard.css";
import "../components/dashboard/DashboardOverrides.css";
import { showDashboardAlert } from "../lib/dashboardAlerts";

type CsvRow = {
  matricula: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  carrera: string;
  fecha_nacimiento: string;
};

export default function PadronAdmin() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const [csvData, setCsvData] = useState<CsvRow[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseCSV = (text: string) => {
    const lines = text.split('\n');
    const result: CsvRow[] = [];
    
    // Ignoramos la primera línea si asumimos que tiene los encabezados
    // Formato esperado: Matricula,Nombre,ApellidoPaterno,ApellidoMaterno,Carrera,FechaNacimiento
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const cols = line.split(',');
      if (cols.length >= 6) {
        result.push({
          matricula: cols[0].trim(),
          nombre: cols[1].trim(),
          apellido_paterno: cols[2].trim(),
          apellido_materno: cols[3].trim(),
          carrera: cols[4].trim(),
          fecha_nacimiento: cols[5].trim()
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
    reader.onload = (e) => {
      const text = e.target?.result as string;
      parseCSV(text);
    };
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
      // Usamos el cliente de supabase directamente. La política RLS que creamos
      // permite a los admins insertar datos.
      const { error } = await supabase
        .from('padron_alumnos')
        .upsert(csvData, { onConflict: 'matricula' });

      if (error) throw error;
      
      void showDashboardAlert({ 
        icon: "success", 
        title: "Padrón actualizado", 
        text: `Se cargaron ${csvData.length} registros exitosamente.` 
      });
      setCsvData([]); // Limpiar tras cargar
    } catch (err: any) {
      void showDashboardAlert({ 
        icon: "error", 
        title: "Error al subir padrón", 
        text: err.message || "Ocurrió un error inesperado." 
      });
    } finally {
      setIsUploading(false);
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
              <p>Carga la base de datos oficial para que los alumnos puedan registrarse.</p>
            </div>
          </div>

          <section className="dashboard-events dashboard-events--standalone" style={{ padding: "2rem", background: "var(--card)", borderRadius: "1rem", border: "1px solid var(--line)" }}>
            
            {csvData.length === 0 ? (
              <div 
                className={`dashboard-image-upload ${isDragging ? "is-dragging" : ""}`}
                style={{ padding: "4rem 2rem" }}
                onClick={() => fileInputRef.current?.click()} 
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} 
                onDragLeave={() => setIsDragging(false)} 
                onDrop={handleDrop} 
                role="button"
                tabIndex={0}
              >
                <input ref={fileInputRef} type="file" accept=".csv" className="sr-only" onChange={(e) => handleFileUpload(e.target.files?.[0])} />
                <div className="dashboard-image-upload__empty">
                  <Upload size={32} />
                  <strong>Sube el archivo CSV del padrón</strong>
                  <span>Haz clic o arrastra el archivo aquí</span>
                  <small>Formato: Matricula, Nombre, Paterno, Materno, Carrera, YYYY-MM-DD</small>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <FileText size={24} color="var(--green)" />
                    <div>
                      <h3 style={{ margin: 0, fontSize: "1.1rem" }}>Archivo cargado</h3>
                      <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)" }}>{csvData.length} alumnos detectados listos para importar.</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "1rem" }}>
                    <button 
                      onClick={() => setCsvData([])} 
                      style={{ padding: "0.5rem 1rem", borderRadius: "0.5rem", border: "1px solid var(--line)", background: "transparent", cursor: "pointer", color: "var(--text)" }}
                    >
                      Cancelar
                    </button>
                    <button 
                      onClick={uploadToSupabase} 
                      disabled={isUploading}
                      className="dashboard-primary-button"
                    >
                      {isUploading ? "Importando..." : "Confirmar Importación"}
                    </button>
                  </div>
                </div>

                <div style={{ overflowX: "auto", border: "1px solid var(--line)", borderRadius: "0.5rem" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
                    <thead style={{ background: "color-mix(in srgb, var(--bg) 50%, transparent)", borderBottom: "1px solid var(--line)" }}>
                      <tr>
                        <th style={{ padding: "0.75rem 1rem" }}>Matrícula</th>
                        <th style={{ padding: "0.75rem 1rem" }}>Nombre Completo</th>
                        <th style={{ padding: "0.75rem 1rem" }}>Carrera</th>
                        <th style={{ padding: "0.75rem 1rem" }}>Fecha Nacimiento</th>
                      </tr>
                    </thead>
                    <tbody>
                      {csvData.slice(0, 10).map((row, idx) => (
                        <tr key={idx} style={{ borderBottom: "1px solid var(--line)" }}>
                          <td style={{ padding: "0.75rem 1rem" }}><strong>{row.matricula}</strong></td>
                          <td style={{ padding: "0.75rem 1rem" }}>{row.nombre} {row.apellido_paterno} {row.apellido_materno}</td>
                          <td style={{ padding: "0.75rem 1rem" }}>{row.carrera}</td>
                          <td style={{ padding: "0.75rem 1rem", color: "var(--text-muted)" }}>{row.fecha_nacimiento}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {csvData.length > 10 && (
                  <p style={{ textAlign: "center", fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "1rem" }}>
                    Mostrando los primeros 10 registros de {csvData.length}.
                  </p>
                )}
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
