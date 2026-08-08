import { useEffect, useState, type FormEvent } from "react";
import { ArrowUpRight, CalendarDays, Check, ChevronLeft, ChevronRight, Clock3, Eye, LayoutDashboard, LogOut, MapPin, Menu, Pencil, Plus, Trash2, Users, X } from "lucide-react";
import { Link } from "react-router-dom";
import { getDashboardEvents, getEventDateParts, makeDateLabel, saveDashboardEvents, type DashboardEvent } from "../data/dashboardEvents";
import "../components/dashboard/Dashboard.css";
import "../components/dashboard/DashboardOverrides.css";

function getTodayInputValue() {
    const now = new Date();
    const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
    return localDate.toISOString().slice(0, 10);
}

export default function Events() {
    const [events, setEvents] = useState<DashboardEvent[]>(getDashboardEvents);
    const [editingEvent, setEditingEvent] = useState<DashboardEvent | null>(null);
    const [viewingEvent, setViewingEvent] = useState<DashboardEvent | null>(null);
    const [isFormOpen, setFormOpen] = useState(false);
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [notice, setNotice] = useState("");
    const today = getTodayInputValue();
    useEffect(() => saveDashboardEvents(events), [events]);
    const showNotice = (message: string) => {
        setNotice(message);
        window.setTimeout(() => setNotice(""), 3500);
    };
    const openCreator = () => { setEditingEvent(null); setFormOpen(true); };
    const openEditor = (event: DashboardEvent) => { setEditingEvent(event); setFormOpen(true); };
    const saveEvent = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const title = String(data.get("title") || "").trim();
        const dateValue = String(data.get("date") || "");
        const time = String(data.get("time") || "").trim();
        const location = String(data.get("location") || "").trim();
        const audience = String(data.get("audience") || "").trim() || "Comunidad UTT";
        if (!title || !dateValue || !time || !location)
            return;
        if (dateValue < today) {
            showNotice("Selecciona una fecha igual o posterior a hoy.");
            return;
        }
        const details = { title, date: makeDateLabel(dateValue), dateValue, time, location, audience };
        if (editingEvent) {
            setEvents((current) => current.map((item) => item.id === editingEvent.id ? { ...item, ...details } : item));
            showNotice("Cambios guardados correctamente.");
        }
        else {
            setEvents((current) => [{ id: crypto.randomUUID(), ...details, status: "Publicado", accent: "green" }, ...current]);
            showNotice("Evento publicado.");
        }
        setFormOpen(false);
        setEditingEvent(null);
    };
    const deleteEvent = (event: DashboardEvent) => {
        if (!window.confirm(`¿Eliminar “${event.title}”? Esta acción solo afecta a la demo local.`))
            return;
        setEvents((current) => current.filter((item) => item.id !== event.id));
        showNotice("Evento eliminado.");
    };
    return <main className="dashboard-page">
    <aside className={`dashboard-sidebar ${isSidebarOpen ? "is-open" : ""} ${isSidebarCollapsed ? "is-collapsed" : ""}`}>
      <button className="dashboard-sidebar-collapse" onClick={() => setSidebarCollapsed((value) => !value)}
      aria-label={isSidebarCollapsed ? "Expandir barra lateral" : "Contraer barra lateral"}>{isSidebarCollapsed ?
      <ChevronRight size={18} /> : <ChevronLeft size={18} />}</button>
      <div className="dashboard-brand"><span className="dashboard-brand__mark">
        UTT</span><span>Universidad Tecnológica<br />de Tlaxcala</span><button 
        className="dashboard-sidebar__close" onClick={() => setSidebarOpen(false)} aria-label="Cerrar menú"><X size={19}/></button></div>
      <nav className="dashboard-nav" aria-label="Navegación del panel"><Link to="/dashboard">
      <LayoutDashboard size={18}/>Resumen</Link><Link className="is-active" to="/dashboard/eventos">
      <CalendarDays size={18}/>Eventos <span>{events.length}</span></Link><button type="button" 
      onClick={openCreator}><Plus size={18}/>Crear evento</button></nav>
      <div className="dashboard-sidebar__bottom"><div className="dashboard-profile"><span 
      className="dashboard-avatar">AD</span><div><strong>Administrador</strong>
      <small>Panel de eventos</small></div></div><Link to="/" className="dashboard-signout">
      <LogOut size={17}/>Salir al sitio</Link></div>
    </aside>

    <section className="dashboard-content"><header className="dashboard-topbar">
      <button className="dashboard-menu-button" onClick={() => setSidebarOpen(true)} 
      aria-label="Abrir menú"><Menu size={21}/></button><div className="dashboard-breadcrumb">
        <Link to="/dashboard">Panel</Link><span>/</span><strong>Eventos</strong></div><span 
        className="dashboard-avatar dashboard-avatar--small">AD</span></header>
      <div className="dashboard-body dashboard-body--events"><div className="dashboard-welcome">
        <div><p className="dashboard-eyebrow"><CalendarDays size={14}/> ADMINISTRACIÓN</p>
        <h1>Tus eventos<span>.</span></h1><p>Crea los eventos.</p>
        </div><button className="dashboard-primary-button" onClick={openCreator}><Plus size={18}/>Crear evento</button></div>
        {notice && <div className="dashboard-notice"><Check size={17}/>{notice}</div>}
        <section className="dashboard-events dashboard-events--standalone"><div className="dashboard-section-heading"><div><p>LISTADO DE EVENTOS</p><h2>{events.length} {events.length === 1 ? "evento" : "eventos"}</h2></div></div><div className="dashboard-event-list">
          {events.map((event, index) => {
            const date = getEventDateParts(event.date);
            const stripeColor = index % 2 === 0 ? "amber" : "green";

            return (
              <article className="dashboard-event-row" key={event.id}>
                <div className={`dashboard-event-row__stripe dashboard-event-row__stripe--${stripeColor}`} />
                <div className="dashboard-event-row__date"><strong>{date.day}</strong><span>{date.month}</span></div>
                <div className="dashboard-event-row__details"><span className={event.status === "Publicado" ? "dashboard-status" : "dashboard-status dashboard-status--draft"}><i />{event.status}</span><h3>{event.title}</h3><p>{event.location} · {event.time}</p></div>
                <div className="dashboard-event-actions"><button onClick={() => setViewingEvent(event)}><Eye size={16} /><span>Ver</span></button><button onClick={() => openEditor(event)}><Pencil size={15} /><span>Editar</span></button><button className="is-danger" onClick={() => deleteEvent(event)}><Trash2 size={15} /><span>Eliminar</span></button></div>
              </article>
            );
          })}
        </div></section>
      </div></section>
    {isFormOpen && <div className="dashboard-modal-backdrop" role="presentation"
    onMouseDown={() => setFormOpen(false)}><section className="dashboard-modal"
    role="dialog" aria-modal="true" aria-labelledby="event-form-title" 
    onMouseDown={(event) => event.stopPropagation()}><div className="dashboard-modal__header">
      <div><p className="dashboard-eyebrow">{editingEvent ? "EDITAR EVENTO" : "NUEVO EVENTO"}</p><h2 id="event-form-title">{editingEvent ? "Actualiza los detalles" : "Comparte algo importante"}</h2></div><button onClick={() => setFormOpen(false)} aria-label="Cerrar"><X size={20}/></button></div><form onSubmit={saveEvent} className="dashboard-event-form"><label>Nombre del evento<input name="title" defaultValue={editingEvent?.title} placeholder="Ej. Taller de innovación" autoFocus required/></label><div className="dashboard-form-grid"><label>Fecha<input name="date" type="date" min={today} defaultValue={editingEvent?.dateValue} required/></label><label>Hora<input name="time" defaultValue={editingEvent?.time} placeholder="10:00 — 12:00 h" required/></label></div><label>Lugar<input name="location" defaultValue={editingEvent?.location} placeholder="Ej. Auditorio principal" required/></label><label>Público al que va dirigido<input name="audience" defaultValue={editingEvent?.audience} placeholder="Ej. Comunidad UTT"/></label><div className="dashboard-modal__footer"><button type="button" onClick={() => setFormOpen(false)}>Cancelar</button><button className="dashboard-primary-button" type="submit">{editingEvent ? "Guardar cambios" : "Publicar evento"}<ArrowUpRight size={17}/></button></div></form></section></div>}
    {viewingEvent && <div className="dashboard-modal-backdrop" role="presentation" onMouseDown={() => setViewingEvent(null)}><section className="dashboard-modal dashboard-view-modal" role="dialog" aria-modal="true" aria-labelledby="event-view-title" onMouseDown={(event) => event.stopPropagation()}><div className="dashboard-modal__header"><div><p className="dashboard-eyebrow">DETALLE DEL EVENTO</p><h2 id="event-view-title">{viewingEvent.title}</h2></div><button onClick={() => setViewingEvent(null)} aria-label="Cerrar"><X size={20}/></button></div><div className="dashboard-view-details"><p><CalendarDays size={18}/><span><strong>Fecha</strong>{viewingEvent.date}</span></p><p><Clock3 size={18}/><span><strong>Horario</strong>{viewingEvent.time}</span></p><p><MapPin size={18}/><span><strong>Lugar</strong>{viewingEvent.location}</span></p><p><Users size={18}/><span><strong>Dirigido a</strong>{viewingEvent.audience}</span></p></div><div className="dashboard-modal__footer"><button type="button" onClick={() => setViewingEvent(null)}>Cerrar</button><button className="dashboard-primary-button" onClick={() => { setViewingEvent(null); openEditor(viewingEvent); }}><Pencil size={16}/>Editar evento</button></div></section></div>}
  </main>;
}
