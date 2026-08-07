import { useState, type FormEvent } from "react";
import {
    ArrowLeft,
    ChevronDown,
    GraduationCap,
    LockKeyhole,
    UserRound,
} from "lucide-react";
import "./Auth.css";

type Mode = "login" | "register";

export default function Auth() {
    const [mode, setMode] = useState<Mode>("login");

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
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
                onClick={() => setMode("login")}
                >
                {/* Iniciar sesión */}
                </button>

                <button
                type="button"
                className={!isLogin ? "is-active" : ""}
                onClick={() => setMode("register")}
                >
                {/* Registro */}
                </button>
            </div>

            <div className="auth-form-heading">
                <span className="auth-form-heading__eyebrow">
                {isLogin ? "BIENVENIDO" : "ÚNETE A LA COMUNIDAD"}
                </span>

                <h2 >
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

                {/* <label className="auth-field">
                <span>Usuario</span>

                <div className="auth-input-icon">
                    <UserRound size={17} />
                    <input
                    type="text"
                    placeholder="Ingresa tu usuario"
                    autoComplete="username"
                    required
                    />
                </div>
                </label> */}

                <label className="auth-field">
                <span>Matrícula</span>

                <div className="auth-input-icon">
                    <GraduationCap size={18} />
                    <input
                    type="text"
                    placeholder="Ej. 202400123"
                    inputMode="numeric"
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

                <button className="auth-submit" type="submit">
                {isLogin ? "Iniciar sesión" : "Crear mi cuenta"}
                <span></span>
                </button>
            </form>

            <p className="auth-toggle-text">
                {isLogin ? "¿Aún no tienes una cuenta?" : "¿Ya tienes cuenta?"}

                <button
                type="button"
                onClick={() => setMode(isLogin ? "register" : "login")}
                >
                {isLogin ? "Regístrate" : "Inicia sesión"}
                </button>
            </p>
            </section>
        </section>
        </main>
    );
    }
