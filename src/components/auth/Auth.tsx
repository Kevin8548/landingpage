import { useEffect, useLayoutEffect, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, CalendarDays, ChevronDown, ChevronLeft, ChevronRight, Eye, EyeOff, GraduationCap, KeyRound, LockKeyhole, UserRound } from "lucide-react";
import { setAdminAuthenticated } from "../../lib/adminAuth";
import { studentSupabase, supabase } from "../../lib/supabase";
import "./Auth.css";

type Audience = "student" | "admin";
type Mode = "login" | "activate" | "change-password";

async function functionErrorMessage(error: { message?: string; context?: unknown }, fallback: string) {
  if (error.context instanceof Response) {
    try {
      const body = await error.context.clone().json();
      if (typeof body?.error === "string") return body.error;
    } catch { /* Se usará el mensaje de red del cliente. */ }
  }
  const contextMessage = error.context instanceof Error ? error.context.message : "";
  const detail = `${error.message ?? ""} ${contextMessage}`;
  if (/fetch|network|load failed|name_not_resolved|connection|timed out|timeout/i.test(detail)) {
    return "No se pudo conectar con el servicio de acceso. Revisa tu conexión e inténtalo de nuevo.";
  }
  return error.message || fallback;
}

const authDateFromValue = (value: string) => value ? new Date(`${value}T12:00:00`) : new Date();
const authDateToValue = (value: Date) => `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;

function ActivationBirthDatePicker({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const [openSelector, setOpenSelector] = useState<"month" | "year" | null>(null);
  const [viewDate, setViewDate] = useState(() => authDateFromValue(value));
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const yearListRef = useRef<HTMLDivElement>(null);
  const currentYear = new Date().getFullYear();
  const months = Array.from({ length: 12 }, (_, month) => new Intl.DateTimeFormat("es-MX", { month: "long" }).format(new Date(2020, month, 1)));
  const years = Array.from({ length: currentYear - 1899 }, (_, index) => currentYear - index);
  const firstDay = (new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay() + 6) % 7;
  const totalDays = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();

  useLayoutEffect(() => {
    if (!open) return;
    const placeMenu = () => {
      const trigger = triggerRef.current;
      const menu = menuRef.current;
      if (!trigger || !menu) return;
      const rect = trigger.getBoundingClientRect();
      const width = Math.min(320, window.innerWidth - 24);
      const left = Math.max(12, Math.min(rect.left, window.innerWidth - width - 12));
      let top = rect.bottom + 8;
      if (top + menu.offsetHeight > window.innerHeight - 12) top = Math.max(12, rect.top - menu.offsetHeight - 8);
      setPosition({ top, left });
    };
    placeMenu();
    const frame = window.requestAnimationFrame(placeMenu);
    window.addEventListener("resize", placeMenu);
    window.addEventListener("scroll", placeMenu, true);
    return () => { window.cancelAnimationFrame(frame); window.removeEventListener("resize", placeMenu); window.removeEventListener("scroll", placeMenu, true); };
  }, [open, viewDate, openSelector]);

  useLayoutEffect(() => {
    if (openSelector !== "year" || !yearListRef.current) return;
    const selected = yearListRef.current.querySelector<HTMLElement>("[aria-selected='true']");
    if (selected) yearListRef.current.scrollTop = selected.offsetTop - yearListRef.current.offsetTop - yearListRef.current.clientHeight / 2 + selected.clientHeight / 2;
  }, [openSelector]);

  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: PointerEvent) => { if (!triggerRef.current?.contains(event.target as Node) && !menuRef.current?.contains(event.target as Node)) setOpen(false); };
    const closeEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeEscape);
    return () => { document.removeEventListener("pointerdown", closeOutside); document.removeEventListener("keydown", closeEscape); };
  }, [open]);

  return <div className="auth-date-picker">
    <button ref={triggerRef} type="button" className="auth-date-picker__trigger" aria-haspopup="dialog" aria-expanded={open} onClick={() => { setViewDate(authDateFromValue(value)); setOpenSelector(null); setOpen((current) => !current); }}><CalendarDays size={17}/><span>{value ? value.split("-").reverse().join("/") : "Selecciona una fecha"}</span><ChevronDown size={16}/></button>
    {open && createPortal(<div ref={menuRef} className="auth-date-picker__menu" style={{ top: position.top, left: position.left }} role="dialog" aria-label="Seleccionar fecha de nacimiento"><header className="auth-date-picker__header"><button type="button" onClick={() => { setOpenSelector(null); setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1)); }} aria-label="Mes anterior"><ChevronLeft size={17}/></button><div className="auth-date-picker__selectors"><div className="auth-date-picker__selector"><button type="button" aria-label={`Mes: ${months[viewDate.getMonth()]}`} aria-expanded={openSelector === "month"} onClick={() => setOpenSelector((current) => current === "month" ? null : "month")}>{months[viewDate.getMonth()]}<ChevronDown size={14}/></button>{openSelector === "month" && <div className="auth-date-picker__options auth-date-picker__options--months" role="listbox" aria-label="Meses">{months.map((month, index) => <button type="button" role="option" aria-selected={index === viewDate.getMonth()} className={index === viewDate.getMonth() ? "is-selected" : ""} key={month} onClick={() => { setViewDate(new Date(viewDate.getFullYear(), index, 1)); setOpenSelector(null); }}>{month}</button>)}</div>}</div><div className="auth-date-picker__selector"><button type="button" aria-label={`Año: ${viewDate.getFullYear()}`} aria-expanded={openSelector === "year"} onClick={() => setOpenSelector((current) => current === "year" ? null : "year")}>{viewDate.getFullYear()}<ChevronDown size={14}/></button>{openSelector === "year" && <div ref={yearListRef} className="auth-date-picker__options auth-date-picker__options--years" role="listbox" aria-label="Años">{years.map((year) => <button type="button" role="option" aria-selected={year === viewDate.getFullYear()} className={year === viewDate.getFullYear() ? "is-selected" : ""} key={year} onClick={() => { setViewDate(new Date(year, viewDate.getMonth(), 1)); setOpenSelector(null); }}>{year}</button>)}</div>}</div></div><button type="button" onClick={() => { setOpenSelector(null); setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1)); }} aria-label="Mes siguiente"><ChevronRight size={17}/></button></header><div className="auth-date-picker__weekdays">{["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"].map((day) => <span key={day}>{day}</span>)}</div><div className="auth-date-picker__days">{Array.from({ length: firstDay + totalDays }, (_, index) => { if (index < firstDay) return <i key={`empty-${index}`}/>; const day = index - firstDay + 1; const nextDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day, 12); const nextValue = authDateToValue(nextDate); return <button type="button" key={nextValue} className={nextValue === value ? "is-selected" : ""} aria-pressed={nextValue === value} onClick={() => { onChange(nextValue); setOpen(false); }}>{day}</button>; })}</div></div>, document.body)}
  </div>;
}

export default function Auth() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const initialAudience = params.get("tipo");
  const [audience, setAudience] = useState<Audience | null>(initialAudience === "alumno" ? "student" : initialAudience === "admin" ? "admin" : null);
  const [mode, setMode] = useState<Mode>(params.get("activar") === "1" ? "activate" : "login");
  const [matricula, setMatricula] = useState("");
  const [email, setEmail] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const chooseAudience = (next: Audience) => { setAudience(next); setMode("login"); setMessage(null); };
  const returnTo = (() => { const next = params.get("returnTo"); return next?.startsWith("/") && !next.startsWith("//") ? next : "/"; })();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setMessage(null); setLoading(true);
    const cleanMatricula = matricula.trim().toUpperCase();
    try {
      if (audience === "admin" && mode === "change-password") {
        if (password.length < 12) throw new Error("La nueva contraseña debe tener al menos 12 caracteres.");
        if (password !== confirmPassword) throw new Error("Las contraseñas no coinciden.");
        const { error } = await supabase.auth.updateUser({ password, data: { must_change_password: false } });
        if (error) throw error;
        setAdminAuthenticated(true);
        navigate("/dashboard", { replace: true });
        return;
      }
      if (audience === "student" && mode === "activate") {
        if (!fechaNacimiento) throw new Error("Selecciona tu fecha de nacimiento.");
        if (password.length < 8) throw new Error("La contraseña debe tener al menos 8 caracteres.");
        if (password !== confirmPassword) throw new Error("Las contraseñas no coinciden.");
        const { data: token, error: claimError } = await studentSupabase.rpc("prepare_student_activation", { p_matricula: cleanMatricula, p_fecha_nacimiento: fechaNacimiento });
        if (claimError) {
          console.error("Error validando matrícula para activación:", claimError);
          throw new Error("No pudimos consultar el padrón ahora. Inténtalo más tarde o pide a tu tutor que revise el registro.");
        }
        if (!token) throw new Error("No encontramos esa matrícula pendiente con la fecha indicada. Revisa los datos o consulta a tu tutor.");
        const { data, error } = await studentSupabase.functions.invoke("activate-student", { body: { matricula: cleanMatricula, token, password } });
        if (error) throw new Error(await functionErrorMessage(error, "No se pudo activar tu cuenta. Inténtalo de nuevo."));
        if (data?.error) throw new Error(data.error);
        if (!data?.session) throw new Error("No se recibió una sesión después de activar tu cuenta. Intenta iniciar sesión con tu matrícula y contraseña.");
        const { error: sessionError } = await studentSupabase.auth.setSession(data.session);
        if (sessionError) throw sessionError;
        navigate(returnTo === "/" ? "/alumno/actividades" : returnTo, { replace: true });
        return;
      }

      if (audience === "student") {
        const { data, error } = await studentSupabase.functions.invoke("student-login", { body: { matricula: cleanMatricula, password } });
        if (error) throw new Error(await functionErrorMessage(error, "No se pudo iniciar sesión."));
        if (data?.error) throw new Error(data.error);
        if (!data?.session) throw new Error("Matrícula o contraseña incorrectas.");
        const { error: sessionError } = await studentSupabase.auth.setSession(data.session);
        if (sessionError) throw sessionError;
        navigate(returnTo === "/" ? "/alumno/actividades" : returnTo, { replace: true });
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
      if (error) {
        const detail = error.message.toLowerCase();
        if (detail.includes("invalid login credentials") || detail.includes("invalid_credentials")) {
          throw new Error("Correo o contraseña incorrectos.");
        }
        if (error.name === "AuthRetryableFetchError" || /failed to fetch|network|load failed/i.test(detail)) {
          throw new Error("No se pudo conectar con el servicio de acceso. Revisa tu conexión e inténtalo de nuevo.");
        }
        throw new Error(error.message);
      }
      if (!data.user) throw new Error("El servicio de acceso no devolvió una sesión válida. Inténtalo de nuevo.");
      const { data: profile, error: profileError } = await supabase.from("profiles").select("role").eq("id", data.user.id).maybeSingle();
      if (profileError || profile?.role !== "admin") {
        await supabase.auth.signOut();
        throw new Error("Esta cuenta no tiene acceso administrativo. Solicita el alta al responsable de la plataforma.");
      }
      if (data.user.user_metadata?.must_change_password === true) {
        setPassword(""); setConfirmPassword(""); setMode("change-password");
        setMessage("Por seguridad, reemplaza la contraseña temporal antes de continuar.");
        return;
      }
      setAdminAuthenticated(true);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Ocurrió un error inesperado.");
    } finally { setLoading(false); }
  };

  const isActivation = audience === "student" && mode === "activate";
  const isPasswordChange = audience === "admin" && mode === "change-password";
  return <main className="auth-page">
    <div className="auth-orb auth-orb--one" /><div className="auth-orb auth-orb--two" />
    <section className="auth-card">
      <aside className="auth-showcase"><a className="auth-back" href={import.meta.env.BASE_URL} aria-label="Volver al sitio"><ArrowLeft size={16}/>Volver al sitio</a><div className="auth-brand"><span className="auth-brand__mark">UTT</span><span>UNIVERSIDAD TECNOLÓGICA DE TLAXCALA</span></div><div className="auth-showcase__content"><h1>Tu futuro comienza<br/><em>aquí.</em></h1><p>Accede a información, recursos y experiencias pensadas para tu trayectoria universitaria.</p><div className="auth-showcase__line"><span/></div></div></aside>
      <section className="auth-form-panel">
        {!audience ? <>
          <div className="auth-form-heading auth-choice-heading"><span className="auth-form-heading__eyebrow">PLATAFORMA UTT</span><h2>Elige tu tipo de acceso</h2><p>Selecciona el espacio que corresponde a tu cuenta.</p></div>
          <div className="auth-role-options">
            <button type="button" className="auth-role-option" onClick={() => chooseAudience("student")}><span className="auth-role-option__icon"><GraduationCap size={21}/></span><span className="auth-role-option__copy"><strong>Soy alumno</strong><small>Ingresa con matrícula y contraseña para consultar tus actividades.</small></span><ArrowRight size={17}/></button>
            <button type="button" className="auth-role-option" onClick={() => chooseAudience("admin")}><span className="auth-role-option__icon"><KeyRound size={20}/></span><span className="auth-role-option__copy"><strong>Personal administrativo</strong><small>Acceso para cuentas habilitadas por el responsable de la plataforma.</small></span><ArrowRight size={17}/></button>
          </div>
        </> : <>
          <button type="button" className="auth-change-role" onClick={() => { setAudience(null); setMessage(null); }}><ArrowLeft size={15}/> Cambiar tipo de acceso</button>
          <div className="auth-form-heading"><span className="auth-form-heading__eyebrow">{isActivation ? "ACTIVA TU CUENTA UTT" : isPasswordChange ? "PRIMER ACCESO ADMINISTRATIVO" : audience === "student" ? "ACCESO DE ALUMNOS" : "ACCESO ADMINISTRATIVO"}</span><h2>{isActivation ? "Activa tu cuenta" : isPasswordChange ? "Cambia tu contraseña" : audience === "student" ? "Hola, alumno" : "Bienvenido"}</h2><p>{isActivation ? "Valida los datos del padrón y crea tu contraseña." : isPasswordChange ? "La contraseña temporal solo sirve para este primer ingreso." : audience === "student" ? "Ingresa con tu matrícula y contraseña." : "Ingresa con el correo de tu cuenta autorizada."}</p></div>
          <form className="auth-form" onSubmit={handleSubmit}>
            {!isPasswordChange && (audience === "student" ? <label className="auth-field auth-field--full"><span>Matrícula</span><div className="auth-input-icon"><UserRound size={18}/><input className="auth-matricula-input" value={matricula} onChange={(e) => setMatricula(e.target.value.toUpperCase())} placeholder="Escribe tu matrícula" autoComplete="username" autoCapitalize="characters" spellCheck={false} required/></div></label> : <label className="auth-field auth-field--full"><span>Correo electrónico</span><div className="auth-input-icon"><GraduationCap size={18}/><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="correo@institución.edu.mx" autoComplete="username" required/></div></label>)}
            {isActivation && <label className="auth-field auth-field--full"><span>Fecha de nacimiento</span><ActivationBirthDatePicker value={fechaNacimiento} onChange={setFechaNacimiento}/><small className="auth-help">Debe coincidir con la fecha que registró tu tutor en el padrón.</small></label>}
            <label className="auth-field auth-field--full"><span>{isPasswordChange ? "Nueva contraseña" : "Contraseña"}</span><div className="auth-input-icon"><LockKeyhole size={17}/><input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={isActivation ? "Crea una contraseña segura" : isPasswordChange ? "Al menos 12 caracteres" : "Escribe tu contraseña"} autoComplete={isActivation || isPasswordChange ? "new-password" : "current-password"} minLength={isActivation ? 8 : isPasswordChange ? 12 : undefined} required/><button type="button" className="auth-password-toggle" aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"} title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"} aria-pressed={showPassword} onClick={() => setShowPassword((visible) => !visible)}>{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button></div></label>
            {(isActivation || isPasswordChange) && <label className="auth-field auth-field--full"><span>Confirma la contraseña</span><div className="auth-input-icon"><LockKeyhole size={17}/><input type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirma tu contraseña" autoComplete="new-password" minLength={isPasswordChange ? 12 : 8} required/><button type="button" className="auth-password-toggle" aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"} title={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"} aria-pressed={showConfirmPassword} onClick={() => setShowConfirmPassword((visible) => !visible)}>{showConfirmPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button></div></label>}
            {message && <p className="auth-message" role="alert">{message}</p>}
            <button className="auth-submit" type="submit" disabled={loading}>{loading ? "Procesando…" : isActivation ? "Activar mi cuenta" : isPasswordChange ? "Guardar nueva contraseña" : "Iniciar sesión"}<span/></button>
          </form>
          {audience === "student" ? <p className="auth-toggle-text">{isActivation ? "¿Ya activaste tu cuenta?" : "¿Es tu primer acceso?"}<button type="button" onClick={() => { setMode(isActivation ? "login" : "activate"); setMessage(null); }}>{isActivation ? "Inicia sesión" : "Activa tu cuenta"}</button></p> : isPasswordChange ? <p className="auth-admin-note auth-admin-note--form">Después del cambio llegarás al panel administrativo.</p> : <p className="auth-admin-note auth-admin-note--form">¿Necesitas acceso? Solicítalo al responsable de la plataforma. No compartas tu contraseña.</p>}
        </>}
      </section>
    </section>
  </main>;
}
