import { Home } from "./components/Home";
import { Hero } from "./components/sections/Hero";
import Footer from "./components/layout/footer";
import { Navbar } from "./components/Header";

export default function App() {
  return (
    <>
    
      <Navbar />
    
    <hr />
    <Hero />
    <Footer />
    <Home />
    </>
  )
}