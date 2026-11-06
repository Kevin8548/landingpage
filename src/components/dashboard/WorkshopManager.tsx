import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, Clock3, Pencil, Plus, Trash2, Users, X } from "lucide-react";
import { listEventWorkshops, listWorkshopAttendees, removeWorkshop, saveWorkshop, type Workshop, type WorkshopInput } from "../../services/workshops";
import { showDashboardAlert } from "../../lib/dashboardAlerts";

type Attendee = {
  id: string;
  created_at: string;
  profiles: { matricula: string; nombre: string; apellido_paterno: string; apellido_materno: string | null; carrera: string | null } | null;
};
type WorkshopManagerProps = { eventId: string; eventTitle: string; eventDate: string; eventTime: string; onClose: () => void };

const asLocalDateTime = (value: Date) => {
  const local = new Date(value.getTime() - value.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
};
const dateTimeValue = (eventDate: string, eventTime: string) => {
  const time = eventTime.match(/\b(\d{1,2}):(\d{2})\b/)?.[0] ?? "09:00";
  const start = new Date(`${eventDate}T${time}:00`);
  return Number.isNaN(start.getTime()) ? asLocalDateTime(new Date()) : asLocalDateTime(start);
};
const displayTime = (value: string) => new Intl.DateTimeFormat("es-MX", { weekday: "short", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(value));

function WorkshopDateTimeField({ name, defaultValue }: { name: string; defaultValue: string }) {
  const [date, setDate] = useState(defaultValue.slice(0, 10));
  const [time, setTime] = useState(defaultValue.slice(11, 16));
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(() => new Date(`${defaultValue.slice(0, 10)}T12:00:00`));
  const rootRef = useRef<HTMLDivElement>(null);
  const combinedValue = date && time ? `${date}T${time}` : "";
  const firstDay = (new Date(month.getFullYear(), month.getMonth(), 1).getDay() + 6) % 7;
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const label = combinedValue ? new Intl.DateTimeFormat("es-MX", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(`${combinedValue}:00`)) : "";
  const times = Array.from({ length: 48 }, (_, index) => `${String(Math.floor(index / 2)).padStart(2, "0")}:${index % 2 === 0 ? "00" : "30"}`);

  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: PointerEvent) => { if (!rootRef.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener("pointerdown", closeOutside, true);
    return () => document.removeEventListener("pointerdown", closeOutside, true);
  }, [open]);

  return <div ref={rootRef} className={`dashboard-workshop-date-time ${open ? "is-open" : ""}`}>
    <input type="hidden" name={name} value={combinedValue} />
    <button type="button" className="dashboard-picker-input dashboard-workshop-date-trigger" aria-label="Elegir fecha y hora" aria-expanded={open} onClick={() => { setMonth(new Date(`${date}T12:00:00`)); setOpen((current) => !current); }}><CalendarDays size={15}/><span>{label}</span><ChevronDown size={15} className="dashboard-workshop-picker-chevron"/></button>
    {open && <div className="dashboard-calendar dashboard-workshop-calendar" role="dialog" aria-label="Seleccionar fecha y hora"><div className="dashboard-calendar__header"><button type="button" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} aria-label="Mes anterior"><ChevronLeft size={17}/></button><strong>{month.toLocaleDateString("es-MX", { month: "long", year: "numeric" })}</strong><button type="button" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} aria-label="Mes siguiente"><ChevronRight size={17}/></button></div><div className="dashboard-calendar__weekdays">{["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"].map((day) => <span key={day}>{day}</span>)}</div><div className="dashboard-calendar__days">{Array.from({ length: firstDay + daysInMonth }, (_, index) => { if (index < firstDay) return <span key={`empty-${index}`}/>; const day = index - firstDay + 1; const next = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`; return <button type="button" key={next} className={date === next ? "is-selected" : ""} aria-pressed={date === next} onClick={() => setDate(next)}>{day}</button>; })}</div><div className="dashboard-workshop-time-section"><span><Clock3 size={14}/>Horario</span><div className="dashboard-workshop-time-options">{times.map((item) => <button type="button" key={item} className={time === item ? "is-selected" : ""} aria-pressed={time === item} onClick={() => setTime(item)}>{item}</button>)}</div></div><button type="button" className="dashboard-workshop-datetime-done" onClick={() => setOpen(false)}>Listo</button></div>}
  </div>;
}

export default function WorkshopManager({ eventId, eventTitle, eventDate, eventTime, onClose }: WorkshopManagerProps) {
  const [items, setItems] = useState<Workshop[]>([]);
  const [attendees, setAttendees] = useState<Record<string, Attendee[]>>({});
  const [attendeeLoading, setAttendeeLoading] = useState("");
  const [deleting, setDeleting] = useState("");
  const [editing, setEditing] = useState<Workshop | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const startDefault = useMemo(() => dateTimeValue(eventDate, eventTime), [eventDate, eventTime]);
  const endDefault = useMemo(() => {
    const start = new Date(startDefault);
    start.setMinutes(start.getMinutes() + 90);
    return asLocalDateTime(start);
  }, [startDefault]);

  const refresh = useCallback(async () => {
    setItems(await listEventWorkshops(eventId));
  }, [eventId]);

  useEffect(() => {
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = oldOverflow; };
  }, []);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const rows = await listEventWorkshops(eventId);
        if (active) setItems(rows);
      } catch (reason) {
        if (active) setError(reason instanceof Error ? reason.message : "No se pudieron cargar los talleres.");
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    const timer = window.setInterval(() => void load(), 30_000);
    window.addEventListener("focus", load);
    return () => { active = false; window.clearInterval(timer); window.removeEventListener("focus", load); };
  }, [eventId]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (showForm) setShowForm(false);
        else onClose();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose, showForm]);

  const openNew = () => { setEditing(null); setError(""); setShowForm(true); };
  const openEdit = (item: Workshop) => { setEditing(item); setError(""); setShowForm(true); };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) return;
    const form = new FormData(event.currentTarget);
    const titulo = String(form.get("titulo") ?? "").trim();
    const descripcion = String(form.get("descripcion") ?? "").trim();
    const ponente = String(form.get("ponente") ?? "").trim();
    const lugar = String(form.get("lugar") ?? "").trim();
    const inicia = String(form.get("inicia_en") ?? "");
    const termina = String(form.get("termina_en") ?? "");
    const capacidad = Number(form.get("capacidad"));
    const startDate = new Date(inicia);
    const endDate = new Date(termina);
    if (!titulo || !lugar) { setError("Completa el nombre del taller y el lugar."); return; }
    if (!inicia || !termina || Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) { setError("Selecciona una fecha y horario válidos."); return; }
    if (endDate <= startDate) { setError("La hora de término debe ser posterior al inicio."); return; }
    if (!Number.isInteger(capacidad) || capacidad < Math.max(1, editing?.ocupados ?? 0)) { setError(`La capacidad debe ser un número entero y no menor a los lugares ya ocupados (${editing?.ocupados ?? 0}).`); return; }

    const payload: WorkshopInput = {
      ...(editing ? { id: editing.id } : {}), event_id: eventId, titulo, descripcion, ponente, lugar,
      inicia_en: startDate.toISOString(), termina_en: endDate.toISOString(), capacidad,
    };
    setSaving(true); setError("");
    try {
      await saveWorkshop(payload);
      await refresh();
      setShowForm(false); setEditing(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudo guardar el taller. Revisa tu conexión e inténtalo nuevamente.");
    } finally { setSaving(false); }
  };

  const deleteItem = async (item: Workshop) => {
    if (deleting) return;
    const result = await showDashboardAlert({ icon: "warning", title: "¿Eliminar este taller?", text: item.ocupados > 0 ? `Se eliminarán también las ${item.ocupados} inscripciones asociadas a “${item.titulo}”.` : `“${item.titulo}” se quitará del evento.`, showCancelButton: true, confirmButtonText: "Eliminar taller", cancelButtonText: "Conservar taller" });
    if (!result.isConfirmed) return;
    setDeleting(item.id); setError("");
    try {
      await removeWorkshop(item.id);
      setAttendees((current) => { const next = { ...current }; delete next[item.id]; return next; });
      await refresh();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "No se pudo eliminar el taller."); }
    finally { setDeleting(""); }
  };

  const toggleAttendees = async (id: string) => {
    if (attendees[id]) { setAttendees((current) => { const next = { ...current }; delete next[id]; return next; }); return; }
    setAttendeeLoading(id); setError("");
    try { const rows = await listWorkshopAttendees(id) as unknown as Attendee[]; setAttendees((current) => ({ ...current, [id]: rows })); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "No se pudieron consultar los alumnos inscritos."); }
    finally { setAttendeeLoading(""); }
  };

  return <div className="dashboard-modal-backdrop dashboard-workshop-backdrop" role="presentation" onMouseDown={onClose}>
    <section className="dashboard-modal dashboard-modal--workshop-manager" role="dialog" aria-modal="true" aria-labelledby="workshop-manager-title" onMouseDown={(event) => event.stopPropagation()}>
      <div className="dashboard-modal__header"><div><p className="dashboard-eyebrow">TALLERES DEL EVENTO</p><h2 id="workshop-manager-title">{eventTitle}</h2><p className="dashboard-workshop-subtitle">Administra horarios, cupos y asistentes desde el mismo evento.</p></div><button type="button" onClick={onClose} aria-label="Cerrar"><X size={20}/></button></div>
      {error && !showForm && <p role="alert" className="dashboard-workshop-error">{error}</p>}
      <div className="dashboard-workshop-list" aria-busy={loading}>
        {loading ? <div className="dashboard-workshop-loading" aria-live="polite">Cargando talleres…</div> : items.length === 0 ? <div className="dashboard-workshop-empty"><CalendarDays size={25}/><strong>Este evento aún no tiene talleres</strong><span>Agrega actividades aquí. Solo los alumnos con sesión autorizada podrán verlas e inscribirse.</span><button type="button" className="dashboard-primary-button" onClick={openNew}><Plus size={16}/>Agregar primer taller</button></div> : items.map((item) => (
          <article className="dashboard-workshop-row" key={item.id}>
            <div className="dashboard-workshop-row__main"><div><h3>{item.titulo}</h3><p>{item.ponente || "Ponente por confirmar"} · {item.lugar}</p><small>{displayTime(item.inicia_en)} – {new Intl.DateTimeFormat("es-MX", { hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(item.termina_en))}</small></div><span className="dashboard-workshop-seats">{item.ocupados} / {item.capacidad} inscritos</span></div>
            <div className="dashboard-workshop-row__actions"><button type="button" disabled={Boolean(attendeeLoading || deleting)} onClick={() => void toggleAttendees(item.id)}><Users size={15}/>{attendeeLoading === item.id ? "Cargando…" : attendees[item.id] ? "Ocultar alumnos" : "Ver inscritos"}</button><button type="button" disabled={Boolean(deleting)} onClick={() => openEdit(item)}><Pencil size={15}/>Editar</button><button type="button" className="is-danger" disabled={Boolean(deleting)} onClick={() => void deleteItem(item)}><Trash2 size={15}/>{deleting === item.id ? "Eliminando…" : "Eliminar"}</button></div>
            {attendees[item.id] && <div className="dashboard-workshop-attendees">{attendees[item.id].length === 0 ? <p>Aún no hay alumnos inscritos.</p> : attendees[item.id].map((row) => <p key={row.id}><strong>{row.profiles ? `${row.profiles.nombre} ${row.profiles.apellido_paterno} ${row.profiles.apellido_materno ?? ""}` : "Alumno"}</strong><span>{row.profiles?.matricula} · {row.profiles?.carrera}</span></p>)}</div>}
          </article>
        ))}
      </div>
      {items.length > 0 && <div className="dashboard-modal__footer"><button type="button" onClick={onClose}>Cerrar</button><button type="button" className="dashboard-primary-button" onClick={openNew}><Plus size={17}/>Agregar taller</button></div>}

      {showForm && createPortal(<div className="dashboard-modal-backdrop dashboard-modal-backdrop--nested" role="presentation" onMouseDown={() => !saving && setShowForm(false)}><section className="dashboard-modal dashboard-modal--workshop" role="dialog" aria-modal="true" aria-labelledby="workshop-form-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="dashboard-modal__header"><div><p className="dashboard-eyebrow">{editing ? "EDITAR TALLER" : "NUEVA ACTIVIDAD"}</p><h2 id="workshop-form-title">{editing ? "Actualiza el taller" : "Añade un taller"}</h2></div><button type="button" onClick={() => !saving && setShowForm(false)} aria-label="Cerrar" disabled={saving}><X size={20}/></button></div>
        <form onSubmit={submit} className="dashboard-event-form">
          <label>Nombre del taller<input name="titulo" defaultValue={editing?.titulo ?? ""} required maxLength={120}/></label>
          <label>Descripción<textarea name="descripcion" defaultValue={editing?.descripcion ?? ""} rows={3} maxLength={1200}/></label>
          <div className="dashboard-form-grid"><label>Ponente<input name="ponente" defaultValue={editing?.ponente ?? ""} maxLength={160}/></label><label>Lugar<input name="lugar" defaultValue={editing?.lugar ?? ""} required maxLength={200}/></label></div>
          <div className="dashboard-form-grid"><label>Inicia<WorkshopDateTimeField name="inicia_en" defaultValue={editing ? asLocalDateTime(new Date(editing.inicia_en)) : startDefault}/></label><label>Termina<WorkshopDateTimeField name="termina_en" defaultValue={editing ? asLocalDateTime(new Date(editing.termina_en)) : endDefault}/></label></div>
          <label>Cupo máximo<input type="number" name="capacidad" min={Math.max(1, Number(editing?.ocupados ?? 0))} max={10000} step={1} defaultValue={editing?.capacidad ?? 25} required/><small>Hay {editing?.ocupados ?? 0} lugares ocupados. La capacidad debe ser un entero mayor a cero.</small></label>
          {error && <p role="alert" className="dashboard-workshop-error dashboard-workshop-error--form">{error}</p>}
          <div className="dashboard-modal__footer"><button type="button" disabled={saving} onClick={() => setShowForm(false)}>Cancelar</button><button type="submit" className="dashboard-primary-button" disabled={saving}>{saving ? "Guardando…" : editing ? "Guardar cambios" : "Crear taller"}</button></div>
        </form>
      </section></div>, document.body)}
    </section>
  </div>;
}
