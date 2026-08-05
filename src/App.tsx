import { lazy, Suspense, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { Careers } from "./components/sections/Careers";
import { Aspirantes } from "./components/sections/Aspirantes";
import { WhyChooseTI } from "./components/layout/View";
import Footer from "./components/layout/Footer";
import Navbar from "./components/layout/Navbar";
import Hero from "./components/sections/Hero";
import FuturoReveal from "./components/sections/Futuro_Reveal";
import { ConfirmProvider } from "./components/ui/ConfirmDialog";

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

export default function App() {
  return (
    <ConfirmProvider>
      <BrowserRouter basename="/landingpage">
        <ScrollManager />

        <Routes>
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
                  {/* Sección de eventos */}
                </section>

                <section id="aspirantes">
                  <Aspirantes />
                </section>
              </>
            }
          />

          <Route
            path="/carreras/:careerId"
            element={
              <Suspense
                fallback={
                  <main className="min-h-dvh bg-dark-bg" aria-busy="true" />
                }
              >
                <CareerDetail />
              </Suspense>
            }
          />
        </Routes>

        <Footer />
      </BrowserRouter>
    </ConfirmProvider>
  );
}