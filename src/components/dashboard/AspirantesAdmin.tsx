import { useState } from "react";
import { FiEdit3, FiX } from "react-icons/fi";
import { HeroSection } from "../sections/aspirantes/HeroSection";
import { CareersStrip } from "../sections/aspirantes/CareersStrip";
import { KeyDatesSection } from "../sections/aspirantes/KeyDatesSection";
import { DirectPassSection } from "../sections/aspirantes/DirectPassSection";
import { FinalCTA } from "../sections/aspirantes/FinalCTA";
import { SectionDivider } from "../ui/SectionDivider";
import { useAspirantesStore } from "../../data/aspirantesStore";
import { useConfirm } from "../ui/useConfirm";

// Vista de administración de Aspirantes. Solo se llega aquí a través de la
// ruta protegida /dashboard/aspirantes (ver App.tsx, envuelta en
// RequireAdmin). No hace falta volver a validar admin dentro de este
// componente: si alguien llegó hasta aquí, RequireAdmin ya lo dejó pasar.
export default function AspirantesAdmin() {
  const confirm = useConfirm();
  const [editMode, setEditMode] = useState(false);

  const {
    heroTitle,
    heroSubtitle,
    dateItems,
    institutionItems,
    setHeroTitle,
    setHeroSubtitle,
    saveHero,
    updateDateField,
    saveDate,
    addDate,
    deleteDate,
    updateInstitutionField,
    saveInstitution,
    updateInstitutionLogo,
    saveInstitutionLogo,
    addInstitution,
    deleteInstitution,
  } = useAspirantesStore();

  const handleDeleteDate = async (id: string) => {
    const ok = await confirm({
      title: "¿Eliminar esta fecha?",
      description: "Esta acción no se puede deshacer.",
      confirmLabel: "Eliminar",
      destructive: true,
    });
    if (!ok) return;
    deleteDate(id);
  };

  const handleDeleteInstitution = async (id: string) => {
    const ok = await confirm({
      title: "¿Eliminar esta institución?",
      description: "Esta acción no se puede deshacer.",
      confirmLabel: "Eliminar",
      destructive: true,
    });
    if (!ok) return;
    deleteInstitution(id);
  };

  const handleAddDate = async () => {
    try {
      await addDate();
    } catch (err) {
      console.error("No se pudo crear la fecha:", err);
    }
  };

  const handleAddInstitution = async () => {
    try {
      await addInstitution();
    } catch (err) {
      console.error("No se pudo crear la institución:", err);
    }
  };

  const fileToDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleInstitutionImageUpload = async (id: string, file: File) => {
    const dataUrl = await fileToDataUrl(file);
    updateInstitutionLogo(id, dataUrl); // preview inmediato mientras sube
    await saveInstitutionLogo(id, dataUrl);
  };

  const handleInstitutionImageRemove = async (id: string) => {
    updateInstitutionLogo(id, undefined);
    await saveInstitutionLogo(id, undefined, true);
  };

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

      {editMode && (
        <div className="sticky top-0 z-40 bg-[var(--orange)] text-[var(--bg)] text-center text-[11px] font-data uppercase tracking-wider py-2 px-4">
          Modo edición activo — los cambios se guardan directo en la base de datos
        </div>
      )}

      <section id="aspirantes-inicio">
        <HeroSection
          title={heroTitle}
          subtitle={heroSubtitle}
          editMode={editMode}
          onTitleChange={setHeroTitle}
          onSubtitleChange={setHeroSubtitle}
          onSaveHero={saveHero}
        />
      </section>

      <section id="aspirantes-carreras">
        <CareersStrip />
      </section>

      <SectionDivider />
      <KeyDatesSection
        dateItems={dateItems}
        editMode={editMode}
        onUpdateField={updateDateField}
        onSaveDate={saveDate}
        onAddDate={handleAddDate}
        onDeleteDate={handleDeleteDate}
      />

      <SectionDivider />
      <DirectPassSection
        institutionItems={institutionItems}
        editMode={editMode}
        onUpdateField={updateInstitutionField}
        onSaveField={saveInstitution}
        onImageUpload={handleInstitutionImageUpload}
        onImageRemove={handleInstitutionImageRemove}
        onAddInstitution={handleAddInstitution}
        onDeleteInstitution={handleDeleteInstitution}
      />

      <SectionDivider />
      <section id="aspirantes-descarga">
        <FinalCTA />
      </section>

      <div className="sticky bottom-6 z-50 flex justify-end px-6 pointer-events-none">
        <button
          type="button"
          onClick={() => setEditMode((v) => !v)}
          className={`pointer-events-auto flex items-center gap-2 px-5 py-3 rounded-full font-data text-xs uppercase tracking-wider font-medium shadow-lg transition-colors ${
            editMode
              ? "bg-[var(--orange)] text-[var(--bg)]"
              : "bg-[var(--ink)] text-[var(--bg)] hover:bg-[var(--green)]"
          }`}
        >
          {editMode ? <FiX className="w-4 h-4" /> : <FiEdit3 className="w-4 h-4" />}
          {editMode ? "Salir de edición" : "Editar página"}
        </button>
      </div>
    </div>
  );
}
