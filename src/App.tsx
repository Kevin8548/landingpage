import { BrowserRouter, Routes, Route } from "react-router-dom";
import Hero from "./components/sections/Hero"; 
import { Careers } from "./components/sections/Careers"; // 🌟 Importamos la sección de Carreras
import { Aspirantes } from "./components/sections/Aspirantes";
import { WhyChooseTI } from "./components/layout/View";
import CareerDetail from "./pages/CareerDetail";
import Footer from "./components/layout/Footer";
import Navbar from "./components/layout/Navbar"; 

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
        <Route path="/carreras/:careerId" element={<CareerDetail />} />
      </Routes>
      
      <Footer />
    </BrowserRouter>
  );
}