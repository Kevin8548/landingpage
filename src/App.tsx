import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Careers } from "./components/sections/Careers";
import { Aspirantes } from "./components/sections/Aspirantes";
import { WhyChooseTI } from "./components/layout/View";
import Footer from "./components/layout/Footer";
import Navbar from "./components/layout/Navbar";
import Hero from "./components/sections/Hero";
import FuturoReveal from "./components/sections/Futuro_Reveal";
import { ConfirmProvider } from "./components/ui/ConfirmDialog";

// La página de detalle no forma parte de la carga inicial de la landing.
const CareerDetail = lazy(() => import("./pages/CareerDetail"));

export default function App() {
  return (
    <ConfirmProvider>
      <BrowserRouter basename="/landingpage">
        <Navbar />

        <Routes>
        {/* Landing principal */}
          <Route
          path="/"
          element={
          <>
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
              {/* sección de eventos */}
            </section>


            <section id="aspirantes">
                <Aspirantes />
            </section>
          </>
          }
          />

          {/* Detalle de carrera */}
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

        <Footer />
      </BrowserRouter>
    </ConfirmProvider>
  );
}