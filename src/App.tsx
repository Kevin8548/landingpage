import { Home } from "./components/Home";
import { Hero } from "./components/sections/Hero";
import {Aspirantes} from "./components/sections/Aspirantes";
import Footer from "./components/layout/footer";
import { Navbar } from "./components/Header";


export default function App() {
  return (
    <>
    
      <Navbar />
    
    <hr />
    <Hero />
    <Aspirantes />
    <Footer />
    <Home />
    </>
  )
}