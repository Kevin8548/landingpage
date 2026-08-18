import { motion } from "motion/react";
import { FiArrowRight, FiPlus, FiTrash2, FiUpload } from "react-icons/fi";
import paseDirectoImg from "../../../assets/A-2.jpeg";
import type { Institution } from "../../../data/aspirantes";

export type InstitutionTextField = "name" | "description";

interface DirectPassSectionProps {
  institutionItems: Institution[];
  editMode?: boolean;
  onUpdateField?: (id: string, field: InstitutionTextField, value: string) => void;
  onUpdateLogo?: (id: string, logo: string | undefined) => void;
  onAddInstitution?: () => void;
  onDeleteInstitution?: (id: string) => void;
}

export const DirectPassSection = ({
  institutionItems,
  editMode = false,
  onUpdateField,
  onUpdateLogo,
  onAddInstitution,
  onDeleteInstitution,
}: DirectPassSectionProps) => {
  return (
    <section id="pase-directo" className="relative py-28 px-6 bg-[var(--bg)]">
      <div className="pointer-events-none absolute inset-0 bg-noise opacity-25" />
      <div className="relative max-w-6xl mx-auto">
        <div className="max-w-xl mb-12">
          <span className="font-data text-xs font-medium uppercase tracking-[0.2em] text-[var(--green)]">
            Convenios institucionales
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-[var(--ink)] mt-2">
            Pase directo
          </h2>
          <p className="text-[var(--muted)] mt-3 leading-relaxed">
            Ingreso preferente para egresados de instituciones aliadas.
          </p>
        </div>

        <motion.div
          className="relative rounded-2xl overflow-hidden ring-1 ring-[var(--line)] shadow-2xl shadow-[var(--bg)]/60 mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.01 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
        >
          <img
            src={paseDirectoImg}
            alt="Plantel"
            className="w-full h-56 md:h-72 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)]/70 via-[var(--bg)]/10 to-transparent pointer-events-none" />
          <div className="absolute bottom-5 left-6 text-xs font-medium text-[var(--ink)]/80">
            Plantel principal
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {institutionItems.map(({ id, name, description, logo }, i) => (
            <motion.div
              key={id}
              className="group relative flex flex-col items-start gap-4 p-6 rounded-2xl border border-[var(--line)] bg-[var(--ink)]/[0.02] hover:bg-[var(--ink)]/[0.04] hover:border-[var(--green)]/20 transition-colors"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <span className="font-data absolute top-5 right-6 text-[11px] text-[var(--muted)] group-hover:text-[var(--green)]/60 transition-colors">
                0{i + 1}
              </span>

              {editMode && (
                <button
                  type="button"
                  onClick={() => onDeleteInstitution?.(id)}
                  aria-label="Eliminar institución"
                  className="absolute top-4 left-4 p-1.5 rounded-md text-[var(--muted)] hover:text-red-400 hover:bg-[var(--ink)]/5 transition-colors"
                >
                  <FiTrash2 className="w-3.5 h-3.5" />
                </button>
              )}

              {editMode ? (
                <div className="flex items-center gap-3 mt-6">
                  {logo ? (
                    <img
                      src={logo}
                      alt={name}
                      className="w-14 h-14 rounded-full object-contain border border-[var(--line)] bg-[var(--ink)]/5 p-2"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full border-2 border-dashed border-[var(--muted)]/40 flex items-center justify-center shrink-0">
                      <FiArrowRight className="w-5 h-5 text-[var(--green)]" />
                    </div>
                  )}
                  <div className="flex flex-col gap-1">
                    <label className="cursor-pointer inline-flex items-center gap-1 font-data text-[11px] text-[var(--green)] hover:underline">
                      <FiUpload className="w-3 h-3" />
                      {logo ? "Cambiar logo" : "Subir logo"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) onUpdateLogo?.(id, URL.createObjectURL(file));
                        }}
                      />
                    </label>
                    {logo && (
                      <button
                        type="button"
                        onClick={() => onUpdateLogo?.(id, undefined)}
                        className="font-data text-[11px] text-[var(--muted)] hover:text-red-400 text-left"
                      >
                        Quitar logo
                      </button>
                    )}
                  </div>
                </div>
              ) : logo ? (
                <motion.img
                  src={logo}
                  alt={name}
                  whileHover={{ scale: 1.1, rotate: -6 }}
                  transition={{ type: "spring", stiffness: 300, damping: 12 }}
                  className="w-14 h-14 rounded-full object-contain border border-[var(--line)] bg-[var(--ink)]/5 p-2"
                />
              ) : (
                <div className="w-14 h-14 rounded-full border-2 border-dashed border-[var(--muted)]/40 flex items-center justify-center">
                  <FiArrowRight className="w-5 h-5 text-[var(--green)]" />
                </div>
              )}

              <div className="w-full">
                {editMode ? (
                  <>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => onUpdateField?.(id, "name", e.target.value)}
                      placeholder="Nombre de la institución"
                      className="font-display text-xl font-semibold text-[var(--ink)] bg-transparent border-b border-dashed border-[var(--green)]/50 focus:outline-none focus:border-[var(--green)] w-full mb-2 pb-1"
                    />
                    <textarea
                      value={description}
                      onChange={(e) => onUpdateField?.(id, "description", e.target.value)}
                      placeholder="Descripción del convenio"
                      rows={3}
                      className="text-sm text-[var(--muted)] leading-relaxed w-full bg-transparent border border-dashed border-[var(--line)] rounded-lg p-2 focus:outline-none focus:border-[var(--green)]/50 resize-y"
                    />
                  </>
                ) : (
                  <>
                    <h3 className="font-display text-xl font-semibold text-[var(--ink)] mb-1.5 group-hover:text-[var(--green)] transition-colors">
                      {name}
                    </h3>
                    <p className="text-sm text-[var(--muted)] leading-relaxed">{description}</p>
                  </>
                )}
              </div>
            </motion.div>
          ))}

          {editMode && (
            <button
              type="button"
              onClick={() => onAddInstitution?.()}
              className="flex flex-col items-center justify-center gap-2 p-6 rounded-2xl border-2 border-dashed border-[var(--line)] text-[var(--muted)] hover:border-[var(--green)]/40 hover:text-[var(--green)] transition-colors min-h-[180px]"
            >
              <FiPlus className="w-6 h-6" />
              <span className="text-sm font-medium">Agregar institución</span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
};