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
import { Eventos } from "./components/sections/eventos";

const CareerDetail = lazy(() => import("./pages/CareerDetail"));
const AspirantesPage = lazy(() => import("./pages/Aspirantes"));

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

  if (pathname === "/acceso") {
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

          {/* Pantalla estática de acceso */}
          <Route path="/acceso" element={<Auth />} />

          {/* Detalle de cada carrera */}
          <Route
            path="/carreras/:careerId"
            element={
              <Suspense fallback={<main className="min-h-dvh bg-dark-bg" aria-busy="true" />}>
                <CareerDetail />
              </Suspense>
            }
          />

          {/* Página completa de proceso de admisión */}
          <Route
            path="/aspirantes"
            element={
              <Suspense fallback={<main className="min-h-dvh bg-dark-bg" aria-busy="true" />}>
                <AspirantesPage />
              </Suspense>
            }
          />
        </Routes>

        <AppFooter />
      </BrowserRouter>
    </ConfirmProvider>
  );
}