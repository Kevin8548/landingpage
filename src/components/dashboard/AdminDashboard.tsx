import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, CalendarDays, ChevronLeft, ChevronRight, Clock3, LayoutDashboard, LogOut, MapPin, Menu, Plus, Sparkles, X } from "lucide-react";
import { Link } from "react-router-dom";
import { getDashboardEvents, getEventDateParts, type DashboardEvent } from "../../data/dashboardEvents";
import { AnimatedThemeToggler } from "../ui/AnimatedThemeToggler";
import "./Dashboard.css";
import "./DashboardOverrides.css";
export default function AdminDashboard() {
    const [events, setEvents] = useState<DashboardEvent[]>(getDashboardEvents);
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
    useEffect(() => {
        const refreshEvents = () => setEvents(getDashboardEvents());
        window.addEventListener("focus", refreshEvents);
        return () => window.removeEventListener("focus", refreshEvents);
    }, []);
    const publishedEvents = events.filter((event) => event.status === "Publicado");
    const nextEvent = publishedEvents[0] ?? events[0];
    const summary = useMemo(() => [
        { label: "Eventos publicados", value: publishedEvents.length, icon: CalendarDays, tone: "green" },
        { label: "Total de eventos", value: events.length, icon: Sparkles, tone: "amber" },
        { label: "Pendientes de publicar", value: events.filter((event) => event.status === "Borrador").length, icon: Clock3, tone: "blue" },
    ], [events, publishedEvents.length]);
    return <main className="dashboard-page">
    <aside className={`dashboard-sidebar ${isSidebarOpen ? "is-open" : ""} ${isSidebarCollapsed ? "is-collapsed" : ""}`}>
      <button className="dashboard-sidebar-collapse" onClick={() => setSidebarCollapsed((value) => !value)}
      aria-label={isSidebarCollapsed ? "Expandir barra lateral" : "Contraer barra lateral"}>{isSidebarCollapsed ?
      <ChevronRight size={18} /> : <ChevronLeft size={18} />}</button>
      <div className="dashboard-brand"><span className="dashboard-brand__mark">UTT</span>
      <span>Universidad Tecnológica<br />de Tlaxcala</span><button className="dashboard-sidebar__close"
      onClick={() => setSidebarOpen(false)} aria-label="Cerrar menú"><X size={19}/></button></div>
      <nav className="dashboard-nav" aria-label="Navegación del panel"><Link className="is-active"
      to="/dashboard"><LayoutDashboard size={18}/>Resumen</Link><Link to="/dashboard/eventos"><CalendarDays
      size={18}/>Eventos <span>{events.length}</span></Link><Link to="/dashboard/eventos"><Plus size={18}/>Crear evento</Link>
      </nav>
      <div className="dashboard-sidebar__bottom"><div className="dashboard-profile"><span
      className="dashboard-avatar">AD</span><div><strong>Administrador</strong><small>Panel de eventos</small>
      </div></div><Link to="/" className="dashboard-signout"><LogOut size={17}/>Salir al sitio</Link></div>
    </aside>

    <section className="dashboard-content"><header className="dashboard-topbar"><button className="dashboard-menu-button"
    onClick={() => setSidebarOpen(true)} aria-label="Abrir menú"><Menu size={21}/></button><div
    className="dashboard-breadcrumb"><span>Panel</span><ChevronRight size={14}/>Resumen</div><div
    className="dashboard-topbar__actions">
      <AnimatedThemeToggler className="dashboard-theme-toggle" />
      <span className="dashboard-avatar dashboard-avatar--small">AD</span>
    </div></header>
      <div className="dashboard-body" id="resumen"><div className="dashboard-welcome"><div><p
      className="dashboard-eyebrow"><Sparkles size={14}/> PANEL DE ADMINISTRACIÓN</p><h1>Hola, Administrador<span>.</span></h1>
      <p>Consulta lo importante y administra tus eventos desde un solo lugar.</p></div>
      <Link className="dashboard-primary-button" to="/dashboard/eventos">Ir a eventos</Link></div>
        <section className="dashboard-stats" aria-label="Resumen de actividad">{summary.map(({ label, value, icon: Icon, tone }) =>
          <article className="dashboard-stat" key={label}><span className={`dashboard-stat__icon dashboard-stat__icon--${tone}`}>
            <Icon size={20}/></span><div><small>{label}</small><strong>{value}</strong>
            </div><ArrowUpRight size={18}/></article>)}</section>
        <section className="dashboard-feature-grid"><article className="dashboard-next-event">
          <div className="dashboard-section-heading"><div><p>EN EL RADAR</p><h2>Próximo evento</h2></div>
          <Link to="/dashboard/eventos">Ver todos</Link></div>{nextEvent ? <DashboardNextEvent event={nextEvent}/> :
          <div className="dashboard-empty-state"><CalendarDays size={24}/><p>Aún no hay eventos.</p>
          <Link to="/dashboard/eventos">Crea el primero</Link></div>}</article>
          <article className="dashboard-quick-start"><div className="dashboard-section-heading"><div>
            <p>¿QUÉ SIGUE?</p><h2>Gestiona sin complicarte</h2></div></div><ol><li><span>01</span><div>
              <strong>Crea un evento</strong><p>Agrega fecha, hora, lugar y público.</p></div></li>
              <li><span>02</span><div><strong>Revisa su información</strong><p>Consulta los detalles cuando quieras.</p>
              </div></li><li><span>03</span><div><strong>Manténlo actualizado</strong>
              <p>Edita o elimina en la sección Eventos.</p></div></li></ol>
              <Link className="dashboard-text-link" to="/dashboard/eventos" color="rgb(26, 79, 1)"></Link></article></section>
      </div></section>
  </main>;
}
function DashboardNextEvent({ event }: {
    event: DashboardEvent;
}) {
    const date = getEventDateParts(event.date);
    return <div className={`dashboard-next-event__card dashboard-event--${event.accent}`}>
      <div className="dashboard-date-tile"><strong>{date.day}</strong><span>{date.month}</span></div>
      <div className="dashboard-next-event__copy"><span className="dashboard-status"><i />{event.status}</span>
      <h3>{event.title}</h3><p><Clock3 size={15}/>{event.time}</p><p><MapPin size={15}/>{event.location}</p></div>
      <Link className="dashboard-arrow-button" to="/dashboard/eventos" aria-label="Ir a eventos"><ChevronRight size={20}/></Link></div>;
}
