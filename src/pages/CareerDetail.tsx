// src/pages/CareerDetail.tsx
import { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { loadCareerDetail, type CareerDetail as CareerDetailData } from "../data/careerDetails";
import { careers, type Career } from "../data/careers";

import DetailHero from "../components/sections/detailCareer/DetailHero";
import WhyChooseSection from "../components/sections/detailCareer/WhyChooseSection";
import StudyPlanSection from "../components/sections/detailCareer/StudyPlanSection";
import ProfileAndFieldSection from "../components/sections/detailCareer/ProfileAndFieldSection";
import StudentLifeSection from "../components/sections/detailCareer/StudentLifeSection";
import FinalCTA from "../components/sections/detailCareer/FinalCTA";

type FullCareer = Career & Omit<CareerDetailData, "imageBack" | "imageFront">;

export default function CareerDetail() {
  const { careerId } = useParams<{ careerId: string }>();
  const [detail, setDetail] = useState<{
    careerId: string;
    career: FullCareer | undefined;
    ingenieriaTI: FullCareer | undefined;
  }>();

  useEffect(() => {
    let cancelled = false;

    if (!careerId) return undefined;

    const isTSU = careerId !== "ingenieria-ti";
    const details = isTSU
      ? Promise.all([loadCareerDetail(careerId), loadCareerDetail("ingenieria-ti")])
      : Promise.all([loadCareerDetail(careerId), Promise.resolve(undefined)]);

    void details.then(([nextCareerDetail, nextIngenieriaTIDetail]) => {
      if (cancelled) return;

      const baseCareer = careers.find((c) => c.slug === careerId);
      const baseIngenieriaTI = careers.find((c) => c.slug === "ingenieria-ti");

      const mergeCareer = (
        base: Career | undefined,
        d: CareerDetailData | undefined
      ): FullCareer | undefined => {
        if (!base || !d) return undefined;
        const { imageBack: _ignoredBack, imageFront: _ignoredFront, ...rest } = d;
        return { ...base, ...rest };
      };

      setDetail({
        careerId,
        career: mergeCareer(baseCareer, nextCareerDetail),
        ingenieriaTI: mergeCareer(baseIngenieriaTI, nextIngenieriaTIDetail),
      });
    });

    return () => {
      cancelled = true;
    };
  }, [careerId]);

  if (!careerId) return <Navigate to="/" replace />;

  if (!detail || detail.careerId !== careerId) {
    return <main className="min-h-dvh bg-dark-bg" aria-busy="true" />;
  }

  const { career, ingenieriaTI } = detail;

  if (!career) return <Navigate to="/" replace />;

  const esTSU = career.slug !== "ingenieria-ti";

  const cuatrimestresCompletos =
    esTSU && ingenieriaTI
      ? [...career.cuatrimestres, ...ingenieriaTI.cuatrimestres]
      : career.cuatrimestres;
  const studyPlanImagesCompletas =
    esTSU && ingenieriaTI
      ? [...career.studyPlanImages, ...ingenieriaTI.studyPlanImages]
      : career.studyPlanImages;

  return (
    <>
      <DetailHero career={career} videoSrc={career.videoSrc ?? "/videos/redes.mp4"} />

      <WhyChooseSection stats={career.stats} />

      <StudyPlanSection
        cuatrimestres={cuatrimestresCompletos}
        studyPlanImages={studyPlanImagesCompletas}
      />

      <ProfileAndFieldSection
        title={career.title}
        icon={career.icon}
        titleImage={career.perfilImages?.[2]}
        perfilIngreso={career.perfilIngreso}
        perfilEgreso={career.perfilEgreso}
        perfilImages={career.perfilImages}
        campoLaboral={career.campoLaboral}
      />

      <StudentLifeSection images={career.studentLife} />

      <FinalCTA />
    </>
  );
}