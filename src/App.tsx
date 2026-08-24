import { lazy, Suspense, useEffect } from "react";
import {
  BrowserRouter,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import { Aspirantes } from "./components/sections/Aspirantes";
import { Careers } from "./components/sections/Careers";
import { WhyChooseTI } from "./components/layout/View";
import Footer from "./components/layout/Footer";
import Navbar from "./components/layout/Navbar";
import Auth from "./components/auth/Auth";
import Hero from "./components/sections/Hero";
import FuturoReveal from "./components/sections/Futuro_Reveal";
import { ConfirmProvider } from "./components/ui/ConfirmDialog";

import Dashboard from "./pages/Dashboard";
import Events from "./pages/Events";
import { Eventos } from "./components/sections/eventos";
import EventosAdmin from "./components/dashboard/EventosAdmin";
import AspirantesAdmin from "./components/dashboard/AspirantesAdmin";
import RequireAdmin from "./components/auth/RequireAdmin";
import RequirePreviewAccess from "./components/auth/RequirePreviewAccess";

const CareerDetail = lazy(() => import("./pages/CareerDetail"));
const AspirantesPage = lazy(() => import("./pages/Aspirantes"));

function ScrollManager() {
  const { pathname } = useLocation();

  useEffect(() => {
    // La página principal siempre inicia desde arriba.
    if (pathname === "/") {
      sessionStorage.removeItem("landing-scroll-target");

      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "instant",
      });

      return;
    }

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, [pathname]);

  return null;
}

function AppFooter() {
  const { pathname } = useLocation();

  if (
    pathname === "/acceso" ||
    pathname === "/dashboard" ||
    pathname === "/dashboard/eventos" ||
    pathname === "/dashboard/aspirantes" ||
    pathname === "/eventos" ||
    pathname === "/aspirantes"
  ) {
    return null;
  }

  return <Footer />;
}

export default function App() {
  return (
    <ConfirmProvider>
      <BrowserRouter basename="/landingpage">
        <ScrollManager />

        <Routes>
          {/* Landing principal */}
          <Route
            path="/"
            element={
              <>
                <Navbar />

                <section id="hero">
                  <Hero />
                  <FuturoReveal />
                </section>

                <section id="por-que-ti">
                  <WhyChooseTI />
                </section>

                <section id="carreras">
                  <Careers />
                </section>

                <section id="eventos">
                  <Eventos />
                </section>

                <section id="aspirantes">
                  <Aspirantes />
                </section>
              </>
            }
          />

          {/* Vista de previsualización de Eventos: interactiva, con botón de
              editar. Solo para el admin, Y SOLO si llega navegando desde
              dentro del dashboard (RequirePreviewAccess exige el state
              `fromDashboard`, que se pierde si escribes la URL a mano o si
              recargas la página, forzando volver a pasar por /acceso). */}
          <Route
            path="/eventos"
            element={
              <RequirePreviewAccess>
                <Navbar />
                <EventosAdmin />
              </RequirePreviewAccess>
            }
          />

          {/* Página completa y 100% pública de proceso de admisión. No tiene
              ninguna lógica de admin — cero riesgo de que se filtre el modo
              edición aquí. */}
          <Route
            path="/aspirantes"
            element={
              <Suspense fallback={<main className="min-h-dvh bg-dark-bg" aria-busy="true" />}>
                <AspirantesPage />
              </Suspense>
            }
          />

          {/* Pantalla estática de acceso */}
          <Route path="/acceso" element={<Auth />} />

          {/* Panel para administrar eventos */}
          <Route
            path="/dashboard"
            element={
              <RequireAdmin>
                <Dashboard />
              </RequireAdmin>
            }
          />
          <Route
            path="/dashboard/eventos"
            element={
              <RequireAdmin>
                <Events />
              </RequireAdmin>
            }
          />

          {/* Edición de Aspirantes: mismo patrón que /eventos, pero
              usando RequirePreviewAccess por el mismo motivo (solo
              accesible navegando desde dentro del dashboard). */}
          <Route
            path="/dashboard/aspirantes"
            element={
              <RequirePreviewAccess>
                <Navbar />
                <AspirantesAdmin />
              </RequirePreviewAccess>
            }
          />

          {/* Detalle de cada carrera */}
          <Route
            path="/carreras/:careerId"
            element={
              <Suspense fallback={<main className="min-h-dvh bg-dark-bg" aria-busy="true" />}>
                <CareerDetail />
              </Suspense>
            }
          />
        </Routes>

        <AppFooter />
      </BrowserRouter>
    </ConfirmProvider>
  );
}