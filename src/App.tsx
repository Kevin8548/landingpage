import { Home } from "./components/Home";
import { Hero } from "./components/sections/Hero";
import Footer from "./components/layout/footer";

export default function App() {
  return (
    <>
    <h1 className="text-3xl w-full text-center py-2">
      Navbar
    </h1>
    <hr />
    <Hero />
    <Footer />
    <Home />
    </>
  )
}