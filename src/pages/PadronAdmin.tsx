import { useState, useRef, useEffect, useLayoutEffect, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { 
  ChevronLeft, ChevronRight, ChevronDown, LayoutDashboard, CalendarDays, FolderKanban, ShieldCheck, Users,
  LogOut, Menu, X, Upload, FileText, Plus, Pencil, Trash2, Search, Download, Check
} from "lucide-react";
import { AnimatedThemeToggler } from "../components/ui/AnimatedThemeToggler";
import { supabase } from "../lib/supabase";
import { useDashboardSidebar } from "../lib/useDashboardSidebar";
import { usePrimaryAdmin } from "../lib/usePrimaryAdmin";
import { useAdminName } from "../lib/useAdminName";
import "../components/dashboard/Dashboard.css";
import "../components/dashboard/DashboardOverrides.css";
import { showDashboardAlert } from "../lib/dashboardAlerts";
import { userFacingError } from "../lib/userFacingErrors";
import DashboardSelect from "../components/dashboard/DashboardSelect";

type Alumno = {
  id?: string;
  matricula: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  carrera: string;
  grado: string;
  grupo: string;
  fecha_nacimiento: string;
  folio?: string | null;
  folio_usado?: boolean;
  registrado?: boolean;
};

// Caché por administrador para conservar el padrón durante cambios de sección
// sin mezclar datos personales entre sesiones.
const padronesEnMemoria = new Map<string, Alumno[]>();

const dateFromValue = (value: string) => value ? new Date(`${value}T12:00:00`) : new Date();
const dateToValue = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

function parseCsvRecords(text: string, delimiter: string) {
  const records: string[][] = [];
  let record: string[] = [];
  let field = "";
  let quoted = false;
  const source = text.replace(/^\uFEFF/, "");

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    if (char === '"') {
      if (quoted && source[index + 1] === '"') { field += '"'; index += 1; }
      else quoted = !quoted;
    } else if (!quoted && char === delimiter) {
      record.push(field.trim()); field = "";
    } else if (!quoted && (char === "\n" || char === "\r")) {
      if (char === "\r" && source[index + 1] === "\n") index += 1;
      record.push(field.trim());
      if (record.some((value) => value.length > 0)) records.push(record);
      record = []; field = "";
    } else field += char;
  }

  record.push(field.trim());
  if (record.some((value) => value.length > 0)) records.push(record);
  return records;
}

function normalizeCsvDate(value: string) {
  const date = value.trim();
  const iso = date.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  const local = date.match(/^(\d{1,2})[/.\-](\d{1,2})[/.\-](\d{4})$/);
  let year: number, month: number, day: number;
  if (iso) [, year, month, day] = iso.map(Number) as [number, number, number, number];
  else if (local) [, day, month, year] = local.map(Number) as [number, number, number, number];
  else if (/^\d+(?:\.\d+)?$/.test(date)) {
    const serial = Number(date);
    if (serial < 1 || serial > 100000) return "";
    const excelDate = new Date(Date.UTC(1899, 11, 30) + Math.floor(serial) * 86400000);
    year = excelDate.getUTCFullYear(); month = excelDate.getUTCMonth() + 1; day = excelDate.getUTCDate();
  } else return "";

  const check = new Date(Date.UTC(year, month - 1, day));
  if (check.getUTCFullYear() !== year || check.getUTCMonth() + 1 !== month || check.getUTCDate() !== day) return "";
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function parseStudentCsv(text: string): Alumno[] {
  const firstLine = text.replace(/^\uFEFF/, "").split(/\r?\n/, 1)[0] ?? "";
  let quoted = false;
  const counts = { ",": 0, ";": 0, "\t": 0 };
  for (let index = 0; index < firstLine.length; index += 1) {
    const char = firstLine[index];
    if (char === '"') {
      if (quoted && firstLine[index + 1] === '"') index += 1;
      else quoted = !quoted;
    } else if (!quoted && char in counts) counts[char as keyof typeof counts] += 1;
  }
  const delimiter = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? ",";
  const records = parseCsvRecords(text, delimiter);
  if (records.length === 0) throw new Error("El archivo está vacío.");

  const normalizeHeader = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z]/g, "");
  const headers = records[0].map(normalizeHeader);
  const headerIndex = (predicate: (value: string) => boolean) => headers.findIndex(predicate);
  const headerMap = {
    matricula: headerIndex((value) => value.includes("matricula")),
    nombre: headerIndex((value) => value === "nombre" || value === "nombres"),
    paterno: headerIndex((value) => value.includes("paterno")),
    materno: headerIndex((value) => value.includes("materno")),
    carrera: headerIndex((value) => value.includes("carrera")),
    grado: headerIndex((value) => value.includes("grado")),
    grupo: headerIndex((value) => value.includes("grupo")),
    fecha: headerIndex((value) => value.includes("fecha") && (value.includes("nac") || value.includes("nacimiento"))),
    folio: headerIndex((value) => value.includes("folio")),
  };
  const hasHeader = headerMap.matricula >= 0 && headerMap.nombre >= 0 && headerMap.fecha >= 0;
  const columns = hasHeader
    ? { matricula: headerMap.matricula, nombre: headerMap.nombre, paterno: headerMap.paterno, materno: headerMap.materno, carrera: headerMap.carrera, grado: headerMap.grado, grupo: headerMap.grupo, fecha: headerMap.fecha, folio: headerMap.folio }
    : { matricula: 0, nombre: 1, paterno: 2, materno: 3, carrera: 4, grado: 5, grupo: 6, fecha: 7, folio: -1 };
  const get = (row: string[], index: number) => index >= 0 ? (row[index] ?? "").trim() : "";
  const rows = records.slice(hasHeader ? 1 : 0);
  const invalidRows: number[] = [];
  const students: Alumno[] = [];
  const seenMatriculas = new Set<string>();
  const duplicateMatriculas = new Set<string>();
  const seenFolios = new Set<string>();
  const duplicateFolios = new Set<string>();

  rows.forEach((row, index) => {
    const matricula = get(row, columns.matricula).toUpperCase();
    const nombre = get(row, columns.nombre);
    const apellidoPaterno = get(row, columns.paterno);
    const apellidoMaterno = get(row, columns.materno);
    const carrera = get(row, columns.carrera);
    const grado = get(row, columns.grado);
    const grupo = get(row, columns.grupo).toUpperCase();
    const fechaNacimiento = normalizeCsvDate(get(row, columns.fecha));
    const folio = get(row, columns.folio).replace(/\s+/g, "").toUpperCase();
    // Las filas vacías de Excel suelen contener solo delimitadores; no son alumnos.
    if (![matricula, nombre, apellidoPaterno, apellidoMaterno, carrera, grado, grupo, get(row, columns.fecha), folio].some(Boolean)) return;
    if (!matricula || !nombre || !apellidoPaterno || !carrera || !fechaNacimiento || (folio && !/^[A-Z0-9-]{1,64}$/.test(folio))) {
      invalidRows.push(index + (hasHeader ? 2 : 1));
      return;
    }
    if (seenMatriculas.has(matricula)) duplicateMatriculas.add(matricula);
    seenMatriculas.add(matricula);
    if (folio && seenFolios.has(folio)) duplicateFolios.add(folio);
    if (folio) seenFolios.add(folio);
    students.push({ matricula, nombre, apellido_paterno: apellidoPaterno, apellido_materno: apellidoMaterno, carrera, grado, grupo, fecha_nacimiento: fechaNacimiento, ...(folio ? { folio } : {}) });
  });

  if (invalidRows.length) throw new Error(`Revisa las filas ${invalidRows.slice(0, 5).join(", ")}${invalidRows.length > 5 ? " y otras" : ""}. Cada alumno debe incluir matrícula, nombre, apellido paterno, carrera y fecha válida (DD/MM/AAAA).`);
  if (duplicateMatriculas.size) throw new Error(`El archivo repite la matrícula ${Array.from(duplicateMatriculas).slice(0, 3).join(", ")}. Corrige los duplicados y vuelve a importarlo.`);
  if (duplicateFolios.size) throw new Error(`El archivo repite el folio ${Array.from(duplicateFolios).slice(0, 3).join(", ")}. Cada alumno debe tener un folio distinto.`);
  if (!students.length) throw new Error("No encontramos alumnos completos en el archivo. Verifica que tenga las columnas del padrón y vuelve a intentarlo.");
  return students;
}

function BirthDatePicker({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [openSelector, setOpenSelector] = useState<"month" | "year" | null>(null);
  const [viewDate, setViewDate] = useState(() => dateFromValue(value));
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const yearListRef = useRef<HTMLDivElement>(null);
  const currentYear = new Date().getFullYear();
  const firstDay = (new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay() + 6) % 7;
  const totalDays = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const label = value ? value.split("-").reverse().join("/") : "Selecciona una fecha";
  const months = Array.from({ length: 12 }, (_, month) => new Intl.DateTimeFormat("es-MX", { month: "long" }).format(new Date(2020, month, 1)));
  const years = Array.from({ length: currentYear - 1899 }, (_, index) => currentYear - index);

  useLayoutEffect(() => {
    if (!isOpen) return;
    const positionMenu = () => {
      const trigger = triggerRef.current;
      const menu = menuRef.current;
      if (!trigger || !menu) return;
      const rect = trigger.getBoundingClientRect();
      const width = Math.min(320, window.innerWidth - 24);
      const height = menu.offsetHeight;
      const left = Math.max(12, Math.min(rect.right - width, window.innerWidth - width - 12));
      let top = rect.bottom + 8;
      if (top + height > window.innerHeight - 12) top = Math.max(12, rect.top - height - 8);
      setMenuPosition({ top, left });
    };
    positionMenu();
    const frame = window.requestAnimationFrame(positionMenu);
    window.addEventListener("resize", positionMenu);
    window.addEventListener("scroll", positionMenu, true);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", positionMenu);
      window.removeEventListener("scroll", positionMenu, true);
    };
  }, [isOpen, viewDate]);

  useLayoutEffect(() => {
    if (openSelector !== "year" || !yearListRef.current) return;
    const selected = yearListRef.current.querySelector<HTMLElement>("[aria-selected='true']");
    if (selected) yearListRef.current.scrollTop = selected.offsetTop - yearListRef.current.offsetTop - yearListRef.current.clientHeight / 2 + selected.clientHeight / 2;
  }, [openSelector]);

  useEffect(() => {
    if (!isOpen) return;
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!triggerRef.current?.contains(event.target as Node) && !menuRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setIsOpen(false); };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  return <div className="event-inline-picker dashboard-birth-date-picker">
    <button ref={triggerRef} type="button" className="event-inline-picker__trigger" onClick={() => { setViewDate(dateFromValue(value)); setOpenSelector(null); setIsOpen((current) => !current); }} aria-expanded={isOpen} aria-haspopup="dialog"><CalendarDays size={14} /><span>{label}</span><ChevronDown className="dashboard-birth-date-picker__chevron" size={15} aria-hidden="true" /></button>
    {isOpen && createPortal(<div ref={menuRef} className="event-inline-picker__menu event-inline-calendar dashboard-birth-date-picker__menu--portal" style={{ top: menuPosition.top, left: menuPosition.left }} role="dialog" aria-label="Seleccionar fecha de nacimiento">
      <header className="dashboard-birth-date-picker__header"><button type="button" onClick={() => { setOpenSelector(null); setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1)); }} aria-label="Mes anterior">‹</button><div className="dashboard-birth-date-picker__selectors">
        <div className="dashboard-birth-date-picker__selector"><button type="button" className="dashboard-birth-date-picker__selector-trigger dashboard-birth-date-picker__selector-trigger--month" aria-label={`Mes: ${months[viewDate.getMonth()]}`} aria-haspopup="listbox" aria-expanded={openSelector === "month"} onClick={() => setOpenSelector((current) => current === "month" ? null : "month")}>{months[viewDate.getMonth()]}<ChevronDown size={14}/></button>{openSelector === "month" && <div className="dashboard-birth-date-picker__option-menu dashboard-birth-date-picker__option-menu--months" role="listbox" aria-label="Mes">{months.map((month, index) => <button type="button" role="option" aria-selected={index === viewDate.getMonth()} className={index === viewDate.getMonth() ? "is-selected" : ""} key={month} onClick={() => { setViewDate(new Date(viewDate.getFullYear(), index, 1)); setOpenSelector(null); }}>{month}</button>)}</div>}</div>
        <div className="dashboard-birth-date-picker__selector"><button type="button" className="dashboard-birth-date-picker__selector-trigger dashboard-birth-date-picker__selector-trigger--year" aria-label={`Año: ${viewDate.getFullYear()}`} aria-haspopup="listbox" aria-expanded={openSelector === "year"} onClick={() => setOpenSelector((current) => current === "year" ? null : "year")}>{viewDate.getFullYear()}<ChevronDown size={14}/></button>{openSelector === "year" && <div ref={yearListRef} className="dashboard-birth-date-picker__option-menu dashboard-birth-date-picker__option-menu--years" role="listbox" aria-label="Año">{years.map((year) => <button type="button" role="option" aria-selected={year === viewDate.getFullYear()} className={year === viewDate.getFullYear() ? "is-selected" : ""} key={year} onClick={() => { setViewDate(new Date(year, viewDate.getMonth(), 1)); setOpenSelector(null); }}>{year}</button>)}</div>}</div>
      </div><button type="button" onClick={() => { setOpenSelector(null); setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1)); }} aria-label="Mes siguiente">›</button></header>
      <div className="event-inline-calendar__week">{["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"].map((day) => <span key={day}>{day}</span>)}</div>
      <div className="event-inline-calendar__days">{Array.from({ length: firstDay + totalDays }, (_, index) => { if (index < firstDay) return <i key={`empty-${index}`} />; const day = index - firstDay + 1; const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day, 12); const nextValue = dateToValue(date); return <button type="button" key={nextValue} className={nextValue === value ? "is-selected" : ""} onClick={() => { onChange(nextValue); setIsOpen(false); }}>{day}</button>; })}</div>
    </div>, document.body)}
  </div>;
}

export default function PadronAdmin() {
  const isPrimaryAdmin = usePrimaryAdmin();
  const { fullName } = useAdminName();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setSidebarCollapsed] = useDashboardSidebar();
  
  // Estado principal
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const isFetchingAlumnos = useRef(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;
  const [assigningFolioId, setAssigningFolioId] = useState<string | null>(null);
  const [folioDraft, setFolioDraft] = useState("");
  const [isSavingFolio, setIsSavingFolio] = useState(false);

  // Efecto para regresar a la página 1 cada que se usa el buscador
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);
  
  // Modales
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingAlumno, setEditingAlumno] = useState<Alumno | null>(null);
  const [selectedBirthDate, setSelectedBirthDate] = useState("");

  // Estados del CSV
  const [csvData, setCsvData] = useState<Alumno[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  

  const fetchAlumnos = async (silent = false) => {
    if (isFetchingAlumnos.current) return;
    isFetchingAlumnos.current = true;
    if (!silent) setIsLoading(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw userError ?? new Error("Inicia sesión para consultar tu padrón.");
      const cachedRows = padronesEnMemoria.get(user.id) ?? [];
      const { data, error } = await supabase
        .from('padron_alumnos')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      const rows = data ?? [];
      // Una respuesta vacía aislada (por ejemplo, durante una renovación de
      // sesión/RLS) no debe borrar el padrón que ya se había cargado.
      if (rows.length === 0 && cachedRows.length > 0) {
        await new Promise((resolve) => window.setTimeout(resolve, 500));
        const retry = await supabase
          .from('padron_alumnos')
          .select('*')
          .order('created_at', { ascending: false });
        if (retry.error) throw retry.error;
        if ((retry.data ?? []).length === 0) {
          const detail = "No se pudo verificar el padrón. Revisa tu conexión a internet e inténtalo de nuevo.";
          setLoadError(detail);
          return;
        }
        padronesEnMemoria.set(user.id, retry.data ?? []);
        setAlumnos(retry.data ?? []);
      } else {
        padronesEnMemoria.set(user.id, rows);
        setAlumnos(rows);
      }
      setLoadError("");
    } catch (reason) {
      console.error("No se pudo cargar el padrón de alumnos:", reason);
      setLoadError(userFacingError(reason, "Revisa tu conexión a internet e inténtalo de nuevo."));
    } finally {
      isFetchingAlumnos.current = false;
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchAlumnos();

    // Actualiza el padrón al volver a esta pestaña y también si la activación
    // se completa desde otra pestaña. Realtime acelera el cambio; el sondeo
    // cubre proyectos donde Realtime aún no está habilitado en Supabase.
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") void fetchAlumnos(true);
    };
    const channel = supabase
      .channel("padron-alumnos-activacion")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "padron_alumnos" }, () => {
        void fetchAlumnos(true);
      })
      .subscribe();
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") void fetchAlumnos(true);
    }, 15000);
    window.addEventListener("focus", refreshWhenVisible);
    document.addEventListener("visibilitychange", refreshWhenVisible);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", refreshWhenVisible);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
      void supabase.removeChannel(channel);
    };
  }, []);

  // Función auxiliar para quitar acentos y pasar a minúsculas
  const normalizeText = (text: string) => {
    if (!text) return "";
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  };
  // Filtrado en tiempo real
  const filteredAlumnos = alumnos.filter(a => {
    if (!searchTerm.trim()) return true;
    
    // Separamos lo que el usuario escribió en palabras individuales
    // Ej: "josé 3A" -> ["jose", "3a"]
    const searchTerms = normalizeText(searchTerm).split(/\s+/).filter(Boolean);
    
    // Creamos una "súper cadena" gigante con toda la información del alumno
    // Incluimos `${a.grado}${a.grupo}` pegado para que si buscan "3A", lo encuentre.
    const alumnoData = normalizeText(`
      ${a.matricula} 
      ${a.nombre} ${a.apellido_paterno} ${a.apellido_materno} 
      ${a.carrera} 
      ${a.grado} ${a.grupo} 
      ${a.grado}${a.grupo}
    `);
    
    // Condición: El alumno se muestra SOLO si TODAS las palabras que el usuario escribió
    // se encuentran en la "súper cadena" de datos, sin importar el orden.
    return searchTerms.every(term => alumnoData.includes(term));
  });

  const totalPages = Math.ceil(filteredAlumnos.length / ITEMS_PER_PAGE);
  const currentAlumnos = filteredAlumnos.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

    const exportToCSV = () => {
    if (filteredAlumnos.length === 0) return;

    const headers = ["Matricula", "Nombre", "Apellido Paterno", "Apellido Materno", "Carrera", "Grado", "Grupo", "Fecha Nacimiento", "Folio", "Estado"];
    
    const rows = filteredAlumnos.map(a => [
      a.matricula, a.nombre, a.apellido_paterno, a.apellido_materno, 
      a.carrera, a.grado, a.grupo, a.fecha_nacimiento, a.folio ?? "",
      a.registrado ? "Validado" : "Pendiente"
    ]);

    // Unir todo y escapar comillas por si un nombre lleva símbolos
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(field => `"${String(field || "").replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    // El '\uFEFF' es un truco técnico para que Microsoft Excel lea perfectamente los acentos (UTF-8 BOM)
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    
    // Si buscaste algo, el archivo se llamará "Padron_3A.csv", sino "Padron_Completo.csv"
    const fileName = searchTerm ? `Padron_${searchTerm.trim().replace(/\s+/g, "_")}.csv` : "Padron_Completo.csv";
    link.setAttribute("download", fileName);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (file?: File) => {
    if (!file) return;
    if (file.type !== "text/csv" && !file.name.toLowerCase().endsWith(".csv")) {
      void showDashboardAlert({ icon: "warning", title: "Archivo inválido", text: "Por favor sube un archivo CSV." });
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const rows = parseStudentCsv(String(e.target?.result ?? ""));
        setCsvData(rows);
      } catch (error) {
        setCsvData([]);
        void showDashboardAlert({ icon: "warning", title: "Revisa el archivo CSV", text: error instanceof Error ? error.message : "No pudimos leer el archivo." });
      }
    };
    reader.onerror = () => void showDashboardAlert({ icon: "error", title: "No se pudo leer el archivo", text: "Intenta seleccionar el CSV nuevamente." });
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
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw userError ?? new Error("Inicia sesión para importar alumnos.");
      // Al importar CSV antiguos o sin columna Folio, conservar el folio que ya
      // tuviera el alumno en vez de borrarlo con un upsert parcial.
      const matriculas = csvData.map((alumno) => alumno.matricula.trim().toUpperCase());
      const { data: existingRows, error: existingError } = await supabase
        .from("padron_alumnos")
        .select("matricula,folio,folio_usado")
        .eq("admin_id", user.id)
        .in("matricula", matriculas);
      if (existingError) throw existingError;
      const existingByMatricula = new Map((existingRows ?? []).map((row) => [String(row.matricula).toUpperCase(), row]));
      const normalizedRows = csvData.map((alumno) => {
        const matricula = alumno.matricula.trim().toUpperCase();
        const existing = existingByMatricula.get(matricula);
        return {
          ...alumno,
          folio: alumno.folio ? alumno.folio.replace(/\s+/g, "").toUpperCase() : existing?.folio ?? null,
          folio_usado: existing?.folio_usado ?? false,
          admin_id: user.id,
          matricula,
        };
      });
      const { error } = await supabase.from('padron_alumnos').upsert(normalizedRows, { onConflict: 'admin_id,matricula' });
      if (error) throw error;
      
      void showDashboardAlert({ icon: "success", title: "Padrón actualizado", text: `Se cargaron ${csvData.length} registros exitosamente.` });
      setCsvData([]);
      setIsCsvModalOpen(false);
      fetchAlumnos(); 
    } catch (err: any) {
      console.error("No se pudo importar el padrón:", err);
      const message = err?.code === "23505"
        ? "Una matrícula ya está registrada en otro padrón o un folio ya fue asignado. Cada matrícula solo puede aparecer una vez."
        : err?.code === "21000"
          ? "El archivo contiene matrículas repetidas. Corrige los duplicados y vuelve a importarlo."
        : err?.code === "22007" || err?.code === "22008"
          ? "Verifica que las fechas de nacimiento sean válidas y estén en formato DD/MM/AAAA."
          : err?.code === "42501"
            ? "No tienes permiso para agregar estos alumnos a tu padrón. Vuelve a iniciar sesión."
            : "No se pudo importar el padrón. Revisa los datos del archivo e inténtalo de nuevo.";
      void showDashboardAlert({ icon: "error", title: "Error al subir padrón", text: message });
    } finally {
      setIsUploading(false);
    }
  };

  const openCreator = () => {
    setEditingAlumno(null);
    setSelectedBirthDate("");
    setIsFormModalOpen(true);
  };

  const openEditor = (alumno: Alumno) => {
    setEditingAlumno(alumno);
    setSelectedBirthDate(alumno.fecha_nacimiento);
    setIsFormModalOpen(true);
  };

  const saveFolio = async (alumno: Alumno) => {
    const folio = folioDraft.replace(/\s+/g, "").trim().toUpperCase();
    if (!alumno.id || !folio) {
      void showDashboardAlert({ icon: "warning", title: "Ingresa el folio", text: "Escribe el folio físico que se entregó al alumno." });
      return;
    }
    if (!/^[A-Z0-9-]{1,64}$/.test(folio)) {
      void showDashboardAlert({ icon: "warning", title: "Folio inválido", text: "Usa solo letras, números o guiones (máximo 64 caracteres)." });
      return;
    }

    setIsSavingFolio(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw userError ?? new Error("Inicia sesión para asignar folios.");
      const { error } = await supabase.from("padron_alumnos")
        .update({ folio })
        .eq("id", alumno.id)
        .eq("admin_id", user.id);
      if (error) throw error;

      const nextAlumnos = alumnos.map((row) => row.id === alumno.id ? { ...row, folio, folio_usado: false } : row);
      setAlumnos(nextAlumnos);
      padronesEnMemoria.set(user.id, nextAlumnos);
      setAssigningFolioId(null);
      setFolioDraft("");
      void showDashboardAlert({ icon: "success", title: "Folio asignado", showConfirmButton: false, timer: 1300 });
    } catch (error: any) {
      const message = error?.code === "23505"
        ? "Ese folio ya está asignado a otro alumno o ya fue utilizado."
        : error?.code === "42501"
          ? "No tienes permiso para asignar folios en este padrón. Vuelve a iniciar sesión."
          : "No se pudo asignar el folio. Revisa los datos e inténtalo de nuevo.";
      void showDashboardAlert({ icon: "error", title: "Error al asignar folio", text: message });
    } finally {
      setIsSavingFolio(false);
    }
  };

  const saveAlumno = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const payload = {
      matricula: String(formData.get("matricula") ?? "").trim().toUpperCase(),
      nombre: formData.get("nombre") as string,
      apellido_paterno: formData.get("apellido_paterno") as string,
      apellido_materno: formData.get("apellido_materno") as string,
      carrera: formData.get("carrera") as string,
      grado: formData.get("grado") as string,
      grupo: formData.get("grupo") as string,
      fecha_nacimiento: formData.get("fecha_nacimiento") as string,
      folio: editingAlumno?.folio_usado
        ? editingAlumno.folio
        : String(formData.get("folio") ?? "").replace(/\s+/g, "").trim().toUpperCase() || null,
    };

    if (payload.folio && !/^[A-Z0-9-]{1,64}$/.test(payload.folio)) {
      void showDashboardAlert({ icon: "warning", title: "Folio inválido", text: "Usa solo letras, números o guiones (máximo 64 caracteres)." });
      return;
    }

    if (!payload.carrera || !payload.grado || !payload.grupo || !payload.fecha_nacimiento) {
      void showDashboardAlert({ icon: "warning", title: "Completa los campos pendientes" });
      return;
    }

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw userError ?? new Error("Inicia sesión para guardar alumnos.");
      let error;
      if (editingAlumno?.id) {
        const res = await supabase.from('padron_alumnos').update(payload).eq('id', editingAlumno.id);
        error = res.error;
      } else {
        const res = await supabase.from('padron_alumnos').insert({ ...payload, admin_id: user.id });
        error = res.error;
      }

      if (error) throw error;

      void showDashboardAlert({ 
        icon: "success", 
        title: editingAlumno ? "Alumno actualizado" : "Alumno creado", 
        showConfirmButton: false, 
        timer: 1500 
      });
      setIsFormModalOpen(false);
      fetchAlumnos();
    } catch (err: any) {
      const detail = String(err?.message ?? "").toLowerCase();
      const text = err?.code === "23505" && detail.includes("folio")
        ? "Ese folio ya está asignado a otro alumno. Cada folio solo se puede usar una vez."
        : err?.code === "23505" && detail.includes("matricula")
          ? "Esta matrícula ya está registrada en otro padrón. Cada alumno debe tener una sola ficha."
          : err?.code === "23505"
            ? "Ya existe un alumno con esa matrícula en alguno de los padrones. Cada matrícula solo puede aparecer una vez."
            : "No se pudieron guardar los datos. Revisa la información e inténtalo de nuevo.";
      void showDashboardAlert({ icon: "error", title: "Error al guardar", text });
    }
  };

  const deleteAlumno = async (id: string, nombre: string) => {
    const result = await showDashboardAlert({
      icon: "warning",
      title: "Confirmar eliminación",
      text: `Escribe ELIMINAR para borrar permanentemente a ${nombre}.`,
      input: "text",
      inputValidator: (value) => value === "ELIMINAR" ? undefined : "Escribe ELIMINAR exactamente, en mayúsculas, para continuar.",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar"
    });

    if (result.isConfirmed && result.value === "ELIMINAR") {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        void showDashboardAlert({ icon: "error", title: "No se pudo eliminar", text: "Inicia sesión de nuevo para continuar." });
        return;
      }
      const { data: deletedRow, error } = await supabase.from('padron_alumnos')
        .delete()
        .eq('id', id)
        .eq('admin_id', user.id)
        .select('id')
        .maybeSingle();
      if (error) {
        void showDashboardAlert({ icon: "error", title: "Error al eliminar", text: "No se pudo retirar al alumno ni su acceso. Inténtalo de nuevo." });
      } else if (!deletedRow) {
        void showDashboardAlert({ icon: "warning", title: "No se encontró el registro", text: "No se eliminó ningún alumno. Actualiza el padrón e inténtalo de nuevo." });
      } else {
        padronesEnMemoria.set(user.id, (padronesEnMemoria.get(user.id) ?? []).filter((alumno) => alumno.id !== id));
        void showDashboardAlert({ icon: "success", title: "Alumno eliminado", text: "Se retiró su acceso a la cuenta y sus inscripciones liberaron los lugares.", showConfirmButton: false, timer: 1800 });
        fetchAlumnos();
      }
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
          <Link to="/dashboard/proyectos"><FolderKanban size={18}/>Proyectos</Link>
          <Link className="is-active" to="/dashboard/padron"><Users size={18}/>Padrón de Alumnos</Link>
          {isPrimaryAdmin === true && <Link to="/dashboard/administradores"><ShieldCheck size={18}/>Administradores</Link>}
          <Link to="/dashboard/eventos?crear=1"><Plus size={18}/>Crear evento</Link>
        </nav>
        <div className="dashboard-sidebar__bottom">
          <div className="dashboard-profile"><span className="dashboard-avatar">{fullName?.charAt(0) ?? " "}</span><div><strong>{fullName ?? " "}</strong><small>Panel principal</small></div></div>
          <Link to="/" className="dashboard-signout"><LogOut size={17}/>Salir al sitio</Link>
        </div>
      </aside>

      <section className="dashboard-content">
        <header className="dashboard-topbar">
          <button className="dashboard-menu-button" onClick={() => setSidebarOpen(true)}><Menu size={21}/></button>
          <div className="dashboard-breadcrumb"><Link to="/dashboard">Panel</Link><span>/</span><strong>Padrón</strong></div>
          <div className="dashboard-topbar__actions"><AnimatedThemeToggler className="dashboard-theme-toggle" /><span className="dashboard-avatar dashboard-avatar--small" aria-label={fullName ? `Sesión de ${fullName}` : "Sesión administrativa"} title={fullName ?? undefined}>{fullName?.charAt(0) ?? " "}</span></div>
        </header>
        
        <div className="dashboard-body">
          <div className="dashboard-welcome">
            <div>
              <p className="dashboard-eyebrow"><Users size={14}/> GESTIÓN DE USUARIOS</p>
              <h1>Padrón de Alumnos<span>.</span></h1>
              <p>Administra el padrón de tus alumnos tutorados. Solo tú puedes consultar y gestionar estos registros.</p>
            </div>
            <div className="padron-header-actions">
              <button className="dashboard-secondary-button" onClick={() => setIsCsvModalOpen(true)}>
                <Upload size={18}/> Importar CSV
              </button>
              <button className="dashboard-primary-button" onClick={openCreator}>
                <Plus size={18}/> Nuevo alumno
              </button>
            </div>
          </div>

          <section className="dashboard-events dashboard-events--standalone">
            {loadError && <div className="dashboard-data-error" role="alert"><div><strong>No se pudo actualizar el padrón</strong><p>{loadError}</p><small>Se conservan los datos que ya estaban cargados.</small></div><button type="button" onClick={() => void fetchAlumnos()} disabled={isLoading}>{isLoading ? "Reintentando…" : "Reintentar"}</button></div>}
            <div className="dashboard-section-heading padron-section-heading">
              <div>
                <p>LISTADO GENERAL</p>
                <h2>{loadError && alumnos.length === 0 ? "No se pudo verificar el padrón" : <>{filteredAlumnos.length} {filteredAlumnos.length === 1 ? "alumno" : "alumnos"} {searchTerm ? "filtrados" : "registrados"}</>}</h2>
              </div>
              
              <div className="padron-toolbar">
                {/* Buscador */}
                <div className="padron-search">
                  <Search size={18} />
                  <input 
                    type="text"
                    placeholder="Buscar alumno, matrícula, carrera..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="padron-search__input"
                  />
                </div>
                
                {/* Botón de Exportar */}
                <button 
                  onClick={exportToCSV}
                  disabled={filteredAlumnos.length === 0}
                  className="padron-csv-button"
                >
                  <Download size={18} />
                  Exportar CSV
                </button>
              </div>
            </div>

            <div className="dashboard-event-list" aria-busy={isLoading}>
              {isLoading ? (
                <div className="padron-table-placeholder" aria-label="Cargando padrón">{Array.from({ length: 6 }, (_, index) => <i className="placeholder-glow" key={index} />)}</div>
              ) : loadError && alumnos.length === 0 ? null : alumnos.length === 0 ? (
                <div style={{ padding: "3rem", textAlign: "center", border: "1px dashed var(--line)", borderRadius: "1rem", marginTop: "1rem" }}>
                  <Users size={32} style={{ margin: "0 auto 1rem", opacity: 0.5 }} />
                  <h3 style={{ margin: "0 0 0.5rem", color: "var(--text)" }}>Aún no tienes alumnos registrados</h3>
                  <p style={{ margin: 0, color: "var(--text-muted)" }}>Cuando agregues alumnos o importes tu padrón, aparecerán aquí.</p>
                  <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginTop: "1rem" }}>
                    <button onClick={() => setIsCsvModalOpen(true)} style={{ color: "var(--orange)", textDecoration: "underline", background: "none", border: "none", cursor: "pointer", padding: 0 }}>Importar CSV</button>
                    <button onClick={openCreator} style={{ color: "var(--dash-green)", textDecoration: "underline", background: "none", border: "none", cursor: "pointer", padding: 0 }}>Agregar alumno</button>
                  </div>
                </div>
              ) : filteredAlumnos.length === 0 ? (
                <p style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>No se encontraron alumnos con esa búsqueda.</p>
              ) : (
                <div className="padron-table-wrap">
                  <table className="padron-table">
                    <thead>
                      <tr>
                        <th>Matrícula</th><th>Nombre completo</th><th>Carrera</th><th>Grado y grupo</th><th>Folio</th><th>Estado</th><th className="padron-table__actions">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentAlumnos.map((alumno) => (
                        <tr key={alumno.id}>
                          <td><strong>{alumno.matricula}</strong></td><td>{alumno.nombre} {alumno.apellido_paterno} {alumno.apellido_materno}</td><td className="padron-table__muted">{alumno.carrera}</td><td>{alumno.grado}° "{alumno.grupo}"</td><td className="padron-folio-cell">{assigningFolioId === alumno.id ? <div className="padron-folio-editor"><input aria-label={`Folio para ${alumno.nombre} ${alumno.apellido_paterno}`} value={folioDraft} onChange={(event) => setFolioDraft(event.target.value.replace(/\s+/g, "").toUpperCase())} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); void saveFolio(alumno); } if (event.key === "Escape") { setAssigningFolioId(null); setFolioDraft(""); } }} maxLength={64} autoFocus disabled={isSavingFolio}/><button type="button" className="padron-folio-save" onClick={() => void saveFolio(alumno)} aria-label="Guardar folio" title="Guardar folio" disabled={isSavingFolio}><Check size={15}/></button><button type="button" className="padron-folio-cancel" onClick={() => { setAssigningFolioId(null); setFolioDraft(""); }} aria-label="Cancelar" title="Cancelar" disabled={isSavingFolio}><X size={15}/></button></div> : alumno.folio ? <span title={alumno.folio}>{alumno.folio}{alumno.folio_usado && <small style={{ display: "block", color: "var(--text-muted)" }}>Utilizado</small>}{!alumno.folio_usado && !alumno.registrado && <button type="button" className="padron-folio-change" onClick={() => { setAssigningFolioId(alumno.id ?? null); setFolioDraft(alumno.folio ?? ""); }}>Cambiar</button>}</span> : alumno.registrado ? <span className="padron-table__muted">Cuenta validada</span> : <button type="button" className="padron-folio-assign" onClick={() => { setAssigningFolioId(alumno.id ?? null); setFolioDraft(""); }}><Plus size={13}/>Asignar</button>}</td><td>
                            {alumno.registrado ? (
                              <span className="padron-status-badge is-validated">Validado</span>
                            ) : (
                              <span className="padron-status-badge is-pending">Pendiente</span>
                            )}
                          </td>
                          <td style={{ padding: "1rem", textAlign: "right", display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                            <button className="padron-action-button" onClick={() => openEditor(alumno)} aria-label="Editar">
                              <Pencil size={15} />
                            </button>
                            <button className="padron-action-button is-danger" onClick={() => alumno.id && deleteAlumno(alumno.id, alumno.nombre)} aria-label="Eliminar">
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                    {totalPages > 1 && (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", borderTop: "1px solid var(--line)", background: "color-mix(in srgb, var(--bg) 50%, transparent)" }}>
                      <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                        Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredAlumnos.length)} de {filteredAlumnos.length}
                      </span>
                      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        <button 
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          style={{ padding: "0.4rem 0.8rem", borderRadius: "0.3rem", border: "1px solid var(--line)", background: currentPage === 1 ? "transparent" : "var(--card)", color: currentPage === 1 ? "var(--text-muted)" : "var(--text)", cursor: currentPage === 1 ? "not-allowed" : "pointer" }}
                        >
                          Anterior
                        </button>
                        <span style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem", fontWeight: 600, color: "var(--text)" }}>
                          Página {currentPage} de {totalPages}
                        </span>
                        <button 
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                          style={{ padding: "0.4rem 0.8rem", borderRadius: "0.3rem", border: "1px solid var(--line)", background: currentPage === totalPages ? "transparent" : "var(--card)", color: currentPage === totalPages ? "var(--text-muted)" : "var(--text)", cursor: currentPage === totalPages ? "not-allowed" : "pointer" }}
                        >
                          Siguiente
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>
      </section>

      {isFormModalOpen && (
        <div className="dashboard-modal-backdrop" onMouseDown={() => setIsFormModalOpen(false)}>
          <section className="dashboard-modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="dashboard-modal__header">
              <div>
                <p className="dashboard-eyebrow">{editingAlumno ? "EDITAR ALUMNO" : "NUEVO ALUMNO"}</p>
                <h2>{editingAlumno ? "Actualiza los datos" : "Ingresa los datos manualmente"}</h2>
              </div>
              <button onClick={() => setIsFormModalOpen(false)}><X size={20} /></button>
            </div>
            
            <form onSubmit={saveAlumno} className="dashboard-event-form padron-student-form">
              <label>Matrícula
                <input name="matricula" defaultValue={editingAlumno?.matricula} autoCapitalize="characters" onInput={(event) => { event.currentTarget.value = event.currentTarget.value.toUpperCase(); }} required />
              </label>

              <label>Folio entregado al alumno
                <input name="folio" defaultValue={editingAlumno?.folio ?? ""} autoCapitalize="characters" autoComplete="off" maxLength={64} pattern={"[A-Za-z0-9\\x2D]+"} title="Usa solo letras, números o guiones." onInput={(event) => { event.currentTarget.value = event.currentTarget.value.replace(/\s+/g, "").toUpperCase(); }} required={!editingAlumno} disabled={editingAlumno?.folio_usado === true || (editingAlumno?.registrado === true && !editingAlumno.folio)} />
                <small>{editingAlumno?.folio_usado ? "Este folio ya se utilizó para validar la cuenta y no se puede reasignar." : editingAlumno?.registrado ? "La cuenta ya está validada; no necesita un folio." : "Cada folio es único y permite validar una sola cuenta."}</small>
              </label>
              
              <div className="dashboard-form-grid">
                <label>Nombre(s) <input name="nombre" defaultValue={editingAlumno?.nombre} required /></label>
                <label>Fecha Nac.
                  <input type="hidden" name="fecha_nacimiento" value={selectedBirthDate} required />
                  <BirthDatePicker value={selectedBirthDate} onChange={setSelectedBirthDate} />
                </label>
              </div>

              <div className="dashboard-form-grid">
                <label>A. Paterno <input name="apellido_paterno" defaultValue={editingAlumno?.apellido_paterno} required /></label>
                <label>A. Materno <input name="apellido_materno" defaultValue={editingAlumno?.apellido_materno} /></label>
              </div>

              <label>Carrera
                <DashboardSelect name="carrera" defaultValue={editingAlumno?.carrera || ""} placeholder="Selecciona una carrera" options={[
                  { value: "TSU en Desarrollo de Software", label: "TSU en Desarrollo de Software" },
                  { value: "TSU en Redes y Ciberseguridad", label: "TSU en Redes y Ciberseguridad" },
                  { value: "TSU en Entornos Virtuales", label: "TSU en Entornos Virtuales" },
                  { value: "Ingeniería en TI e Innovación Digital", label: "Ingeniería en TI e Innovación Digital" },
                ]} />
              </label>

              <div className="dashboard-form-grid">
                <label>Grado
                  <DashboardSelect name="grado" defaultValue={editingAlumno?.grado || ""} placeholder="Selecciona..." options={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => ({ value: String(num), label: `${num}°` }))} />
                </label>
                <label>Grupo
                  <DashboardSelect name="grupo" defaultValue={editingAlumno?.grupo || ""} placeholder="Selecciona..." options={"ABCD".split("").map((letter) => ({ value: letter, label: letter }))} />
                </label>
              </div>

              <div className="dashboard-modal__footer">
                <button type="button" onClick={() => setIsFormModalOpen(false)}>Cancelar</button>
                <button className="dashboard-primary-button" type="submit">
                  {editingAlumno ? "Guardar cambios" : "Crear alumno"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {isCsvModalOpen && (
        <div className="dashboard-modal-backdrop" onMouseDown={() => setIsCsvModalOpen(false)}>
          <section className="dashboard-modal" style={{ maxWidth: "700px" }} onMouseDown={(e) => e.stopPropagation()}>
            <div className="dashboard-modal__header">
              <div>
                <p className="dashboard-eyebrow">CARGA MASIVA</p>
                <h2>Importar archivo CSV</h2>
              </div>
              <button onClick={() => { setIsCsvModalOpen(false); setCsvData([]); }}><X size={20} /></button>
            </div>
            
            <div style={{ padding: "1.5rem" }}>
              {csvData.length === 0 ? (
                <div 
                  className={`dashboard-image-upload ${isDragging ? "is-dragging" : ""}`}
                  style={{ padding: "4rem 2rem", margin: 0 }}
                  onClick={() => fileInputRef.current?.click()} 
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} 
                  onDragLeave={() => setIsDragging(false)} 
                  onDrop={handleDrop} 
                >
                  <input ref={fileInputRef} type="file" accept=".csv" className="sr-only" onChange={(e) => handleFileUpload(e.target.files?.[0])} />
                  <div className="dashboard-image-upload__empty">
                    <Upload size={32} />
                    <strong>Sube el archivo CSV del padrón</strong>
                    <span>Haz clic o arrastra el archivo aquí</span>
                    <small>Formato: Matricula, Nombre, Paterno, Materno, Carrera, Grado, Grupo, FechaNacimiento; Folio es opcional.</small>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                    <FileText size={24} color="var(--green)" />
                    <div>
                      <h3 style={{ margin: 0, fontSize: "1.1rem" }}>Archivo cargado</h3>
                      <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)" }}>{csvData.length} alumnos detectados listos para importar.</p>
                    </div>
                  </div>
                  <div className="padron-csv-preview" style={{ overflowX: "auto", border: "1px solid var(--line)", borderRadius: "0.5rem", maxHeight: "250px" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
                      <thead style={{ position: "sticky", top: 0, background: "var(--bg)", borderBottom: "1px solid var(--line)" }}>
                        <tr>
                          <th style={{ padding: "0.5rem 1rem" }}>Matrícula</th>
                          <th style={{ padding: "0.5rem 1rem" }}>Nombre</th>
                          <th style={{ padding: "0.5rem 1rem" }}>Grado y Grupo</th>
                          <th style={{ padding: "0.5rem 1rem" }}>Folio</th>
                        </tr>
                      </thead>
                      <tbody>
                        {csvData.slice(0, 5).map((row, idx) => (
                          <tr key={idx} style={{ borderBottom: "1px solid var(--line)" }}>
                            <td style={{ padding: "0.5rem 1rem" }}><strong>{row.matricula}</strong></td>
                            <td style={{ padding: "0.5rem 1rem" }}>{row.nombre} {row.apellido_paterno}</td>
                            <td style={{ padding: "0.5rem 1rem" }}>{row.grado}° "{row.grupo}"</td>
                            <td style={{ padding: "0.5rem 1rem" }}>{row.folio || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="dashboard-modal__footer">
              <button type="button" onClick={() => { setIsCsvModalOpen(false); setCsvData([]); }}>Cancelar</button>
              {csvData.length > 0 && (
                <button className="dashboard-primary-button" onClick={uploadToSupabase} disabled={isUploading}>
                  {isUploading ? "Importando..." : "Confirmar Importación"}
                </button>
              )}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
