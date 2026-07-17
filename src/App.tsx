import { BrowserRouter, Routes, Route } from "react-router-dom";
import Hero from "./components/sections/Hero"; // 🛠️ Importado sin llaves y directo
import { Aspirantes } from "./components/sections/Aspirantes";
import { WhyChooseTI } from "./components/layout/View";
import CareerDetail from "./pages/CareerDetail";
import Footer from "./components/layout/Footer";
import Navbar from "./components/layout/Navbar"; // 🛠️ Sin llaves

export default function App() {
  return (
    <BrowserRouter basename="/landingpage">
      <Navbar />
      
      <Routes>
        {/* Aquí la ruta principal renderiza tu Hero junto con las secciones que ocupas */}
        <Route 
          path="/" 
          element={
            <>
              <Hero />
              <Aspirantes />
              <WhyChooseTI />
            </>
          } 
        />
        
        {/* La ruta de detalles solo mostrará la carrera que elijan */}
        <Route path="/carreras/:careerId" element={<CareerDetail />} />
      </Routes>
      
      <Footer />
    </BrowserRouter>
  );
}