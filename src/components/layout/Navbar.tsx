import { useEffect, useRef, useState } from "react";
import "./Navbar.css";

const LINKS = [
  { label: "¿Por qué TI?", href: "#por-que-ti" },
  { label: "Carreras", href: "#carreras" },
  { label: "Eventos", href: "#eventos" },
  { label: "Aspirantes", href: "#aspirantes" },
];

const SECTIONS = [
  "hero",
  "por-que-ti",
  "carreras",
  "eventos",
  "aspirantes",
];

export default function Navbar() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const linkRefs = useRef<Array<HTMLAnchorElement | null>>([]);

  useEffect(() => {

    const handleScroll = () => {

      const scrollTop = window.scrollY;
      const documentHeight =
        document.documentElement.scrollHeight - window.innerHeight;


      // porcentaje total del scroll
      const totalProgress =
        (scrollTop / documentHeight) * 100;

      setProgress(totalProgress);


      // detectar sección activa
      let current = 0;

      SECTIONS.forEach((section, index) => {

        const element = document.getElementById(section);

        if(element){

          const offsetTop = element.offsetTop - 150;

          if(scrollTop >= offsetTop){
            current = index;
          }

        }

      });

      setActiveIndex(current);

    };


    window.addEventListener("scroll", handleScroll);

    handleScroll();


    return () =>
      window.removeEventListener("scroll", handleScroll);

  }, []);


  const scrollToSection = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href:string
  ) => {

    e.preventDefault();

    const section = document.querySelector(href);

    section?.scrollIntoView({
      behavior:"smooth",
      block:"start"
    });

  };


  return (
    <nav className="tid-nav">

      <a 
        className="tid-logo-mark"
        href="#hero"
        onClick={(e)=>scrollToSection(e,"#hero")}
      >
        <div className="tid-logo-text">
          UTT
          <span>TLAXCALA</span>
        </div>
      </a>



      <ul className="tid-nav-links">

        {LINKS.map((link,i)=>(

          <li key={link.label}>

            <a
              href={link.href}
              ref={(el)=>{
                linkRefs.current[i]=el;
              }}
              className={
                activeIndex === i+1 
                ? "active"
                : ""
              }
              onClick={(e)=>
                scrollToSection(e,link.href)
              }
            >

              <span className="tid-dot">
                <span
                  className="tid-dot-fill"
                  style={{
                    height:
                    activeIndex >= i+1
                    ? "100%"
                    :"0%"
                  }}
                />
              </span>

              {link.label}

            </a>

          </li>

        ))}

      </ul>



      <div className="tid-nav-track"/>

      <div
        className="tid-nav-indicator"
        style={{
          width:`${progress}%`
        }}
      />


    </nav>
  );
}