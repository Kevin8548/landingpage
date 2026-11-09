import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, Clock3, Download, Pencil, Plus, RefreshCw, Trash2, Users, X } from "lucide-react";
import * as XLSX from "xlsx-js-style";
import { listAdminEventWorkshops, listWorkshopAttendees, removeWorkshop, saveWorkshop, type Workshop, type WorkshopAttendee, type WorkshopInput } from "../../services/workshops";
import { showDashboardAlert } from "../../lib/dashboardAlerts";
import { userFacingError } from "../../lib/userFacingErrors";

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
  const [attendees, setAttendees] = useState<Record<string, WorkshopAttendee[]>>({});
  const [attendeeWorkshop, setAttendeeWorkshop] = useState<Workshop | null>(null);
  const [attendeeLoading, setAttendeeLoading] = useState("");
  const [deleting, setDeleting] = useState("");
  const [editing, setEditing] = useState<Workshop | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const startDefault = useMemo(() => dateTimeValue(eventDate, eventTime), [eventDate, eventTime]);
  const endDefault = useMemo(() => {
    const start = new Date(startDefault);
    start.setMinutes(start.getMinutes() + 90);
    return asLocalDateTime(start);
  }, [startDefault]);

  const refresh = useCallback(async () => {
    setItems(await listAdminEventWorkshops(eventId));
    setLoadFailed(false);
    setError("");
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
        const rows = await listAdminEventWorkshops(eventId);
        if (active) { setItems(rows); setLoadFailed(false); }
      } catch (reason) {
        if (active) { setLoadFailed(true); setError(userFacingError(reason, "No se pudieron cargar los talleres. Revisa tu conexión e inténtalo de nuevo.")); }
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
        else if (attendeeWorkshop) setAttendeeWorkshop(null);
        else onClose();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [attendeeWorkshop, onClose, showForm]);

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
      setError(userFacingError(reason, "No se pudo guardar el taller. Revisa tu conexión e inténtalo nuevamente."));
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
    } catch (reason) { setError(userFacingError(reason, "No se pudo eliminar el taller. Inténtalo de nuevo.")); }
    finally { setDeleting(""); }
  };

  const openAttendees = async (item: Workshop) => {
    setAttendeeLoading(item.id); setError("");
    try { const rows = await listWorkshopAttendees(item.id); setAttendees((current) => ({ ...current, [item.id]: rows })); setAttendeeWorkshop(item); }
    catch (reason) { setError(userFacingError(reason, "No se pudieron consultar los alumnos inscritos. Revisa tu conexión e inténtalo de nuevo.")); }
    finally { setAttendeeLoading(""); }
  };

  const refreshAttendees = async (id: string) => {
    setAttendeeLoading(id); setError("");
    try { const rows = await listWorkshopAttendees(id); setAttendees((current) => ({ ...current, [id]: rows })); }
    catch (reason) { setError(userFacingError(reason, "No se pudo actualizar la lista de inscritos. Inténtalo de nuevo.")); }
    finally { setAttendeeLoading(""); }
  };

  const exportAttendees = (item: Workshop, rows: WorkshopAttendee[]) => {
    const headers = ["Matrícula", "Nombre completo", "Carrera", "Grado", "Grupo", "Folio", "Fecha de inscripción"];
    const data = rows.map((row) => [
      row.matricula ?? "",
      [row.nombre, row.apellido_paterno, row.apellido_materno].filter(Boolean).join(" ") || "Alumno",
      row.carrera ?? "",
      row.grado ?? "",
      row.grupo ?? "",
      row.folio ?? "Sin asignar",
      new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeStyle: "short" }).format(new Date(row.created_at)),
    ]);
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
    worksheet["!cols"] = [{ wch: 17 }, { wch: 32 }, { wch: 36 }, { wch: 12 }, { wch: 10 }, { wch: 18 }, { wch: 24 }];
    worksheet["!autofilter"] = { ref: `A1:G${Math.max(1, data.length + 1)}` };
    Object.keys(worksheet).filter((address) => !address.startsWith("!")).forEach((address) => {
      const cell = worksheet[address];
      const rowIndex = Number(address.match(/\d+$/)?.[0] ?? "1");
      if (rowIndex === 1) {
        cell.s = { font: { bold: true, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: "174C34" } }, alignment: { vertical: "center" }, border: { bottom: { style: "medium", color: { rgb: "E9A820" } } } };
      } else {
        cell.s = { font: { color: { rgb: "20252B" } }, fill: rowIndex % 2 === 0 ? { fgColor: { rgb: "F1F6F2" } } : { fgColor: { rgb: "FFFFFF" } }, alignment: { vertical: "center" }, border: { bottom: { style: "hair", color: { rgb: "DDE5DF" } } } };
      }
    });
    worksheet["!rows"] = [{ hpt: 26 }, ...data.map(() => ({ hpt: 21 }))];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inscritos");
    const safeTitle = item.titulo.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase() || "taller";
    XLSX.writeFile(workbook, `inscritos-${safeTitle}.xlsx`, { compression: true });
  };

  return <div className="dashboard-modal-backdrop dashboard-workshop-backdrop" role="presentation" onMouseDown={onClose}>
    <section className="dashboard-modal dashboard-modal--workshop-manager" role="dialog" aria-modal="true" aria-labelledby="workshop-manager-title" onMouseDown={(event) => event.stopPropagation()}>
      <div className="dashboard-modal__header"><div><p className="dashboard-eyebrow">TALLERES DEL EVENTO</p><h2 id="workshop-manager-title">{eventTitle}</h2><p className="dashboard-workshop-subtitle">Administra horarios, cupos y asistentes desde el mismo evento.</p></div><button type="button" onClick={onClose} aria-label="Cerrar"><X size={20}/></button></div>
      {error && !showForm && !loadFailed && <p role="alert" className="dashboard-workshop-error">{error}</p>}
      <div className="dashboard-workshop-list" aria-busy={loading}>
        {loading ? <div className="dashboard-workshop-loading" aria-live="polite">Cargando talleres…</div> : loadFailed ? <div className="dashboard-workshop-empty"><CalendarDays size={25}/><strong>No pudimos cargar los talleres</strong><span>{error || "Revisa tu conexión e inténtalo de nuevo."}</span><button type="button" className="dashboard-primary-button" onClick={() => { setLoading(true); setError(""); void refresh().catch((reason) => { setLoadFailed(true); setError(userFacingError(reason, "No se pudieron cargar los talleres. Inténtalo de nuevo.")); }).finally(() => setLoading(false)); }}><RefreshCw size={15}/>Reintentar</button></div> : items.length === 0 ? <div className="dashboard-workshop-empty"><CalendarDays size={25}/><strong>Este evento aún no tiene talleres</strong><span>Agrega actividades aquí. Solo los alumnos con sesión autorizada podrán verlas e inscribirse.</span><button type="button" className="dashboard-primary-button" onClick={openNew}><Plus size={16}/>Agregar primer taller</button></div> : items.map((item) => (
          <article className="dashboard-workshop-row" key={item.id}>
            <div className="dashboard-workshop-row__main"><div><h3>{item.titulo}</h3><p>{item.ponente || "Ponente por confirmar"} · {item.lugar}</p><small>{displayTime(item.inicia_en)} – {new Intl.DateTimeFormat("es-MX", { hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(item.termina_en))}</small></div>{Number(item.ocupados) >= Number(item.capacidad) ? <span className="dashboard-workshop-seats is-full">Lleno · {item.ocupados} / {item.capacidad}</span> : <span className="dashboard-workshop-seats">{Math.max(0, item.capacidad - Number(item.ocupados))} lugares disponibles · {item.ocupados} / {item.capacidad}</span>}</div>
            <div className="dashboard-workshop-row__actions"><button type="button" disabled={Boolean(attendeeLoading || deleting)} onClick={() => void openAttendees(item)}><Users size={15}/>{attendeeLoading === item.id ? "Cargando…" : "Ver inscritos"}</button><button type="button" disabled={Boolean(deleting)} onClick={() => openEdit(item)}><Pencil size={15}/>Editar</button><button type="button" className="is-danger" disabled={Boolean(deleting)} onClick={() => void deleteItem(item)}><Trash2 size={15}/>{deleting === item.id ? "Eliminando…" : "Eliminar"}</button></div>
          </article>
        ))}
      </div>
      {items.length > 0 && <div className="dashboard-modal__footer"><button type="button" onClick={onClose}>Cerrar</button><button type="button" className="dashboard-primary-button" onClick={openNew}><Plus size={17}/>Agregar taller</button></div>}

      {attendeeWorkshop && createPortal(<div className="dashboard-modal-backdrop dashboard-modal-backdrop--nested dashboard-workshop-attendees-backdrop" role="presentation" onMouseDown={() => setAttendeeWorkshop(null)}><section className="dashboard-modal dashboard-modal--workshop-attendees" role="dialog" aria-modal="true" aria-labelledby="workshop-attendees-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="dashboard-modal__header"><div><p className="dashboard-eyebrow">LISTA DE INSCRITOS</p><h2 id="workshop-attendees-title">{attendeeWorkshop.titulo}</h2><p className="dashboard-workshop-subtitle">{eventTitle} · {attendees[attendeeWorkshop.id]?.length ?? 0} {(attendees[attendeeWorkshop.id]?.length ?? 0) === 1 ? "alumno inscrito" : "alumnos inscritos"}</p></div><button type="button" onClick={() => setAttendeeWorkshop(null)} aria-label="Cerrar lista"><X size={20}/></button></div>
        <div className="dashboard-workshop-attendees__toolbar"><button type="button" disabled={attendeeLoading === attendeeWorkshop.id} onClick={() => void refreshAttendees(attendeeWorkshop.id)}><RefreshCw size={15}/>{attendeeLoading === attendeeWorkshop.id ? "Actualizando…" : "Actualizar lista"}</button><button type="button" disabled={!attendees[attendeeWorkshop.id]?.length} onClick={() => exportAttendees(attendeeWorkshop, attendees[attendeeWorkshop.id] ?? [])}><Download size={15}/>Descargar Excel</button></div>
        <div className="dashboard-workshop-attendees__list" aria-live="polite">{attendeeLoading === attendeeWorkshop.id && !attendees[attendeeWorkshop.id] ? <p className="dashboard-workshop-attendees__empty">Cargando alumnos inscritos…</p> : !attendees[attendeeWorkshop.id]?.length ? <p className="dashboard-workshop-attendees__empty">Aún no hay alumnos inscritos en este taller.</p> : attendees[attendeeWorkshop.id].map((row) => <article key={row.id}><div><strong>{[row.nombre, row.apellido_paterno, row.apellido_materno].filter(Boolean).join(" ") || "Alumno"}</strong><span>{row.matricula || "Matrícula no disponible"}{row.carrera ? ` · ${row.carrera}` : ""}</span><span>{row.grado ? `${row.grado}°` : "Grado no disponible"}{row.grupo ? ` · Grupo ${row.grupo}` : " · Grupo no disponible"}{row.folio ? ` · Folio ${row.folio}` : " · Sin folio asignado"}</span></div><time dateTime={row.created_at}>{new Intl.DateTimeFormat("es-MX", { dateStyle: "medium" }).format(new Date(row.created_at))}</time></article>)}</div>
        <div className="dashboard-modal__footer"><button type="button" onClick={() => setAttendeeWorkshop(null)}>Cerrar</button></div>
      </section></div>, document.body)}

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
