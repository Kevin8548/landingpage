import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    ChevronDown,
    GraduationCap,
    LockKeyhole,
} from "lucide-react";
import { setAdminAuthenticated } from "../../lib/adminAuth";
import "./Auth.css";

type Mode = "login" | "register";

const ADMIN_USERNAME = import.meta.env.VITE_ADMIN_USERNAME ?? "";
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD ?? "";

export default function Auth() {
    const [mode, setMode] = useState<Mode>("login");
    const [matricula, setMatricula] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setMessage(null);

        if (mode === "register") {
            setMessage("El registro aún no está conectado a ningún backend. Vuelve pronto.");
            return;
        }

        if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
            setMessage("No hay credenciales configuradas. Revisa el archivo .env del proyecto.");
            return;
        }

        if (matricula === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
            setAdminAuthenticated(true);
            navigate("/dashboard");
            return;
        }

        setMessage("Matrícula o contraseña incorrectos.");
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
                
                </button>

                <button
                type="button"
                className={!isLogin ? "is-active" : ""}
                onClick={() => {
                    setMode("register");
                    setMessage(null);
                }}
                >
                
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
                        <input type="text" placeholder="Tu nombre" required />
                        </label>

                        <div className="auth-form__grid">
                        <label className="auth-field">
                            <span>Apellido Paterno</span>
                            <input type="text" placeholder="Apellido paterno" required />
                        </label>

                        <label className="auth-field">
                            <span>Apellido Materno</span>
                            <input type="text" placeholder="Apellido materno" required />
                        </label>
                        </div>
                    </>
                    )}

                <label className="auth-field">
                <span>Matrícula</span>

                <div className="auth-input-icon">
                    <GraduationCap size={18} />
                    <input
                    type="text"
                    placeholder="Ej. 202400123"
                    inputMode="numeric"
                    value={matricula}
                    onChange={(e) => setMatricula(e.target.value)}
                    required
                    />
                </div>
                </label>

                {!isLogin && (
                <>
                    <label className="auth-field">
                    <span>Carrera</span>

                    <div className="auth-select">
                        <select defaultValue="" required>
                        <option value="" disabled>
                            Selecciona tu carrera
                        </option>
                        <option>TSU en Desarrollo de Software</option>
                        <option>TSU en Redes y Ciberseguridad</option>
                        <option>TSU en Entornos Virtuales</option>
                        <option>Ingeniería en TI e Innovación Digital</option>
                        </select>
                        <ChevronDown size={17} />
                    </div>
                    </label>
                </>
                )}

                <label className="auth-field">
                <span>Contraseña</span>

                <div className="auth-input-icon">
                    <LockKeyhole size={17} />
                    <input
                    type="password"
                    placeholder="Ingresa tu contraseña"
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

                <button className="auth-submit" type="submit">
                {isLogin ? "Iniciar sesión" : "Crear mi cuenta"}
                <span></span>
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