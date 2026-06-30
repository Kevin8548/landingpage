import React, { useState, useEffect } from 'react';
import { Briefcase, Trophy, Award, Menu, X, ArrowUpRight } from 'lucide-react';
import uttLogo from "../assets/uttLogo.png";

// Interfaz para personalizar los módulos fácilmente
interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

export const Navbar: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Módulos personalizados con sus respectivos íconos
  const navItems: NavItem[] = [
    { label: 'Carreras', href: '#carreras', icon: <Briefcase className="w-4 h-4" /> },
    { label: 'Hackathon', href: '#hackathon', icon: <Trophy className="w-4 h-4" /> },
    { label: 'Congreso', href: '#congreso', icon: <Award className="w-4 h-4" /> },
  ];

  // Controlar el comportamiento del scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Si escroleas hacia abajo, esconde el navbar principal. Si subes, muéstralo.
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <>
      {/* HEADER PRINCIPAL (Se esconde al hacer scroll hacia abajo) */}
      <header
        className={`fixed top-2 left-1/2 -translate-x-1/2 w-[92%] max-w-7xl z-50 transition-all duration-300 ease-in-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-24 pointer-events-none'
        }`}
      >
        <div className="bg-white/50 backdrop-blur-md border border-white/20 rounded-full px-6 py-3 flex items-center justify-between shadow-sm">
          
        {/* Logo / Marca */}
{/* Logo / Marca */}
<div className="flex items-center gap-3 font-bold text-xl">
  {/* El contenedor con el fondo institucional que ahora envuelve a tu logo en imagen */}
  <span className=" p-1.5 rounded-md flex items-center justify-center">
  </span>
  
  {/* El texto "UTT" con el degradado de naranja a verde */}
  <span className="text-3xl  bg-gradient-to-r from-[#ed7e52] via-[#A87C3C] to-[#3B6636] bg-clip-text text-transparent font-extrabold tracking-tight">
    UTT
  </span>
</div>

          {/* Menú de Navegación Escritorio */}
          <nav className="hidden md:flex items-center gap-2">
            {navItems.map((item, index) => (
              <a
                key={index}
                href={item.href}
                className="group relative flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#7a2f11] bg-orange-50/30 hover:bg-[#ffdac6]/60 rounded-full transition-all duration-200"
              >
                {item.icon}
                <span>{item.label}</span>
                {/* Animación de la línea inferior al hacer hover/click */}
                <span className="absolute bottom-1 left-4 right-4 h-[2px]  scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </a> 
            ))}
          </nav>

          {/* Botón de Acción (Estilo igual al de la imagen) */}
          <div className="hidden md:flex items-center gap-1">
            <button className="bg-[#e2f7bb] hover:bg-[#ffdac6] text-gray-900 font-semibold text-sm px-5 py-2.5 rounded-l-full transition-colors">
            Iniciar Sesión
            </button>
            <button className="bg-[#e2f7bb] hover:bg-[#ffdac6] text-black p-2.5 rounded-r-full transition-colors flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          {/* Botón Hamburguesa de respaldo en versión móvil cuando el Header es visible */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* BOTÓN FLOTANTE (Menú de 3 líneas que aparece SOLO cuando el header se esconde) */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className={`fixed bottom-6 right-6 z-50 bg-black text-white p-4 rounded-full shadow-lg transition-all duration-300 transform md:hidden ${
          !isVisible ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'
        }`}
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* MENÚ MÓVIL PANTALLA COMPLETA (RESPONSIVO) */}
      <div
        className={`fixed inset-0 z-50 bg-white/70 backdrop-blur-md md:hidden transition-all duration-300 flex flex-col justify-between p-6 ${
          isMobileMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'
        }`}
      >
        <div>
          {/* Header del menú móvil */}
          <div className="flex items-center justify-between pb-6 border-b border-gray-100">
            <div className="flex items-center gap-3 font-bold text-xl">
              <span className="p-1.5 rounded-md flex items-center justify-center">
                <img
  src={uttLogo}
  alt="Logo UTT"
  className="h-5 w-auto object-contain"
/>
              </span>
              <span className="bg-gradient-to-r from-[#ed7e52] via-[#A87C3C] to-[#3B6636] bg-clip-text text-transparent font-extrabold tracking-tight">
                UTT
              </span>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Links del menú móvil */}
          <nav className="flex flex-col gap-4 mt-8">
            {navItems.map((item, index) => (
              <a
                key={index}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="group relative flex items-center gap-3 py-3 px-3 text-lg font-semibold text-[#7a2f11] bg-orange-50/50 hover:bg-[#ffdac6]/80 rounded-full transition-all duration-200"
              >
                <span className="text-[#7a2f11] transition-colors">{item.icon}</span>
                <span>{item.label}</span>
                {/* Animación de la línea para móvil */}
                <span className="absolute bottom-1 left-4 right-4 h-[2px] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </a>
            ))}
          </nav>
        </div>

        {/* Botón CTA en Móvil */}
        <div className="flex w-full items-center gap-0.5">
          <button className="flex-1 bg-[#e2f7bb] hover:bg-[#ffdac6] text-gray-900 font-semibold text-center py-4 rounded-l-2xl transition-colors">
           Iniciar Sesión
          </button>
          <button className="bg-[#e2f7bb] hover:bg-[#ffdac6] text-black p-4 rounded-r-2xl flex items-center justify-center transition-colors">
            <ArrowUpRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </>
  );
};