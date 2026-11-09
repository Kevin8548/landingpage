import { lazy, Suspense, useLayoutEffect } from "react";
import {
  BrowserRouter,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { Aspirantes } from "./components/sections/Aspirantes";
import { Careers } from "./components/sections/Careers";
import { WhyChooseTI } from "./components/sections/View";
import Footer from "./components/layout/Footer";
import Navbar from "./components/layout/Navbar";
import Hero from "./components/sections/Hero";
import LandingIntro from "./components/sections/LandingIntro";
import FuturoReveal from "./components/sections/Futuro_Reveal";
import { ConfirmProvider } from "./components/ui/ConfirmDialog";
import Eventos from "./components/sections/eventos";
import RequireAdmin from "./components/auth/RequireAdmin";
import RequirePreviewAccess from "./components/auth/RequirePreviewAccess";
import NotFound from "./pages/NotFound";
import ChatbotWidget from "./components/chatbot/ChatbotWidget";
const Auth = lazy(() => import("./components/auth/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Events = lazy(() => import("./pages/Events"));
const Projects = lazy(() => import("./pages/Projects"));
const EventosAdmin = lazy(() => import("./components/dashboard/EventosAdmin"));
const ProjectsPreview = lazy(() => import("./components/dashboard/ProjectsPreview"));
const AspirantesAdmin = lazy(() => import("./components/dashboard/AspirantesAdmin"));
const PadronAdmin = lazy(() => import("./pages/PadronAdmin"));
const StudentActivities = lazy(() => import("./pages/StudentActivities"));
const AdminAccounts = lazy(() => import("./pages/AdminAccounts"));
const CareerDetail = lazy(() => import("./pages/CareerDetail"));
const AspirantesPage = lazy(() => import("./pages/Aspirantes"));

function ScrollManager() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    // Prevent the browser from restoring a previous anchor/scroll position
    // (for example the Events section) when the public landing page opens.
    window.history.scrollRestoration = "manual";

    // La página principal siempre inicia desde arriba.
    if (pathname === "/") {
      sessionStorage.removeItem("landing-scroll-target");

      // Evita que una URL como /#eventos vuelva a desplazar la página al
      // ancla después del primer render.
      if (window.location.hash) {
        window.history.replaceState(window.history.state, "", `${window.location.pathname}${window.location.search}`);
      }

      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "auto",
      });

      requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: "auto" }));

      return;
    }

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  }, [pathname]);

  return null;
}

function AppFooter() {
  const { pathname } = useLocation();

  if (pathname === "/acceso" || pathname === "/alumno/actividades" || pathname.startsWith("/dashboard") || ["/eventos", "/proyectos", "/aspirantes"].includes(pathname)) {
    return null;
  }

  return <Footer />;
}

function AppChatbot() {
  const { pathname } = useLocation();
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/alumno") || pathname === "/acceso") return null;
  return <ChatbotWidget />;
}

export default function App() {
  return (
    <ConfirmProvider>
      <BrowserRouter basename="/landingpage">
        <ScrollManager />

        <Suspense fallback={<main className="min-h-dvh bg-dark-bg" aria-busy="true" />}>
        <Routes>
          {/* Landing principal */}
          <Route
            path="/"
            element={
              <>
                <LandingIntro />
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
              <RequireAdmin>
                <RequirePreviewAccess>
                  <Navbar />
                  <EventosAdmin />
                </RequirePreviewAccess>
              </RequireAdmin>
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
          <Route path="/alumno/actividades" element={<StudentActivities />} />

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
          <Route
            path="/proyectos"
            element={
              <RequireAdmin>
                <RequirePreviewAccess>
                  <Navbar />
                  <ProjectsPreview />
                </RequirePreviewAccess>
              </RequireAdmin>
            }
          />
          <Route
            path="/dashboard/proyectos"
            element={
              <RequireAdmin>
                <Projects />
              </RequireAdmin>
            }
          />
          <Route
            path="/dashboard/padron"
            element={
              <RequireAdmin>
                <PadronAdmin />
              </RequireAdmin>
            }
          />
          <Route path="/dashboard/administradores" element={<RequireAdmin><AdminAccounts /></RequireAdmin>} />

          {/* Edición de Aspirantes: mismo patrón que /eventos, pero
              usando RequirePreviewAccess por el mismo motivo (solo
              accesible navegando desde dentro del dashboard). */}
          <Route
            path="/dashboard/aspirantes"
            element={
              <RequireAdmin>
                <RequirePreviewAccess>
                  <Navbar />
                  <AspirantesAdmin />
                </RequirePreviewAccess>
              </RequireAdmin>
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

          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>

        <AppFooter />
        <AppChatbot />
      </BrowserRouter>
    </ConfirmProvider>
  );
}
