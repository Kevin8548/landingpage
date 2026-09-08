import { useEffect, useRef, useState, type DragEvent, type FormEvent } from "react";
import { ArrowUpRight, CalendarDays, ChevronLeft, ChevronRight, Clock3, Eye, ImagePlus, LayoutDashboard, LogOut, MapPin, Menu, Pencil, Plus, Trash2, Upload, Users, X } from "lucide-react";
import { Link } from "react-router-dom";
import { getDashboardEvents, getEventDateParts, makeDateLabel, saveDashboardEvents, type DashboardEvent } from "../data/dashboardEvents";
import { AnimatedThemeToggler } from "../components/ui/AnimatedThemeToggler";
import { showDashboardAlert } from "../lib/dashboardAlerts";
import "../components/dashboard/Dashboard.css";
import "../components/dashboard/DashboardOverrides.css";
import { supabase } from "../lib/supabase";
import { getEventsFromSupabase } from "../services/queries";

function getTodayInputValue() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
}

function toDateValue(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function eventTimeToValue(time = "") {
  const match = time.match(/\b(\d{1,2}):(\d{2})\b/);
  return match ? `${match[1].padStart(2, "0")}:${match[2]}` : "";
}

function DashboardDatePicker({ value, onChange }: { value: Date | null; onChange: (date: Date) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(value ?? new Date());
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const monthName = new Intl.DateTimeFormat("es-MX", { month: "long", year: "numeric" }).format(viewDate);
  const firstDay = (new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay() + 6) % 7;
  const totalDays = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const cells = Array.from({ length: firstDay + totalDays }, (_, index) => index < firstDay ? null : index - firstDay + 1);
  const moveMonth = (amount: number) => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + amount, 1));
  const selectDate = (day: number) => {
    const selected = new Date(viewDate.getFullYear(), viewDate.getMonth(), day, 12);
    if (selected < today) return;
    onChange(selected);
    setIsOpen(false);
  };
  const label = value ? new Intl.DateTimeFormat("es-MX", { day: "2-digit", month: "long", year: "numeric" }).format(value) : "";

  return <div className="dashboard-date-picker"><button type="button" className="dashboard-picker-input" onClick={() => setIsOpen((current) => !current)}>{label}</button>{isOpen && <div className="dashboard-calendar" role="dialog" aria-label="Seleccionar fecha"><div className="dashboard-calendar__header"><button type="button" onClick={() => moveMonth(-1)} aria-label="Mes anterior">‹</button><strong>{monthName}</strong><button type="button" onClick={() => moveMonth(1)} aria-label="Mes siguiente">›</button></div><div className="dashboard-calendar__weekdays">{["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"].map((day) => <span key={day}>{day}</span>)}</div><div className="dashboard-calendar__days">{cells.map((day, index) => { if (!day) return <span key={`empty-${index}`} />; const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day, 12); const disabled = date < today; const selected = value && toDateValue(value) === toDateValue(date); return <button type="button" key={day} disabled={disabled} className={selected ? "is-selected" : ""} onClick={() => selectDate(day)}>{day}</button>; })}</div></div>}</div>;
}

function DashboardTimePicker({ value, onChange }: { value: string; onChange: (time: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const times = Array.from({ length: 48 }, (_, index) => {
    const hour = String(Math.floor(index / 2)).padStart(2, "0");
    const minute = index % 2 === 0 ? "00" : "30";
    return `${hour}:${minute}`;
  });

  const writeTime = (input: string) => {
    const digits = input.replace(/\D/g, "").slice(0, 4);
    onChange(digits.length > 2 ? `${digits.slice(0, 2)}:${digits.slice(2)}` : digits);
  };

  useEffect(() => {
    if (!isOpen) return;
    const closeOnOutsideInteraction = (event: Event) => {
      if (!pickerRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsideInteraction, true);
    document.addEventListener("focusin", closeOnOutsideInteraction, true);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideInteraction, true);
      document.removeEventListener("focusin", closeOnOutsideInteraction, true);
    };
  }, [isOpen]);

  return <div className="dashboard-time-picker" ref={pickerRef}>
    <input className="dashboard-picker-input dashboard-picker-input--time" value={value} onFocus={() => setIsOpen(true)} onClick={() => setIsOpen(true)} onChange={(event) => writeTime(event.target.value)} inputMode="numeric" placeholder="HH:MM" maxLength={5} aria-label="Horario" />
    {isOpen && <div className="dashboard-time-menu" role="listbox" aria-label="Seleccionar horario">
      {times.map((time) => <button type="button" role="option" aria-selected={value === time} className={value === time ? "is-selected" : ""} key={time} onClick={() => { onChange(time); setIsOpen(false); }}>{time} h</button>)}
    </div>}
  </div>;
}

export default function Events() {
  const [events, setEvents] = useState<DashboardEvent[]>([]);
  const [editingEvent, setEditingEvent] = useState<DashboardEvent | null>(null);
  const [viewingEvent, setViewingEvent] = useState<DashboardEvent | null>(null);
  const [isFormOpen, setFormOpen] = useState(() => new URLSearchParams(window.location.search).get("crear") === "1");
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | undefined>();
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const today = getTodayInputValue();

  useEffect(() => {
    const fetchEvents = async () => {
      const dbEvents = await getEventsFromSupabase();
      
      const mappedEvents = dbEvents.map((dbEvent) => {
        return {
          id: dbEvent.id,
          title: dbEvent.title,
          date: makeDateLabel(dbEvent.date),
          dateValue: dbEvent.date,
          time: `${dbEvent.time} h`, 
          location: dbEvent.location,
          audience: dbEvent.description.replace('Dirigido a: ', ''),
          status: "Publicado" as const,
          accent: "green" as const
        };
      });
      
      setEvents(mappedEvents);
    };
    
    fetchEvents();
  }, []);


  useEffect(() => {
    if (!isFormOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isFormOpen]);

  const openCreator = () => { setEditingEvent(null); setSelectedDate(null); setSelectedTime(""); setSelectedImage(undefined); setFormOpen(true); };
  const openEditor = (event: DashboardEvent) => {
    setEditingEvent(event);
    setSelectedDate(event.dateValue ? new Date(`${event.dateValue}T12:00:00`) : null);
    setSelectedTime(eventTimeToValue(event.time));
    setSelectedImage(event.image);
    setFormOpen(true);
  };

  const loadImage = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      void showDashboardAlert({ icon: "warning", title: "Archivo no válido", text: "Selecciona una imagen PNG, JPG, WEBP o similar." });
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

    const saveEvent = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const data = new FormData(event.currentTarget);

    const title = String(data.get("title") || "").trim();
    const description = String(data.get("description") || "").trim();
    const dateValue = selectedDate ? toDateValue(selectedDate) : "";
    const timeValue = selectedTime;
    const location = String(data.get("location") || "").trim();
    const audience =
      String(data.get("audience") || "").trim() || "Comunidad UTT";

    if (!title || !dateValue || !timeValue || !location) return;

    // Datos que necesita el backend
    const dbEventPayload = {
      titulo: title,
      descripcion: `Dirigido a: ${audience}`,
      fecha_inicio: `${dateValue}T${timeValue}:00`,
      fecha_fin: `${dateValue}T${timeValue}:00`,
      lugar: location,
      tipo: "Otro",
      modalidad: "Presencial"
    };

    try {
      if (editingEvent) {
        // Por ahora conservamos la edición local
        const details = {
          title,
          description,
          image: selectedImage,
          date: makeDateLabel(dateValue),
          dateValue,
          time: `${timeValue} h`,
          location,
          audience
        };

        setEvents((current) =>
          current.map((item) =>
            item.id === editingEvent.id
              ? { ...item, ...details }
              : item
          )
        );

        void showDashboardAlert({
          icon: "success",
          title: "Cambios guardados",
          text: "El evento fue actualizado."
        });
      } else {
        // Conexión con el backend de tu compañera
        const {
          data: { session }
        } = await supabase.auth.getSession();

        if (!session) {
          throw new Error(
            "No hay sesión activa. Por favor, vuelve a iniciar sesión."
          );
        }

        const { data: responseData, error } =
          await supabase.functions.invoke("manage-events", {
            body: dbEventPayload,
            headers: {
              Authorization: `Bearer ${session.access_token}`
            }
          });

        if (error) throw error;

        // Conservamos también tus datos nuevos en la interfaz
        const newEventUI = {
          id: responseData[0].id,
          title,
          description,
          image: selectedImage,
          date: makeDateLabel(dateValue),
          dateValue,
          time: `${timeValue} h`,
          location,
          audience,
          status: "Publicado" as const,
          accent: "green" as const
        };

        setEvents((current) => [newEventUI, ...current]);

        void showDashboardAlert({
          icon: "success",
          title: "Evento publicado",
          text: "Guardado de forma segura en Supabase."
        });
      }
    } catch (err: any) {
      console.error(err);

      void showDashboardAlert({
        icon: "error",
        title: "Error de seguridad",
        text: "No tienes permisos para crear eventos."
      });
    }

    setFormOpen(false);
    setEditingEvent(null);
  };

  const deleteEvent = async (event: DashboardEvent) => {
    const result = await showDashboardAlert({
      icon: "warning",
      title: "¿Está seguro de querer eliminar este evento?",
      text: `“${event.title}” se eliminará.`,
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });
    if (!result.isConfirmed) return;
    setEvents((current) => current.filter((item) => item.id !== event.id));
    void showDashboardAlert({ icon: "success", title: "Evento eliminado", timer: 1600, showConfirmButton: false });
  };

  return <main className="dashboard-page">
    <aside className={`dashboard-sidebar ${isSidebarOpen ? "is-open" : ""} ${isSidebarCollapsed ? "is-collapsed" : ""}`}>
      <button className="dashboard-sidebar-collapse" onClick={() => setSidebarCollapsed((value) => !value)} aria-label={isSidebarCollapsed ? "Expandir barra lateral" : "Contraer barra lateral"}>
        {isSidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>
      <div className="dashboard-brand"><span className="dashboard-brand__mark">UTT</span><span>Universidad Tecnológica<br />de Tlaxcala</span><button className="dashboard-sidebar__close" onClick={() => setSidebarOpen(false)} aria-label="Cerrar menú"><X size={19}/></button></div>
      <nav className="dashboard-nav" aria-label="Navegación del panel"><Link to="/dashboard"><LayoutDashboard size={18}/>Resumen</Link><Link className="is-active" to="/dashboard/eventos"><CalendarDays size={18}/>Eventos <span>{events.length}</span></Link><button type="button" onClick={openCreator}><Plus size={18}/>Crear evento</button></nav>
      <div className="dashboard-sidebar__bottom"><div className="dashboard-profile"><span className="dashboard-avatar">AD</span><div><strong>Administrador</strong><small>Panel de eventos</small></div></div><Link to="/" className="dashboard-signout"><LogOut size={17}/>Salir al sitio</Link></div>
    </aside>

    <section className="dashboard-content"><header className="dashboard-topbar">
      <button className="dashboard-menu-button" onClick={() => setSidebarOpen(true)} aria-label="Abrir menú"><Menu size={21}/></button>
      <div className="dashboard-breadcrumb"><Link to="/dashboard">Panel</Link><span>/</span><strong>Eventos</strong></div>
      <div className="dashboard-topbar__actions"><AnimatedThemeToggler className="dashboard-theme-toggle" /><span className="dashboard-avatar dashboard-avatar--small">AD</span></div>
    </header>
      <div className="dashboard-body dashboard-body--events"><div className="dashboard-welcome"><div><p className="dashboard-eyebrow"><CalendarDays size={14}/> ADMINISTRACIÓN</p><h1>Tus eventos<span>.</span></h1><p>Crea los eventos.</p></div><button className="dashboard-primary-button" onClick={openCreator}><Plus size={18}/>Crear evento</button></div>
        <section className="dashboard-events dashboard-events--standalone"><div className="dashboard-section-heading"><div><p>LISTADO DE EVENTOS</p><h2>{events.length} {events.length === 1 ? "evento" : "eventos"}</h2></div></div><div className="dashboard-event-list">
          {events.map((event, index) => { const date = getEventDateParts(event.date); const stripeColor = index % 2 === 0 ? "amber" : "green"; return <article className="dashboard-event-row" key={event.id}><div className={`dashboard-event-row__stripe dashboard-event-row__stripe--${stripeColor}`} /><div className="dashboard-event-row__date"><strong>{date.day}</strong><span>{date.month}</span></div><div className="dashboard-event-row__details"><span className={event.status === "Publicado" ? "dashboard-status" : "dashboard-status dashboard-status--draft"}><i />{event.status}</span><h3>{event.title}</h3><p>{event.location} · {event.time}</p></div><div className="dashboard-event-actions"><button onClick={() => setViewingEvent(event)}><Eye size={16} /><span>Ver</span></button><button onClick={() => openEditor(event)}><Pencil size={15} /><span>Editar</span></button><button className="is-danger" onClick={() => void deleteEvent(event)}><Trash2 size={15} /><span>Eliminar</span></button></div></article>; })}
        </div></section>
      </div></section>
    {isFormOpen && <div className="dashboard-modal-backdrop" role="presentation" onMouseDown={() => setFormOpen(false)}><section className="dashboard-modal" role="dialog" aria-modal="true" aria-labelledby="event-form-title" onMouseDown={(event) => event.stopPropagation()}><div className="dashboard-modal__header"><div><p className="dashboard-eyebrow">{editingEvent ? "EDITAR EVENTO" : "NUEVO EVENTO"}</p><h2 id="event-form-title">{editingEvent ? "Actualiza los detalles" : "Comparte algo importante"}</h2></div><button onClick={() => setFormOpen(false)} aria-label="Cerrar"><X size={20}/></button></div><form onSubmit={saveEvent} className="dashboard-event-form"><div className={`dashboard-image-upload ${isDraggingImage ? "is-dragging" : ""}`} onClick={() => imageInputRef.current?.click()} onDragOver={(event) => { event.preventDefault(); setIsDraggingImage(true); }} onDragLeave={() => setIsDraggingImage(false)} onDrop={handleImageDrop} role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") imageInputRef.current?.click(); }}><input ref={imageInputRef} type="file" accept="image/*" className="sr-only" onChange={(event) => loadImage(event.target.files?.[0])}/>{selectedImage ? <><img src={selectedImage} alt="Vista previa del evento"/><div className="dashboard-image-upload__overlay"><Upload size={18}/><span>Cambiar imagen</span></div><button type="button" className="dashboard-image-upload__remove" onClick={(event) => { event.stopPropagation(); setSelectedImage(undefined); if (imageInputRef.current) imageInputRef.current.value = ""; }} aria-label="Quitar imagen"><X size={16}/></button></> : <div className="dashboard-image-upload__empty"><ImagePlus size={25}/><strong>Sube la imagen del evento</strong><span>Haz clic o arrastra la imagen aquí</span><small>PNG O JPG · Máximo 3 MB</small></div>}</div><label>Nombre del evento<input name="title" defaultValue={editingEvent?.title} autoFocus required/></label><label>Descripción<textarea name="description" defaultValue={editingEvent?.description} placeholder="" rows={3}/></label><div className="dashboard-form-grid"><label>Fecha<DashboardDatePicker value={selectedDate} onChange={setSelectedDate} /></label><label>Horario<DashboardTimePicker value={selectedTime} onChange={setSelectedTime} /></label></div><label>Lugar<input name="location" defaultValue={editingEvent?.location} required/></label><label>Público al que va dirigido<input name="audience" defaultValue={editingEvent?.audience}/></label><div className="dashboard-modal__footer"><button type="button" onClick={() => setFormOpen(false)}>Cancelar</button><button className="dashboard-primary-button" type="submit">{editingEvent ? "Guardar cambios" : "Publicar evento"}<ArrowUpRight size={17}/></button></div></form></section></div>}
    {viewingEvent && <div className="dashboard-modal-backdrop" role="presentation" onMouseDown={() => setViewingEvent(null)}><section className="dashboard-modal dashboard-view-modal" role="dialog" aria-modal="true" aria-labelledby="event-view-title" onMouseDown={(event) => event.stopPropagation()}><div className="dashboard-modal__header"><div><p className="dashboard-eyebrow">DETALLE DEL EVENTO</p><h2 id="event-view-title">{viewingEvent.title}</h2></div><button onClick={() => setViewingEvent(null)} aria-label="Cerrar"><X size={20}/></button></div><div className="dashboard-view-image">{viewingEvent.image ? <img src={viewingEvent.image} alt={`Imagen de ${viewingEvent.title}`}/> : <div className="dashboard-view-image__empty"><ImagePlus size={25}/><span>Este evento no tiene imagen</span></div>}</div>{viewingEvent.description && <div className="dashboard-view-description"><strong>Descripción</strong><p>{viewingEvent.description}</p></div>}<div className="dashboard-view-details"><p><CalendarDays size={18}/><span><strong>Fecha</strong>{viewingEvent.date}</span></p><p><Clock3 size={18}/><span><strong>Horario</strong>{viewingEvent.time}</span></p><p><MapPin size={18}/><span><strong>Lugar</strong>{viewingEvent.location}</span></p><p><Users size={18}/><span><strong>Dirigido a</strong>{viewingEvent.audience}</span></p></div><div className="dashboard-modal__footer"><button type="button" onClick={() => setViewingEvent(null)}>Cerrar</button><button className="dashboard-primary-button" onClick={() => { setViewingEvent(null); openEditor(viewingEvent); }}><Pencil size={16}/>Editar evento</button></div></section></div>}
  </main>;
}
