import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home";
import CareerDetail from "./pages/CareerDetail";
import Footer from "./components/layout/Footer";
import { Navbar } from "./components/layout/Navbar";

export default function App() {
  return (
    <BrowserRouter basename="/landingpage">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/carreras/:careerId" element={<CareerDetail />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}