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

const CareerDetail = lazy(() => import("./pages/CareerDetail"));

function ScrollManager() {
  const { pathname } = useLocation();

  useEffect(() => {
    const targetId = sessionStorage.getItem("landing-scroll-target");

    if (pathname === "/" && targetId) {
      sessionStorage.removeItem("landing-scroll-target");

      requestAnimationFrame(() => {
        document.getElementById(targetId)?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });

      return;
    }

    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function AppFooter() {
  const { pathname } = useLocation();

  if (
    pathname === "/acceso" ||
    pathname === "/dashboard" ||
    pathname === "/dashboard/eventos" ||
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

          {/* Vista de previsualización de Eventos: interactiva, con botón de editar. Solo para el admin. */}
          <Route
            path="/eventos"
            element={
              <RequireAdmin>
                <Navbar />
                <EventosAdmin />
              </RequireAdmin>
            }
          />

          {/* Vista de previsualización de Aspirantes: interactiva, con botón de editar. Solo para el admin. */}
          <Route
            path="/aspirantes"
            element={
              <RequireAdmin>
                <Navbar />
                <AspirantesAdmin />
              </RequireAdmin>
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

          {/* Detalle de cada carrera */}
          <Route
            path="/carreras/:careerId"
            element={
              <Suspense
                fallback={
                  <main
                    className="min-h-dvh bg-dark-bg"
                    aria-busy="true"
                  />
                }
              >
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