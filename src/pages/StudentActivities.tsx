import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, CalendarDays, Clock3, ExternalLink, LogOut, MapPin, Users, X } from "lucide-react";
import { listManagedEvents, type ManagedEvent } from "../services/manageEvents";
import { cancelWorkshopRegistration, enrollInWorkshop, listEventWorkshops, listMyWorkshopRegistrations, type Workshop } from "../services/workshops";
import { showDashboardAlert } from "../lib/dashboardAlerts";
import { studentSupabase } from "../lib/supabase";
import { userFacingError } from "../lib/userFacingErrors";
import "./StudentActivities.css";

type Registration = { id: string; workshop_id: string; event_id: string; created_at: string; event_workshops: { titulo: string; lugar: string; inicia_en: string; termina_en: string } | null; events: { titulo: string } | null };
type ActivityEvent = ManagedEvent & { workshops: Workshop[] };
const date = (value: string) => new Intl.DateTimeFormat("es-MX", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date(value));
const time = (value: string) => new Intl.DateTimeFormat("es-MX", { hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(value));
const studentAccessRoute = "/acceso?tipo=alumno";

export default function StudentActivities() {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [items, setItems] = useState<Registration[]>([]);
  const [view, setView] = useState<"explore" | "mine">("explore");
  const [selectedWorkshopId, setSelectedWorkshopId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const refresh = useCallback(async () => {
    const allEvents = await listManagedEvents();
    const withActivities = await Promise.all(allEvents.map(async (event) => ({ ...event, workshops: await listEventWorkshops(event.id) })));
    const registrations = await listMyWorkshopRegistrations() as unknown as Registration[];
    setEvents(withActivities.filter((event) => event.workshops.length > 0 || event.link_registro));
    setItems(registrations);
  }, []);

  useEffect(() => {
    let active = true;
    void (async () => {
      const { data: { session } } = await studentSupabase.auth.getSession();
      if (!session) { navigate("/acceso?tipo=alumno&returnTo=%2Falumno%2Factividades", { replace: true }); return; }
      const { data: profile } = await studentSupabase.from("profiles").select("role").eq("id", session.user.id).maybeSingle();
      const { data: rosterValid, error: rosterError } = await studentSupabase.rpc("student_roster_access_valid");
      if (rosterError) throw rosterError;
      if (profile?.role !== "student" || rosterValid !== true) {
        await studentSupabase.auth.signOut();
        navigate(studentAccessRoute, { replace: true });
        return;
      }
      await refresh();
      if (active) setAuthorized(true);
    })().catch((reason) => { if (active) setError(userFacingError(reason, "No se pudieron cargar tus actividades. Revisa tu conexión e inténtalo de nuevo.")); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [navigate, refresh]);

  useEffect(() => {
    if (!authorized) return;
    let active = true;
    const update = () => { void (async () => {
      const { data: rosterValid, error: rosterError } = await studentSupabase.rpc("student_roster_access_valid");
      if (rosterError) throw rosterError;
      if (rosterValid !== true) {
        await studentSupabase.auth.signOut();
        navigate(studentAccessRoute, { replace: true });
        return;
      }
      await refresh();
    })().catch((reason) => { if (active) setError(userFacingError(reason, "No se pudo actualizar la disponibilidad. Revisa tu conexión e inténtalo de nuevo.")); }); };
    const timer = window.setInterval(update, 30_000);
    window.addEventListener("focus", update);
    return () => { active = false; window.clearInterval(timer); window.removeEventListener("focus", update); };
  }, [authorized, navigate, refresh]);

  const chosenByEvent = useMemo(() => new Map(items.map((item) => [item.event_id, item])), [items]);
  const selectedWorkshop = useMemo(() => {
    if (!selectedWorkshopId) return null;
    for (const event of events) {
      const workshop = event.workshops.find((item) => item.id === selectedWorkshopId);
      if (workshop) {
        const registration = chosenByEvent.get(event.id);
        return { workshop, eventTitle: event.titulo, available: Math.max(0, workshop.capacidad - Number(workshop.ocupados)), chosen: registration?.workshop_id === workshop.id, blocked: Boolean(registration) };
      }
    }
    return null;
  }, [chosenByEvent, events, selectedWorkshopId]);
  useEffect(() => {
    if (!selectedWorkshopId) return;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setSelectedWorkshopId(null); };
    document.addEventListener("keydown", closeOnEscape);
    return () => { document.body.style.overflow = oldOverflow; document.removeEventListener("keydown", closeOnEscape); };
  }, [selectedWorkshopId]);
  const reserve = async (workshop: Workshop) => {
    setBusy(workshop.id); setError("");
    try { await enrollInWorkshop(workshop.id); await refresh(); }
    catch (reason) { setError(userFacingError(reason, "No se pudo completar la inscripción. Revisa tu conexión e inténtalo de nuevo.")); }
    finally { setBusy(""); }
  };
  const cancel = async (id: string) => {
    const result = await showDashboardAlert({ icon: "warning", title: "¿Cancelar esta inscripción?", text: "El lugar quedará disponible para otro alumno.", showCancelButton: true, confirmButtonText: "Sí, cancelar", cancelButtonText: "Conservar lugar" });
    if (!result.isConfirmed) return;
    setBusy(id); setError("");
    try { await cancelWorkshopRegistration(id); await refresh(); }
    catch (reason) { setError(userFacingError(reason, "No se pudo cancelar la inscripción. Revisa tu conexión e inténtalo de nuevo.")); }
    finally { setBusy(""); }
  };
  const signOut = async () => { await studentSupabase.auth.signOut(); navigate("/", { replace: true }); };

  return <main className="student-activities eventos-board min-h-screen bg-[var(--bg)] px-5 pb-16 pt-6 text-[var(--ink)] sm:px-8 sm:pt-9"><div className="student-activities__container mx-auto max-w-6xl">
    <div className="student-activities__topbar"><Link to="/" className="student-activities__back"><ArrowLeft size={16}/> <span>Sitio principal</span></Link><button type="button" onClick={() => void signOut()} className="student-activities__logout" aria-label="Cerrar sesión" title="Cerrar sesión"><LogOut size={17}/><span className="sr-only">Cerrar sesión</span></button></div>
    <header className="student-activities__hero"><div><p className="student-activities__eyebrow">Espacio privado de alumno</p><h1>Actividades <span>UTT</span></h1><p>Descubre talleres de tus eventos universitarios y gestiona tus inscripciones en un solo lugar.</p></div><div className="student-activities__hero-mark" aria-hidden="true"><CalendarDays size={30}/><span>AGENDA<br/>ACADÉMICA</span></div></header>
    <div className="student-activities__tabs" role="tablist" aria-label="Mis actividades"><button role="tab" aria-selected={view === "explore"} onClick={() => setView("explore")} className={view === "explore" ? "is-active" : ""}><CalendarDays size={16}/>Talleres disponibles</button><button role="tab" aria-selected={view === "mine"} onClick={() => setView("mine")} className={view === "mine" ? "is-active" : ""}><Users size={16}/>Mis inscripciones <span>{items.length}</span></button></div>
    {error && <p role="alert" className="student-activities__error">{error}</p>}
    {loading ? <p className="student-activities__loading">Cargando agenda privada…</p> : view === "explore" ? events.length === 0 ? <section className="student-activities__empty"><CalendarDays/><h2>No hay talleres abiertos por ahora</h2><p>Cuando se publiquen nuevas actividades, aparecerán aquí.</p></section> : <div className="student-activities__events">{events.map((event) => { const registration = chosenByEvent.get(event.id); return <section className="student-activities__event" key={event.id}><div className="student-activities__event-heading"><div><p>{event.tipo} <span>·</span> {date(event.fecha_inicio)}</p><h2>{event.titulo}</h2></div>{event.link_registro && <a href={event.link_registro} target="_blank" rel="noreferrer"><ExternalLink size={15}/> Registro del evento</a>}</div><div className="student-activities__cards">{event.workshops.map((workshop) => { const available = Math.max(0, workshop.capacidad - Number(workshop.ocupados)); return <article key={workshop.id} className="student-activities__card"><div className="student-activities__card-accent"/><div className="student-activities__card-top"><span>Taller</span><span className={available === 0 ? "is-full" : ""}>{available === 0 ? "Cupo lleno" : `${available} lugares`}</span></div><button type="button" className="student-activities__card-summary" onClick={() => setSelectedWorkshopId(workshop.id)} aria-label={`Ver detalles de ${workshop.titulo}`}><span><strong>{workshop.titulo}</strong><small><CalendarDays size={13}/>{date(workshop.inicia_en)} <span>·</span> {time(workshop.inicia_en)} h</small></span><span className="student-activities__summary-action">Ver detalles</span></button></article>; })}</div></section>; })}</div> : items.length === 0 ? <section className="student-activities__empty"><CalendarDays/><h2>Todavía no tienes inscripciones</h2><p>Explora las actividades y elige el taller en el que deseas participar.</p><button onClick={() => setView("explore")}>Explorar talleres</button></section> : <div className="student-activities__events">{items.map((item) => <article key={item.id} className="student-activities__registration"><div><p>{item.events?.titulo ?? "Evento universitario"}</p><h2>{item.event_workshops?.titulo ?? "Actividad"}</h2><div className="student-activities__details"><span><CalendarDays size={15}/>{item.event_workshops ? date(item.event_workshops.inicia_en) : "Horario por confirmar"}</span><span><Clock3 size={15}/>{item.event_workshops ? `${time(item.event_workshops.inicia_en)}–${time(item.event_workshops.termina_en)} h` : ""}</span><span><MapPin size={15}/>{item.event_workshops?.lugar}</span></div></div><button type="button" disabled={Boolean(busy)} onClick={() => void cancel(item.id)}><X size={15}/>{busy === item.id ? "Cancelando…" : "Cancelar inscripción"}</button></article>)}</div>}{selectedWorkshop && <div className="student-activities__modal-backdrop" role="presentation" onMouseDown={() => setSelectedWorkshopId(null)}><section className="student-activities__modal" role="dialog" aria-modal="true" aria-labelledby="student-workshop-title" onMouseDown={(event) => event.stopPropagation()}><div className="student-activities__modal-header"><div><p>{selectedWorkshop.eventTitle}</p><span>{selectedWorkshop.available === 0 ? "Cupo completo" : `${selectedWorkshop.available} lugares disponibles`}</span></div><button type="button" onClick={() => setSelectedWorkshopId(null)} aria-label="Cerrar detalles"><X size={19}/></button></div><h2 id="student-workshop-title">{selectedWorkshop.workshop.titulo}</h2><p className="student-activities__modal-description">{selectedWorkshop.workshop.descripcion || "Actividad académica para la comunidad UTT."}</p><div className="student-activities__modal-details"><div><CalendarDays/><span><small>Fecha</small>{date(selectedWorkshop.workshop.inicia_en)}</span></div><div><Clock3/><span><small>Horario</small>{time(selectedWorkshop.workshop.inicia_en)}–{time(selectedWorkshop.workshop.termina_en)} h</span></div><div><MapPin/><span><small>Lugar</small>{selectedWorkshop.workshop.lugar}</span></div><div><Users/><span><small>Ponente</small>{selectedWorkshop.workshop.ponente || "Por confirmar"}</span></div><div><Users/><span><small>Cupo</small>{selectedWorkshop.workshop.ocupados} de {selectedWorkshop.workshop.capacidad} inscritos</span></div></div><div className="student-activities__modal-footer"><p>{selectedWorkshop.chosen ? "Tu lugar está confirmado" : selectedWorkshop.blocked ? "Ya tienes una actividad en este evento" : "La inscripción se realiza con tu cuenta de alumno."}</p><button type="button" disabled={selectedWorkshop.chosen || selectedWorkshop.blocked || selectedWorkshop.available === 0 || Boolean(busy)} onClick={() => void reserve(selectedWorkshop.workshop)}>{selectedWorkshop.chosen ? "Inscrito" : selectedWorkshop.blocked ? "Ya elegiste un taller" : selectedWorkshop.available === 0 ? "Cupo completo" : busy === selectedWorkshop.workshop.id ? "Inscribiendo…" : "Inscribirme"}</button></div></section></div>}</div></main>;
}
