export type EventStatus = "Publicado" | "Borrador";
export type DashboardEvent = {
    id: string;
    title: string;
    description?: string;
    image?: string;
    date: string;
    dateValue?: string;
    time: string;
    location: string;
    audience: string;
    registrationUrl?: string;
    type?: "academico" | "cultural" | "deportivo";
    status: EventStatus;
    accent: "amber" | "green" | "blue";
};
export const eventStorageKey = "utt-dashboard-events";
const initialEvents: DashboardEvent[] = [
    { id: "feria-talento", title: "Feria de talento UTT 2026", date: "14 AGO", dateValue: "2026-08-14", time: "09:00 — 14:00 h", location: "Explanada principal", audience: "Comunidad UTT", status: "Publicado", accent: "amber" },
    { id: "ia-aula", title: "IA aplicada en el aula", date: "22 AGO", dateValue: "2026-08-22", time: "11:00 — 12:30 h", location: "Auditorio B", audience: "Docentes y estudiantes", status: "Publicado", accent: "green" },
    { id: "ciberseguridad", title: "Semana de ciberseguridad", date: "04 SEP", dateValue: "2026-09-04", time: "10:00 — 16:00 h", location: "Edificio de TIC", audience: "Carreras de tecnología", status: "Borrador", accent: "blue" },
];
export function getDashboardEvents(): DashboardEvent[] {
    try {
        const saved = localStorage.getItem(eventStorageKey);
        return saved ? JSON.parse(saved) : initialEvents;
    }
    catch {
        return initialEvents;
    }
}
export function saveDashboardEvents(events: DashboardEvent[]) {
    localStorage.setItem(eventStorageKey, JSON.stringify(events));
}
export function makeDateLabel(value: string) {
    if (!value)
        return "PRÓXIMAMENTE";
    return new Intl.DateTimeFormat("es-MX", { day: "2-digit", month: "short" })
        .format(new Date(`${value}T12:00:00`))
        .replace(".", "")
        .toUpperCase();
}
export function getEventDateParts(value: string) {
    const [day = "", month = ""] = value.trim().replace(/[-/]/g, " ").split(/\s+/);
    return { day, month };
}
