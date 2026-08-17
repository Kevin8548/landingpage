import AspirantesNavbar from "../components/layout/AspirantesNavbar";
import { HeroSection } from "../components/sections/aspirantes/HeroSection";
import { CareersStrip } from "../components/sections/aspirantes/CareersStrip";
import { KeyDatesSection } from "../components/sections/aspirantes/KeyDatesSection";
import { DirectPassSection } from "../components/sections/aspirantes/DirectPassSection";
import { FinalCTA } from "../components/sections/aspirantes/FinalCTA";
import { SectionDivider } from "../components/ui/SectionDivider";

export const Aspirantes = () => {
  return (
    <div className="bg-[var(--bg)] antialiased">
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .bg-noise {
          background-image: radial-gradient(rgba(247, 245, 238, 0.045) 1px, transparent 1px);
          background-size: 26px 26px;
        }
        .font-display {
          font-family: "Unbounded", sans-serif;
        }
        .font-data {
          font-family: "JetBrains Mono", monospace;
        }
      `}</style>

      <AspirantesNavbar />

      <section id="aspirantes-inicio">
        <HeroSection />
      </section>

      <section id="aspirantes-carreras">
        <CareersStrip />
      </section>

      <SectionDivider />
      <KeyDatesSection />

      <SectionDivider />
      <DirectPassSection />

      <SectionDivider />
      <section id="aspirantes-descarga">
        <FinalCTA />
      </section>
    </div>
  );
};

export default Aspirantes;