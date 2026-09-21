import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    GraduationCap,
    LockKeyhole,
    User as UserIcon,
    Calendar
} from "lucide-react";
import { setAdminAuthenticated } from "../../lib/adminAuth";
import { supabase } from "../../lib/supabase";
import "./Auth.css";

type Mode = "login" | "register";

export default function Auth() {
    const [mode, setMode] = useState<Mode>("login");
    const [registerStep, setRegisterStep] = useState<1 | 2>(1);
    
    // Auth fields
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    
    // Step 1 fields
    const [matricula, setMatricula] = useState("");
    const [fechaNacimiento, setFechaNacimiento] = useState("");
    
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setMessage(null);
        setLoading(true);

        const cleanEmail = email.trim().toLowerCase();
        const cleanMatricula = matricula.trim();

        try {
            if (mode === "register") {
                if (registerStep === 1) {
                    // Paso 1: Validar matrícula y fecha de nacimiento contra el padrón precargado
                    const { error } = await supabase.rpc('validate_padron', {
                        p_matricula: cleanMatricula,
                        p_fecha_nacimiento: fechaNacimiento
                    });

                    if (error) {
                        throw new Error(error.message || "Datos incorrectos. Verifica tu matrícula y fecha de nacimiento.");
                    }

                    // Validación exitosa
                    setRegisterStep(2);
                    setMessage(null);
                } else {
                    // Paso 2: Crear cuenta en auth.users y delegar sincronización al trigger SQL
                    const { data, error } = await supabase.auth.signUp({
                        email: cleanEmail,
                        password: password,
                        options: {
                            data: {
                                matricula: cleanMatricula,
                                role: "student",
                            },
                        },
                    });

                    if (error) throw error;

                    if (data.user) {
                        setMessage("¡Cuenta creada con éxito! Redirigiendo...");
                        setTimeout(() => {
                            navigate("/");
                        }, 1200);
                    }
                }
            } else {
                // Inicio de sesión
                const { data, error } = await supabase.auth.signInWithPassword({
                    email: cleanEmail,
                    password: password,
                });

                if (error || !data.user) {
                    throw new Error("Correo o contraseña incorrectos.");
                }

                // Consulta el rol guardado en profiles
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("role")
                    .eq("id", data.user.id)
                    .single();
                if (profile?.role === "admin") {
                    setAdminAuthenticated(true);
                    navigate("/dashboard"); 
                } else {
                    navigate("/"); 
                }

                navigate("/");
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                setMessage(err.message);
            } else {
                setMessage("Ocurrió un error inesperado.");
            }
        } finally {
            setLoading(false);
        }
    };

    const isLogin = mode === "login";

    return (
        <main className="auth-page">
            <div className="auth-orb auth-orb--one" />
            <div className="auth-orb auth-orb--two" />

            <section className="auth-card">
                <aside className="auth-showcase">
                    <a
                        className="auth-back"
                        href={import.meta.env.BASE_URL}
                        aria-label="Volver al sitio"
                    >
                        <ArrowLeft size={16} />
                        Volver al sitio
                    </a>

                    <div className="auth-brand">
                        <span className="auth-brand__mark">UTT</span>
                        <span>UNIVERSIDAD TECNOLÓGICA DE TLAXCALA</span>
                    </div>

                    <div className="auth-showcase__content">
                        <h1>
                            Tu futuro comienza
                            <br />
                            <em>aquí.</em>
                        </h1>

                        <p>
                            Accede a información, recursos y experiencias pensadas para tu
                            trayectoria universitaria.
                        </p>

                        <div className="auth-showcase__line">
                            <span />
                        </div>
                    </div>
                </aside>

                <section className="auth-form-panel">
                    <div className="auth-switch" aria-label="Tipo de acceso">
                        <button
                            type="button"
                            className={isLogin ? "is-active" : ""}
                            onClick={() => {
                                setMode("login");
                                setMessage(null);
                                setRegisterStep(1);
                            }}
                        >
                            Iniciar sesión
                        </button>

                        <button
                            type="button"
                            className={!isLogin ? "is-active" : ""}
                            onClick={() => {
                                setMode("register");
                                setMessage(null);
                            }}
                        >
                            Registrarse
                        </button>
                    </div>

                    <div className="auth-form-heading">
                        <span className="auth-form-heading__eyebrow">
                            {isLogin ? "BIENVENIDO" : "ÚNETE A LA COMUNIDAD"}
                        </span>

                        <h2>
                            {isLogin ? "Inicia sesión" : "Crea tu cuenta"}
                        </h2>

                        <p>
                            {isLogin
                                ? "Ingresa tus datos para continuar"
                                : registerStep === 1 
                                ? "Paso 1: Valida tu identidad institucional"
                                : "Paso 2: Configura tu acceso"}
                        </p>
                    </div>

                    <form className="auth-form" onSubmit={handleSubmit}>
                        {!isLogin && registerStep === 1 && (
                            <>
                                <label className="auth-field auth-field--full">
                                    <span>Matrícula</span>
                                    <div className="auth-input-icon">
                                        <UserIcon size={18} />
                                        <input
                                            type="text"
                                            placeholder="Ingresa tu matrícula"
                                            value={matricula}
                                            onChange={(e) => setMatricula(e.target.value)}
                                            required
                                        />
                                    </div>
                                </label>

                                <label className="auth-field auth-field--full">
                                    <span>Fecha de Nacimiento</span>
                                    <div className="auth-input-icon">
                                        <Calendar size={18} />
                                        <input
                                            type="date"
                                            value={fechaNacimiento}
                                            onChange={(e) => setFechaNacimiento(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.5rem", display: "block" }}>
                                        Tu fecha de nacimiento servirá como dato clave para verificar tu identidad.
                                    </span>
                                </label>
                            </>
                        )}

                        {(isLogin || (!isLogin && registerStep === 2)) && (
                            <>
                                <label className="auth-field">
                                    <span>Correo Institucional</span>
                                    <div className="auth-input-icon">
                                        <GraduationCap size={18} />
                                        <input
                                            type="email"
                                            placeholder="ejemplo@utt.edu.mx"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                </label>

                                <label className="auth-field">
                                    <span>Contraseña</span>
                                    <div className="auth-input-icon">
                                        <LockKeyhole size={17} />
                                        <input
                                            type="password"
                                            placeholder="Mínimo 6 caracteres"
                                            autoComplete={
                                                isLogin ? "current-password" : "new-password"
                                            }
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                </label>
                            </>
                        )}

                        {isLogin ? (
                            <label className="auth-check">
                                <input type="checkbox" />
                                <span>Recordar mi contraseña</span>
                            </label>
                        ) : (
                            registerStep === 2 && (
                                <label className="auth-check">
                                    <input type="checkbox" required />
                                    <span>
                                        Acepto el aviso de privacidad y los términos de uso.
                                    </span>
                                </label>
                            )
                        )}

                        {message && (
                            <p
                                role="alert"
                                style={{
                                    fontSize: "0.8rem",
                                    color: "var(--orange)",
                                    border: "1px solid var(--line)",
                                    borderRadius: "0.5rem",
                                    padding: "0.6rem 0.8rem",
                                    background: "color-mix(in srgb, var(--orange) 10%, transparent)",
                                }}
                            >
                                {message}
                            </p>
                        )}

                        <button className="auth-submit" type="submit" disabled={loading}>
                            {loading
                                ? "Procesando..."
                                : isLogin
                                ? "Iniciar sesión"
                                : registerStep === 1
                                ? "Validar mis datos"
                                : "Crear mi cuenta"}
                            <span />
                        </button>
                    </form>

                    <p className="auth-toggle-text">
                        {isLogin ? "¿Aún no tienes una cuenta?" : "¿Ya tienes cuenta?"}

                        <button
                            type="button"
                            onClick={() => {
                                setMode(isLogin ? "register" : "login");
                                setMessage(null);
                                setRegisterStep(1);
                            }}
                        >
                            {isLogin ? "Regístrate" : "Inicia sesión"}
                        </button>
                    </p>
                </section>
            </section>
        </main>
    );
}