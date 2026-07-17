import { Home } from "./pages/Home";
import { Hero } from "./components/sections/Hero";
import Footer from "./components/layout/Footer";
import { Navbar } from "./components/layout/Navbar";
import { WhyChooseTI } from "./components/layout/View";

export default function App() {
  return (
    <>
      <Navbar />  
      <hr />
      <Hero />
      <WhyChooseTI />
      <Home />
      <Footer />
    </>
  )
}