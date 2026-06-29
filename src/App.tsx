import { Home } from "./components/Home";
import { Hero } from "./components/sections/Hero";

export default function App() {
  return (
    <>
    <h1 className="text-3xl w-full text-center py-2">
      Hello world 🚀🚀
    </h1>
    <hr />
    <Hero />
    <Home />
    </>
  )
}