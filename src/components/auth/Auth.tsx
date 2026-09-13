import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    ChevronDown,
    GraduationCap,
    LockKeyhole,
    User as UserIcon,
} from "lucide-react";
import { setAdminAuthenticated } from "../../lib/adminAuth";
import { supabase } from "../../lib/supabase";
import "./Auth.css";

type Mode = "login" | "register";

export default function Auth() {
    const [mode, setMode] = useState<Mode>("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [nombre, setNombre] = useState("");
    const [apellidoPaterno, setApellidoPaterno] = useState("");
    const [apellidoMaterno, setApellidoMaterno] = useState("");
    const [carrera, setCarrera] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setMessage(null);
        setLoading(true);

        const cleanEmail = email.trim().toLowerCase();

        try {
            if (mode === "register") {
                // Registro: envía credenciales y metadatos que el trigger de SQL guardará en profiles
                const { data, error } = await supabase.auth.signUp({
                    email: cleanEmail,
                    password: password,
                    options: {
                        data: {
                            nombre: nombre.trim(),
                            apellido_paterno: apellidoPaterno.trim(),
                            apellido_materno: apellidoMaterno.trim(),
                            carrera: carrera,
                            role: "student",
                        },
                    },
                });

                if (error) throw error;

                if (data.user) {
                    setMessage("¡Cuenta creada con éxito! Redirigiendo...");
                    setTimeout(() => {
                        navigate("/dashboard");
                    }, 1200);
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
                }

                navigate("/dashboard");
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
                                : "Completa tus datos para registrarte"}
                        </p>
                    </div>

                    <form className="auth-form" onSubmit={handleSubmit}>
                        {!isLogin && (
                            <>
                                <label className="auth-field auth-field--full">
                                    <span>Nombre(s)</span>
                                    <div className="auth-input-icon">
                                        <UserIcon size={18} />
                                        <input
                                            type="text"
                                            placeholder="Tu nombre"
                                            value={nombre}
                                            onChange={(e) => setNombre(e.target.value)}
                                            required
                                        />
                                    </div>
                                </label>

                                <div className="auth-form__grid">
                                    <label className="auth-field">
                                        <span>Apellido Paterno</span>
                                        <input
                                            type="text"
                                            placeholder="Apellido paterno"
                                            value={apellidoPaterno}
                                            onChange={(e) => setApellidoPaterno(e.target.value)}
                                            required
                                        />
                                    </label>

                                    <label className="auth-field">
                                        <span>Apellido Materno</span>
                                        <input
                                            type="text"
                                            placeholder="Apellido materno"
                                            value={apellidoMaterno}
                                            onChange={(e) => setApellidoMaterno(e.target.value)}
                                            required
                                        />
                                    </label>
                                </div>

                                <label className="auth-field">
                                    <span>Carrera</span>
                                    <div className="auth-select">
                                        <select
                                            value={carrera}
                                            onChange={(e) => setCarrera(e.target.value)}
                                            required
                                        >
                                            <option value="" disabled>
                                                Selecciona tu carrera
                                            </option>
                                            <option value="TSU en Desarrollo de Software">
                                                TSU en Desarrollo de Software
                                            </option>
                                            <option value="TSU en Redes y Ciberseguridad">
                                                TSU en Redes y Ciberseguridad
                                            </option>
                                            <option value="TSU en Entornos Virtuales">
                                                TSU en Entornos Virtuales
                                            </option>
                                            <option value="Ingeniería en TI e Innovación Digital">
                                                Ingeniería en TI e Innovación Digital
                                            </option>
                                        </select>
                                        <ChevronDown size={17} />
                                    </div>
                                </label>
                            </>
                        )}

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

                        {isLogin ? (
                            <label className="auth-check">
                                <input type="checkbox" />
                                <span>Recordar mi contraseña</span>
                            </label>
                        ) : (
                            <label className="auth-check">
                                <input type="checkbox" required />
                                <span>
                                    Acepto el aviso de privacidad y los términos de uso.
                                </span>
                            </label>
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