import { Home } from "./pages/Home";
import { Hero } from "./components/sections/Hero";
import Footer from "./components/layout/Footer";
import { Navbar } from "./components/layout/Navbar";

export default function App() {
  return (
    <>
      <Navbar />
      <hr />
      <Hero />
      <Home />
      <Footer />
    </>
  )
}