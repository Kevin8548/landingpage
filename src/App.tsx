import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Hero from "./components/sections/Hero"; 
import { Careers } from "./components/sections/Careers"; // 🌟 Importamos la sección de Carreras
import { Aspirantes } from "./components/sections/Aspirantes";
import { WhyChooseTI } from "./components/layout/View";
import Footer from "./components/layout/Footer";
import Navbar from "./components/layout/Navbar"; 

// La página de detalle no forma parte de la carga inicial de la landing.
const CareerDetail = lazy(() => import("./pages/CareerDetail"));

export default function App() {
  return (
    <BrowserRouter basename="/landingpage">
      <Navbar />
      
      <Routes>
        {/* Ruta principal: Aquí se muestra toda tu Landing Page en cascada */}
        <Route 
          path="/" 
          element={
            <>
              <Hero />
              <Careers /> 
              <Aspirantes />
              <WhyChooseTI />
              
            </>
          } 
        />
        
        {/* Ruta de detalles: Al dar clic en una carrera, los manda para acá limpiecito */}
        <Route
          path="/carreras/:careerId"
          element={
            <Suspense fallback={<main className="min-h-dvh bg-dark-bg" aria-busy="true" />}>
              <CareerDetail />
            </Suspense>
          }
        />
      </Routes>
      
      <Footer />
    </BrowserRouter>
  );
}
