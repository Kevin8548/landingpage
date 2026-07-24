// src/pages/CareerDetail.tsx
import { useParams, Navigate } from "react-router-dom";
import { careerDetails } from "../data/careerDetails";

import DetailHero from "../components/sections/detailCareer/DetailHero";
import WhyChooseSection from "../components/sections/detailCareer/WhyChooseSection";
import StudyPlanSection from "../components/sections/detailCareer/StudyPlanSection";
import ProfileAndFieldSection from "../components/sections/detailCareer/ProfileAndFieldSection";
import StudentLifeSection from "../components/sections/detailCareer/StudentLifeSection";
import FinalCTA from "../components/sections/detailCareer/FinalCTA";

export default function CareerDetail() {
  const { careerId } = useParams<{ careerId: string }>();
  const career = careerId ? careerDetails[careerId] : undefined;
  

  if (!career) return <Navigate to="/" replace />;

  // Todas las TSU continúan con Ingeniería en TI (misma para las 3)
  const ingenieriaTI = careerDetails["ingenieria-ti"];
  const esTSU = career.id !== "ingenieria-ti";

  const cuatrimestresCompletos = esTSU
    ? [...career.cuatrimestres, ...ingenieriaTI.cuatrimestres]
    : career.cuatrimestres;

  return (
    <>
      <DetailHero
        career={{ nombre: career.nombre, quote: career.quote }}
        videoSrc={career.videoSrc ?? "/videos/redes.mp4"}
      />

      <WhyChooseSection stats={career.stats} />

      <StudyPlanSection
        cuatrimestres={cuatrimestresCompletos}
      />

      <ProfileAndFieldSection
        perfilIngreso={career.perfilIngreso}
        perfilEgreso={career.perfilEgreso}
        campoLaboral={career.campoLaboral}
      />

      <StudentLifeSection images={career.studentLife} />

      <FinalCTA />
    </>
  );
}