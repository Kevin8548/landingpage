import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link, Navigate } from "react-router-dom";
import { CalendarDays, Check, ChevronLeft, ChevronRight, Copy, FolderKanban, KeyRound, LayoutDashboard, LogOut, Menu, Plus, Search, ShieldCheck, Trash2, Users, X } from "lucide-react";
import { AnimatedThemeToggler } from "../components/ui/AnimatedThemeToggler";
import { showDashboardAlert } from "../lib/dashboardAlerts";
import { setAdminAuthenticated } from "../lib/adminAuth";
import { supabase } from "../lib/supabase";
import { userFacingError } from "../lib/userFacingErrors";
import { useDashboardSidebar } from "../lib/useDashboardSidebar";
import { usePrimaryAdmin } from "../lib/usePrimaryAdmin";
import { useAdminName } from "../lib/useAdminName";
import { createAdminAccount, deleteAdminAccount, listAdminAccounts, updateCurrentAdminName, type AdminAccount, type AdminAccountInput } from "../services/adminAccounts";
import "../components/dashboard/Dashboard.css";
import "../components/dashboard/DashboardOverrides.css";

const emptyName = { nombre: "", apellido_paterno: "", apellido_materno: "" };

export default function AdminAccounts() {
  const isPrimaryAdmin = usePrimaryAdmin();
  const { fullName, setAdminName } = useAdminName();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useDashboardSidebar();
  const [form, setForm] = useState<AdminAccountInput>({ email: "", ...emptyName });
  const [myName, setMyName] = useState(emptyName);
  const [accounts, setAccounts] = useState<AdminAccount[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [principalId, setPrincipalId] = useState("");
  const [currentAdminId, setCurrentAdminId] = useState("");
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingMyName, setSavingMyName] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");
  const [accountsError, setAccountsError] = useState("");
  const [created, setCreated] = useState<{ email: string; nombre: string; apellido_paterno: string; apellido_materno: string; temporaryPassword: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const canManage = Boolean(principalId && currentAdminId && principalId === currentAdminId);
  const normalizedAdminSearch = searchTerm.trim().toLocaleLowerCase("es-MX").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const filteredAccounts = accounts.filter((account) => [account.nombre, account.apellido_paterno, account.apellido_materno, account.email]
    .some((value) => (value ?? "").toLocaleLowerCase("es-MX").normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(normalizedAdminSearch)));

  const refreshAccounts = useCallback(async () => {
    setLoadingAccounts(true);
    setAccountsError("");
    try {
      const result = await listAdminAccounts();
      setAccounts(result.accounts);
      setPrincipalId(result.primaryAdminId);
      setCurrentAdminId(result.currentAdminId);
      const mine = result.accounts.find((account) => account.id === result.currentAdminId);
      if (mine) {
        setMyName({
          nombre: mine.nombre ?? "",
          apellido_paterno: mine.apellido_paterno ?? "",
          apellido_materno: mine.apellido_materno ?? "",
        });
      }
    } catch (reason) {
      setAccountsError(userFacingError(reason, "No se pudo consultar la lista de administradores."));
    } finally {
      setLoadingAccounts(false);
    }
  }, []);

  useEffect(() => { void refreshAccounts(); }, [refreshAccounts]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true); setError(""); setCreated(null); setCopied(false);
    try {
      const result = await createAdminAccount({
        ...form,
        email: form.email.trim().toLowerCase(),
        nombre: form.nombre.trim(),
        apellido_paterno: form.apellido_paterno.trim(),
        apellido_materno: form.apellido_materno.trim(),
      });
      setCreated(result);
      setForm({ email: "", ...emptyName });
      await refreshAccounts();
    } catch (reason) {
      setError(userFacingError(reason, "No se pudo crear la cuenta. Verifica los datos e inténtalo de nuevo."));
    } finally {
      setSaving(false);
    }
  };

  const saveMyName = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setSavingMyName(true); setError("");
    try {
      await updateCurrentAdminName(myName);
      setAdminName([myName.nombre, myName.apellido_paterno, myName.apellido_materno].filter(Boolean).join(" "));
      await supabase.auth.getUser();
      await showDashboardAlert({ icon: "success", title: "Nombre actualizado" });
      await refreshAccounts();
    } catch (reason) {
      setError(userFacingError(reason, "No se pudo guardar tu nombre. Inténtalo de nuevo."));
    } finally {
      setSavingMyName(false);
    }
  };

  const copyPassword = async () => {
    if (!created) return;
    try { await navigator.clipboard.writeText(created.temporaryPassword); setCopied(true); }
    catch { setError("No se pudo copiar. Selecciona y copia la contraseña temporal manualmente."); }
  };

  const removeAccount = async (account: AdminAccount) => {
    const name = [account.nombre, account.apellido_paterno, account.apellido_materno].filter(Boolean).join(" ") || account.email;
    const confirmation = await showDashboardAlert({
      icon: "warning",
      title: "Confirmar eliminación",
      text: `Escribe ELIMINAR para revocar permanentemente el acceso de ${name}.`,
      input: "text",
      inputValidator: (value) => value === "ELIMINAR" ? undefined : "Escribe ELIMINAR exactamente, en mayúsculas, para continuar.",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    });
    if (!confirmation.isConfirmed || confirmation.value !== "ELIMINAR") return;
    setDeletingId(account.id); setAccountsError("");
    try {
      await deleteAdminAccount(account.id);
      setAccounts((current) => current.filter((item) => item.id !== account.id));
      await showDashboardAlert({ icon: "success", title: "Acceso eliminado", text: `Se revocó el acceso de ${name}.` });
    } catch (reason) {
      setAccountsError(userFacingError(reason, "No se pudo eliminar la cuenta. Inténtalo de nuevo."));
    } finally {
      setDeletingId("");
    }
  };

  const signOut = async () => { await supabase.auth.signOut(); setAdminAuthenticated(false); window.location.assign(import.meta.env.BASE_URL); };
  const updateForm = (key: keyof AdminAccountInput, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const updateMyName = (key: keyof typeof emptyName, value: string) => setMyName((current) => ({ ...current, [key]: value }));

  if (isPrimaryAdmin === false) return <Navigate to="/dashboard" replace/>;
  if (isPrimaryAdmin === null) return <main className="dashboard-page"><div className="dashboard-body"><p role="status">Verificando permisos…</p></div></main>;

  return <main className="dashboard-page">
    <aside className={`dashboard-sidebar ${sidebarOpen ? "is-open" : ""} ${collapsed ? "is-collapsed" : ""}`}>
      <button className="dashboard-sidebar-collapse" onClick={() => setCollapsed((value) => !value)} aria-label={collapsed ? "Expandir menú" : "Contraer menú"}>{collapsed ? <ChevronRight size={18}/> : <ChevronLeft size={18}/>}</button>
      <div className="dashboard-brand"><span className="dashboard-brand__mark">UTT</span><span>Universidad Tecnológica<br/>de Tlaxcala</span><button className="dashboard-sidebar__close" onClick={() => setSidebarOpen(false)} aria-label="Cerrar menú"><X size={19}/></button></div>
      <nav className="dashboard-nav" aria-label="Navegación del panel"><Link to="/dashboard"><LayoutDashboard size={18}/>Resumen</Link><Link to="/dashboard/eventos"><CalendarDays size={18}/>Eventos</Link><Link to="/dashboard/proyectos"><FolderKanban size={18}/>Proyectos</Link><Link to="/dashboard/padron"><Users size={18}/>Padrón de Alumnos</Link>{isPrimaryAdmin === true && <Link className="is-active" to="/dashboard/administradores"><ShieldCheck size={18}/>Administradores</Link>}<Link to="/dashboard/eventos?crear=1"><Plus size={18}/>Crear evento</Link></nav>
      <div className="dashboard-sidebar__bottom"><div className="dashboard-profile"><span className="dashboard-avatar">{fullName?.charAt(0) ?? " "}</span><div><strong>{fullName ?? " "}</strong><small>Control de accesos</small></div></div><button type="button" onClick={() => void signOut()} className="dashboard-signout"><LogOut size={17}/>Salir al sitio</button></div>
    </aside>
    <section className="dashboard-content">
      <header className="dashboard-topbar"><button className="dashboard-menu-button" onClick={() => setSidebarOpen(true)} aria-label="Abrir menú"><Menu size={21}/></button><div className="dashboard-breadcrumb"><Link to="/dashboard">Panel</Link><span>/</span><strong>Administradores</strong></div><div className="dashboard-topbar__actions"><AnimatedThemeToggler className="dashboard-theme-toggle"/><span className="dashboard-avatar dashboard-avatar--small" aria-label={fullName ? `Sesión de ${fullName}` : "Sesión administrativa"} title={fullName ?? undefined}>{fullName?.charAt(0) ?? " "}</span></div></header>
      <div className="dashboard-body dashboard-body--admins">
        <div className="dashboard-welcome"><div><p className="dashboard-eyebrow"><ShieldCheck size={14}/> ACCESO Y SEGURIDAD</p><h1>Administradores<span>.</span></h1><p>Administra las cuentas del equipo organizador.</p></div></div>
        {accountsError && <div className="dashboard-data-error" role="alert"><div><strong>No se pudo gestionar la lista de administradores</strong><p>{accountsError}</p></div><button type="button" onClick={() => void refreshAccounts()} disabled={loadingAccounts}>{loadingAccounts ? "Consultando…" : "Reintentar"}</button></div>}

        {loadingAccounts && !accountsError && <div className="dashboard-admin-loading" role="status" aria-label="Cargando sección de administradores" aria-busy="true">
          <div className="dashboard-admin-grid">
            {[0, 1].map((card) => <section className="dashboard-events dashboard-admin-create dashboard-admin-skeleton-card" key={card} aria-hidden="true"><i className="dashboard-admin-skeleton__eyebrow placeholder-glow"/><i className="dashboard-admin-skeleton__title placeholder-glow"/><i className="dashboard-admin-skeleton__copy placeholder-glow"/><i className="dashboard-admin-skeleton__field placeholder-glow"/><i className="dashboard-admin-skeleton__field placeholder-glow"/><i className="dashboard-admin-skeleton__button placeholder-glow"/></section>)}
          </div>
          <section className="dashboard-events dashboard-admin-list dashboard-admin-skeleton-list" aria-hidden="true"><div className="dashboard-admin-skeleton__title placeholder-glow"/>{[0, 1, 2].map((row) => <i className="dashboard-admin-skeleton__row placeholder-glow" key={row}/>)}</section>
        </div>}

        {canManage && <>
          <div className="dashboard-admin-grid">
          <section className="dashboard-events dashboard-admin-create">
            <div className="dashboard-section-heading"><div><p>PERFIL PRINCIPAL</p><h2>Mis datos</h2></div><Users size={20}/></div>
            <p className="dashboard-admin-copy">Actualiza el nombre y los apellidos asociados a esta cuenta administrativa.</p>
            <form onSubmit={saveMyName} className="dashboard-event-form">
              <div className="dashboard-admin-name-grid"><label>Nombre(s)<input value={myName.nombre} onChange={(event) => updateMyName("nombre", event.target.value)} autoComplete="given-name" required/></label><label>Apellido paterno<input value={myName.apellido_paterno} onChange={(event) => updateMyName("apellido_paterno", event.target.value)} autoComplete="family-name" required/></label><label>Apellido materno<input value={myName.apellido_materno} onChange={(event) => updateMyName("apellido_materno", event.target.value)} required/></label></div>
              <button type="submit" className="dashboard-primary-button" disabled={savingMyName}>{savingMyName ? "Guardando…" : "Guardar mis datos"}<Check size={16}/></button>
            </form>
          </section>

          <section className="dashboard-events dashboard-admin-create">
            <div className="dashboard-section-heading"><div><p>ALTA AUTORIZADA</p><h2>Registrar administrador</h2></div><KeyRound size={20}/></div>
            <p className="dashboard-admin-copy">Registra el nombre completo y correo de la persona. Se generará una contraseña temporal para su primer acceso.</p>
            {error && <p className="auth-message" role="alert">{error}</p>}
            {!created ? <form onSubmit={submit} className="dashboard-event-form">
              <div className="dashboard-admin-name-grid"><label>Nombre(s)<input value={form.nombre} onChange={(event) => updateForm("nombre", event.target.value)} autoComplete="given-name" required/></label><label>Apellido paterno<input value={form.apellido_paterno} onChange={(event) => updateForm("apellido_paterno", event.target.value)} autoComplete="family-name" required/></label><label>Apellido materno<input value={form.apellido_materno} onChange={(event) => updateForm("apellido_materno", event.target.value)} required/></label></div>
              <label>Correo electrónico<input type="email" value={form.email} onChange={(event) => updateForm("email", event.target.value)} autoComplete="off" required/></label>
              <button type="submit" className="dashboard-primary-button" disabled={saving}>{saving ? "Creando cuenta…" : "Crear acceso"}<ShieldCheck size={16}/></button>
            </form> : <div className="dashboard-admin-credential"><span className="dashboard-status"><i/> Cuenta creada</span><strong>{created.nombre} {created.apellido_paterno} {created.apellido_materno}</strong><span>{created.email}</span><p>Entrega esta contraseña temporal directamente a la persona. Solo se muestra ahora y deberá cambiarla al iniciar sesión.</p><code>{created.temporaryPassword}</code><button type="button" className="dashboard-primary-button" onClick={() => void copyPassword()}>{copied ? <Check size={16}/> : <Copy size={16}/>}{copied ? "Copiada" : "Copiar contraseña"}</button><button type="button" className="dashboard-admin-again" onClick={() => setCreated(null)}>Registrar otra cuenta</button></div>}
          </section>
          </div>

          <section className="dashboard-events dashboard-admin-list">
            <div className="dashboard-section-heading"><div><p>CUENTAS AUTORIZADAS</p><h2>{loadingAccounts ? "Consultando…" : `${filteredAccounts.length} ${filteredAccounts.length === 1 ? "administrador" : "administradores"}`}</h2></div><label className="dashboard-search"><Search size={17}/><input type="search" aria-label="Buscar administradores" placeholder="Buscar por nombre o correo" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)}/></label></div>
            {loadingAccounts ? <p className="dashboard-admin-copy">Cargando cuentas administrativas…</p> : accounts.length === 0 ? <p className="dashboard-admin-copy">No hay cuentas administrativas para mostrar.</p> : filteredAccounts.length === 0 ? <div className="dashboard-search-empty">No encontramos administradores con esa búsqueda.</div> : <div className="dashboard-admin-list__items">{filteredAccounts.map((account) => {
              const fullName = [account.nombre, account.apellido_paterno, account.apellido_materno].filter(Boolean).join(" ") || "Nombre pendiente";
              const isPrincipal = account.id === principalId;
              return <article className="dashboard-admin-list__item" key={account.id}><span className="dashboard-avatar">{(account.nombre?.trim().charAt(0) || "A").toLocaleUpperCase("es-MX")}</span><div className="dashboard-admin-list__identity"><strong>{fullName}{isPrincipal && <span className="dashboard-admin-list__badge">Principal</span>}</strong><small>{account.email}</small></div>{!isPrincipal && <button type="button" className="dashboard-admin-list__delete" onClick={() => void removeAccount(account)} disabled={Boolean(deletingId)} aria-label={`Eliminar acceso de ${fullName}`} title="Eliminar acceso">{deletingId === account.id ? "Eliminando…" : <><Trash2 size={16}/>Eliminar</>}</button>}</article>;
            })}</div>}
          </section>
        </>}
        {!loadingAccounts && !accountsError && !canManage && <section className="dashboard-events dashboard-admin-create"><div className="dashboard-section-heading"><div><p>ACCESO RESTRINGIDO</p><h2>Gestión del equipo</h2></div><ShieldCheck size={20}/></div><p className="dashboard-admin-copy">Solo el administrador principal puede registrar o eliminar cuentas administrativas.</p></section>}
      </div>
    </section>
  </main>;
}
