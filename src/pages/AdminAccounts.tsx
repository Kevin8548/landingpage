import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, Check, ChevronLeft, ChevronRight, Copy, FolderKanban, KeyRound, LayoutDashboard, LogOut, Menu, Plus, ShieldCheck, Users, X } from "lucide-react";
import { AnimatedThemeToggler } from "../components/ui/AnimatedThemeToggler";
import { createAdminAccount } from "../services/adminAccounts";
import { setAdminAuthenticated } from "../lib/adminAuth";
import { supabase } from "../lib/supabase";
import { useDashboardSidebar } from "../lib/useDashboardSidebar";
import "../components/dashboard/Dashboard.css";
import "../components/dashboard/DashboardOverrides.css";

export default function AdminAccounts() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useDashboardSidebar();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState<{ email: string; temporaryPassword: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setLoading(true); setError(""); setCreated(null); setCopied(false);
    try { setCreated(await createAdminAccount(email)); setEmail(""); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "No se pudo crear la cuenta."); }
    finally { setLoading(false); }
  };
  const copyPassword = async () => {
    if (!created) return;
    try { await navigator.clipboard.writeText(created.temporaryPassword); setCopied(true); }
    catch { setError("No se pudo copiar. Selecciona y copia la contraseña temporal manualmente."); }
  };
  const signOut = async () => { await supabase.auth.signOut(); setAdminAuthenticated(false); window.location.assign(import.meta.env.BASE_URL); };
  return <main className="dashboard-page">
    <aside className={`dashboard-sidebar ${sidebarOpen ? "is-open" : ""} ${collapsed ? "is-collapsed" : ""}`}><button className="dashboard-sidebar-collapse" onClick={() => setCollapsed((value) => !value)} aria-label={collapsed ? "Expandir menú" : "Contraer menú"}>{collapsed ? <ChevronRight size={18}/> : <ChevronLeft size={18}/>}</button><div className="dashboard-brand"><span className="dashboard-brand__mark">UTT</span><span>Universidad Tecnológica<br/>de Tlaxcala</span><button className="dashboard-sidebar__close" onClick={() => setSidebarOpen(false)} aria-label="Cerrar menú"><X size={19}/></button></div><nav className="dashboard-nav" aria-label="Navegación del panel"><Link to="/dashboard"><LayoutDashboard size={18}/>Resumen</Link><Link to="/dashboard/eventos"><CalendarDays size={18}/>Eventos</Link><Link to="/dashboard/proyectos"><FolderKanban size={18}/>Proyectos</Link><Link to="/dashboard/padron"><Users size={18}/>Padrón de Alumnos</Link><Link className="is-active" to="/dashboard/administradores"><ShieldCheck size={18}/>Administradores</Link><Link to="/dashboard/eventos?crear=1"><Plus size={18}/>Crear evento</Link></nav><div className="dashboard-sidebar__bottom"><div className="dashboard-profile"><span className="dashboard-avatar">AD</span><div><strong>Administrador</strong><small>Control de accesos</small></div></div><button type="button" onClick={() => void signOut()} className="dashboard-signout"><LogOut size={17}/>Salir al sitio</button></div></aside>
    <section className="dashboard-content"><header className="dashboard-topbar"><button className="dashboard-menu-button" onClick={() => setSidebarOpen(true)} aria-label="Abrir menú"><Menu size={21}/></button><div className="dashboard-breadcrumb"><Link to="/dashboard">Panel</Link><span>/</span><strong>Administradores</strong></div><div className="dashboard-topbar__actions"><AnimatedThemeToggler className="dashboard-theme-toggle"/><span className="dashboard-avatar dashboard-avatar--small">AD</span></div></header>
      <div className="dashboard-body"><div className="dashboard-welcome"><div><p className="dashboard-eyebrow"><ShieldCheck size={14}/> ACCESO Y SEGURIDAD</p><h1>Administradores<span>.</span></h1><p>Habilita el acceso de profesores y personal organizador.</p></div></div>
        <section className="dashboard-events dashboard-admin-create"><div className="dashboard-section-heading"><div><p>ALTA AUTORIZADA</p><h2>Crear cuenta administrativa</h2></div><KeyRound size={20}/></div>
          <p className="dashboard-admin-copy">No hay registro público para administración. El responsable del sistema crea la primera cuenta; después, cualquier administrador vigente puede habilitar a otro integrante del equipo.</p>
          {error && <p className="auth-message" role="alert">{error}</p>}
          {!created ? <form onSubmit={submit} className="dashboard-event-form"><label>Correo de la persona autorizada<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="off" placeholder="nombre@institucion.edu.mx" required/></label><p className="dashboard-admin-copy">Se generará una contraseña temporal de un solo uso en esta pantalla. Entrégala directamente a la persona; al iniciar sesión tendrá que cambiarla antes de entrar al panel.</p><button type="submit" className="dashboard-primary-button" disabled={loading}>{loading ? "Creando cuenta…" : "Crear acceso"}<ShieldCheck size={16}/></button></form> : <div className="dashboard-admin-credential"><span className="dashboard-status"><i/> Cuenta creada</span><strong>{created.email}</strong><p>Entrega esta contraseña temporal directamente a la persona. Solo se muestra ahora y deberá cambiarla al iniciar sesión.</p><code>{created.temporaryPassword}</code><button type="button" className="dashboard-primary-button" onClick={() => void copyPassword()}>{copied ? <Check size={16}/> : <Copy size={16}/>}{copied ? "Copiada" : "Copiar contraseña"}</button><button type="button" className="dashboard-admin-again" onClick={() => setCreated(null)}>Crear otra cuenta</button></div>}
        </section>
      </div>
    </section>
  </main>;
}
