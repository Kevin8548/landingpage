import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiArrowRight,
  FiDownload,
  FiCheck,
  FiChevronRight,
  FiEdit3,
  FiTrash2,
  FiPlus,
  FiX,
  FiUpload,
} from "react-icons/fi";
import { CAREERS, heroImg, paseDirectoImg } from "../../data/aspirantes";
import { useAspirantesStore } from "../../data/aspirantesStore";
import { useConfirm } from "../ui/ConfirmDialog";
import PreviewMenu from "../ui/PreviewMenu";

const slideVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 30 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: -dir * 30 }),
};

const pad = (n: number) => String(n).padStart(2, "0");

const SectionDivider = () => (
  <div className="h-px w-full bg-gradient-to-r from-transparent via-[var(--line)] to-transparent" />
);

export default function AspirantesAdmin() {
  const confirm = useConfirm();

  const {
    heroTitle,
    heroSubtitle,
    dateItems,
    institutionItems,
    setHeroTitle,
    setHeroSubtitle,
    updateDateField,
    addDate: storeAddDate,
    deleteDate: storeDeleteDate,
    updateInstitutionField,
    updateInstitutionLogo,
    addInstitution: storeAddInstitution,
    deleteInstitution: storeDeleteInstitution,
  } = useAspirantesStore();

  const [editMode, setEditMode] = useState(false);

  const [activeDate, setActiveDate] = useState(0);
  const [direction, setDirection] = useState(1);
  const safeActiveDate = dateItems.length ? Math.min(activeDate, dateItems.length - 1) : 0;

  const goTo = (i: number) => {
    setDirection(i > activeDate ? 1 : -1);
    setActiveDate(i);
  };

  const handleAddDate = () => {
    setDirection(1);
    setActiveDate(dateItems.length);
    storeAddDate();
  };

  const handleDeleteDate = async (id: string) => {
    const ok = await confirm({
      title: "¿Eliminar esta fecha?",
      description: "Esta acción no se puede deshacer.",
      confirmLabel: "Eliminar",
      destructive: true,
    });
    if (!ok) return;
    storeDeleteDate(id);
  };

  useEffect(() => {
    if (dateItems.length > 0 && activeDate > dateItems.length - 1) {
      setActiveDate(dateItems.length - 1);
    }
  }, [dateItems.length, activeDate]);

  useEffect(() => {
    if (editMode || dateItems.length <= 1) return;
    const interval = setInterval(() => {
      setDirection(1);
      setActiveDate((i) => (i === dateItems.length - 1 ? 0 : i + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [activeDate, editMode, dateItems.length]);

  const handleAddInstitution = () => storeAddInstitution();

  const handleDeleteInstitution = async (id: string) => {
    const ok = await confirm({
      title: "¿Eliminar esta institución?",
      description: "Esta acción no se puede deshacer.",
      confirmLabel: "Eliminar",
      destructive: true,
    });
    if (!ok) return;
    storeDeleteInstitution(id);
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
        .font-display { font-family: "Unbounded", sans-serif; }
        .font-data { font-family: "JetBrains Mono", monospace; }
      `}</style>

      {editMode && (
        <div className="sticky top-0 z-40 bg-[var(--orange)] text-[var(--bg)] text-center text-[11px] font-data uppercase tracking-wider py-2 px-4">
          Modo edición activo — los cambios se guardan en este navegador
        </div>
      )}

      <div className="sticky top-0 z-30 flex items-center justify-end gap-2 px-6 py-3 bg-[var(--bg)]/80 backdrop-blur-sm border-b border-[var(--line)]">
        <PreviewMenu />
      </div>

      {/* ---------- Hero ---------- */}
      <section className="relative min-h-screen flex items-end lg:items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImg} alt="Universidad Tecnológica de Tlaxcala" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)]/65 to-[var(--bg)]/25" />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg)]/90 via-[var(--bg)]/45 to-transparent" />
          <div className="absolute inset-0 bg-noise opacity-20" />
        </div>

        <motion.div
          className="relative z-10 max-w-2xl px-6 md:px-16 py-24 lg:py-0"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="font-data text-[11px] font-medium uppercase tracking-[0.3em] text-[var(--muted)] mb-5"
          >
            Universidad Tecnológica de Tlaxcala
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full border border-[var(--green)]/25 bg-[var(--green)]/[0.08] backdrop-blur-sm"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--green)] animate-pulse" />
            <span className="font-data text-xs font-medium uppercase tracking-[0.15em] text-[var(--green)]">
              Admisión abierta
            </span>
          </motion.div>

          {editMode ? (
            <textarea
              value={heroTitle}
              onChange={(e) => setHeroTitle(e.target.value)}
              rows={3}
              placeholder="Título principal"
              className="font-display text-4xl md:text-6xl font-extrabold leading-[1.05] tracking-tight mb-7 text-[var(--ink)] bg-transparent border border-dashed border-[var(--orange)]/50 rounded-xl px-3 py-2 w-full resize-y focus:outline-none focus:border-[var(--orange)]"
            />
          ) : (
            <motion.h1
              className="font-display text-4xl md:text-6xl font-extrabold leading-[1.05] tracking-tight mb-7 text-[var(--ink)]"
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
            >
              {heroTitle.split(" ").map((word, i) => (
                <motion.span
                  key={i}
                  className="inline-block mr-[0.3ch]"
                  variants={{
                    hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
                    visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.5, ease: "easeOut" } },
                  }}
                >
                  {word}
                </motion.span>
              ))}
            </motion.h1>
          )}

          {editMode ? (
            <textarea
              value={heroSubtitle}
              onChange={(e) => setHeroSubtitle(e.target.value)}
              rows={2}
              placeholder="Subtítulo"
              className="text-[var(--ink)]/70 text-lg md:text-xl mb-10 max-w-lg leading-relaxed bg-transparent border border-dashed border-[var(--ink)]/30 rounded-xl px-3 py-2 w-full resize-y focus:outline-none focus:border-[var(--ink)]/60"
            />
          ) : (
            <p className="text-[var(--ink)]/70 text-lg md:text-xl mb-10 max-w-lg leading-relaxed">{heroSubtitle}</p>
          )}

          <p className="text-xs text-[var(--ink)]/40">Campus Universidad Tecnológica de Tlaxcala</p>
        </motion.div>
      </section>

      {/* ---------- Franja de ingenierías (no editable) ---------- */}
      <div className="relative bg-[var(--bg)] border-y border-[var(--line)]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[var(--line)]">
          {CAREERS.map(({ id, name, shortName, img, iconBg, border, bg, text, path }) => (
            <div key={id} className="flex flex-col items-center text-center gap-4 py-10 px-6 h-full">
              <div className={`shrink-0 w-36 aspect-[4/3] rounded-2xl flex items-center justify-center shadow-lg shadow-black/20 p-3 ${iconBg}`}>
                <img src={img} alt={name} className="w-full h-full object-contain" />
              </div>
              <div className="flex items-center justify-center min-h-[3.5rem] md:min-h-[3.25rem]">
                <span className="font-display text-sm md:text-base font-medium text-[var(--ink)] leading-snug max-w-[240px]">
                  {name}
                </span>
              </div>
              <button
                type="button"
                onClick={() => console.log("Ir a carrera (pendiente de conectar):", path)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full border text-xs font-data uppercase tracking-wider font-medium transition-opacity hover:opacity-80 ${border} ${bg} ${text}`}
              >
                {shortName}
                <FiChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* ---------- Fechas clave ---------- */}
      <section id="fechas" className="relative py-28 px-6 bg-[var(--bg)]">
        <div className="pointer-events-none absolute inset-0 bg-noise opacity-25" />
        <div className="relative max-w-6xl mx-auto">
          <div className="max-w-xl mb-14">
            <span className="font-data text-xs font-medium uppercase tracking-[0.2em] text-[var(--orange)]">
              Proceso de admisión
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-[var(--ink)] mt-3">Fechas clave</h2>
            <p className="text-[var(--muted)] mt-3 leading-relaxed">
              Sigue cada etapa del proceso, desde la convocatoria hasta tu inscripción.
            </p>
          </div>

          {dateItems.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-[var(--line)] p-12 text-center">
              <p className="text-[var(--muted)] mb-4">Todavía no hay fechas registradas.</p>
              {editMode && (
                <button
                  type="button"
                  onClick={handleAddDate}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--orange)] text-[var(--bg)] text-sm font-semibold"
                >
                  <FiPlus className="w-4 h-4" /> Agregar la primera fecha
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8">
              <div className="flex lg:flex-col gap-2 overflow-x-auto no-scrollbar pb-2 lg:pb-0 lg:overflow-visible">
                {dateItems.map((d, i) => (
                  <div
                    key={d.id}
                    className={`group flex items-center shrink-0 lg:w-full rounded-xl border transition-colors ${
                      i === safeActiveDate
                        ? "bg-[var(--ink)]/[0.06] border-[var(--orange)]/30"
                        : "border-transparent hover:bg-[var(--ink)]/[0.03]"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => goTo(i)}
                      aria-current={i === safeActiveDate}
                      className="flex items-center gap-3 flex-1 min-w-0 text-left px-4 py-3"
                    >
                      <span
                        className={`font-data flex items-center justify-center w-7 h-7 rounded-full text-[11px] font-medium shrink-0 transition-colors ${
                          i < safeActiveDate
                            ? "bg-[var(--orange)]/20 text-[var(--orange)]"
                            : i === safeActiveDate
                            ? "bg-[var(--orange)] text-[var(--bg)]"
                            : "bg-[var(--ink)]/5 text-[var(--muted)]"
                        }`}
                      >
                        {i < safeActiveDate ? <FiCheck className="w-3.5 h-3.5" /> : i + 1}
                      </span>
                      <span className="flex flex-col min-w-0">
                        <span
                          className={`text-sm truncate whitespace-nowrap lg:whitespace-normal ${
                            i === safeActiveDate ? "text-[var(--ink)] font-medium" : "text-[var(--muted)]"
                          }`}
                        >
                          {d.title}
                        </span>
                        <span
                          className={`font-data text-[10px] uppercase tracking-wide truncate ${
                            i === safeActiveDate ? "text-[var(--orange)]" : "text-[var(--muted)]/70"
                          }`}
                        >
                          {d.date}
                        </span>
                      </span>
                      <FiChevronRight
                        className={`hidden lg:block ml-auto w-4 h-4 shrink-0 transition-opacity ${
                          i === safeActiveDate ? "opacity-100 text-[var(--orange)]" : "opacity-0"
                        }`}
                      />
                    </button>

                    {editMode && (
                      <button
                        type="button"
                        onClick={() => handleDeleteDate(d.id)}
                        aria-label="Eliminar fecha"
                        className="shrink-0 p-2 mr-2 rounded-md text-[var(--muted)] hover:text-red-400 hover:bg-[var(--ink)]/5 transition-colors"
                      >
                        <FiTrash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}

                {editMode && (
                  <button
                    type="button"
                    onClick={handleAddDate}
                    className="flex items-center justify-center gap-2 shrink-0 lg:w-full px-4 py-3 rounded-xl border-2 border-dashed border-[var(--line)] text-[var(--muted)] hover:border-[var(--orange)]/40 hover:text-[var(--orange)] transition-colors text-sm font-medium"
                  >
                    <FiPlus className="w-4 h-4" /> Agregar fecha
                  </button>
                )}
              </div>

              <div className="relative rounded-2xl border border-[var(--line)] bg-[var(--glass)] backdrop-blur-sm p-8 md:p-12 overflow-hidden min-h-[22rem] flex flex-col justify-center">
                <span className="font-display pointer-events-none select-none absolute -right-4 -top-8 text-[8rem] md:text-[11rem] font-bold leading-none text-[var(--ink)]/[0.035]">
                  {pad(safeActiveDate + 1)}
                </span>

                <AnimatePresence initial={false} mode="wait" custom={direction}>
                  <motion.div
                    key={dateItems[safeActiveDate].id}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="relative"
                  >
                    <span className="font-data text-[var(--orange)] text-xs font-medium uppercase tracking-wider">
                      Paso {safeActiveDate + 1} de {dateItems.length}
                    </span>

                    {editMode ? (
                      <div className="mt-3 space-y-3">
                        <input
                          type="text"
                          value={dateItems[safeActiveDate].date}
                          onChange={(e) => updateDateField(dateItems[safeActiveDate].id, "date", e.target.value)}
                          placeholder="Fecha de la etapa (ej. 15 de agosto de 2026)"
                          className="font-data text-xl md:text-2xl font-bold text-[var(--orange)] bg-transparent border-b border-dashed border-[var(--orange)]/50 focus:outline-none focus:border-[var(--orange)] w-full max-w-lg pb-1"
                        />
                        <input
                          type="text"
                          value={dateItems[safeActiveDate].title}
                          onChange={(e) => updateDateField(dateItems[safeActiveDate].id, "title", e.target.value)}
                          placeholder="Título de la etapa"
                          className="font-display text-2xl md:text-4xl font-semibold text-[var(--ink)] bg-transparent border-b border-dashed border-[var(--orange)]/50 focus:outline-none focus:border-[var(--orange)] w-full max-w-lg pb-1"
                        />
                        <textarea
                          value={dateItems[safeActiveDate].description}
                          onChange={(e) => updateDateField(dateItems[safeActiveDate].id, "description", e.target.value)}
                          placeholder="Descripción de la etapa"
                          rows={3}
                          className="text-[var(--muted)] leading-relaxed max-w-xl w-full bg-transparent border border-dashed border-[var(--line)] rounded-lg p-3 focus:outline-none focus:border-[var(--orange)]/50 resize-y"
                        />
                      </div>
                    ) : (
                      <>
                        <div className="mt-3 mb-1">
                          <span className="font-data text-2xl md:text-3xl font-bold text-[var(--orange)] tracking-tight">
                            {dateItems[safeActiveDate].date}
                          </span>
                        </div>
                        <h3 className="font-display text-2xl md:text-4xl font-semibold text-[var(--ink)] mt-1 mb-4 max-w-lg">
                          {dateItems[safeActiveDate].title}
                        </h3>
                        <p className="text-[var(--muted)] leading-relaxed max-w-xl">
                          {dateItems[safeActiveDate].description}
                        </p>
                      </>
                    )}
                  </motion.div>
                </AnimatePresence>

                <div className="relative mt-10 h-1 w-full max-w-md bg-[var(--ink)]/5 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-[var(--orange)] rounded-full"
                    animate={{ width: `${((safeActiveDate + 1) / dateItems.length) * 100}%` }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <SectionDivider />

      {/* ---------- Pase directo ---------- */}
      <section id="pase-directo" className="relative py-28 px-6 bg-[var(--bg)]">
        <div className="pointer-events-none absolute inset-0 bg-noise opacity-25" />
        <div className="relative max-w-6xl mx-auto">
          <div className="max-w-xl mb-12">
            <span className="font-data text-xs font-medium uppercase tracking-[0.2em] text-[var(--green)]">
              Convenios institucionales
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-[var(--ink)] mt-2">Pase directo</h2>
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
            <img src={paseDirectoImg} alt="Plantel" className="w-full h-56 md:h-72 object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)]/70 via-[var(--bg)]/10 to-transparent pointer-events-none" />
            <div className="absolute bottom-5 left-6 text-xs font-medium text-[var(--ink)]/80">Plantel principal</div>
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
                    onClick={() => handleDeleteInstitution(id)}
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
                            if (file) updateInstitutionLogo(id, URL.createObjectURL(file));
                          }}
                        />
                      </label>
                      {logo && (
                        <button
                          type="button"
                          onClick={() => updateInstitutionLogo(id, undefined)}
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
                        onChange={(e) => updateInstitutionField(id, "name", e.target.value)}
                        placeholder="Nombre de la institución"
                        className="font-display text-xl font-semibold text-[var(--ink)] bg-transparent border-b border-dashed border-[var(--green)]/50 focus:outline-none focus:border-[var(--green)] w-full mb-2 pb-1"
                      />
                      <textarea
                        value={description}
                        onChange={(e) => updateInstitutionField(id, "description", e.target.value)}
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
                onClick={handleAddInstitution}
                className="flex flex-col items-center justify-center gap-2 p-6 rounded-2xl border-2 border-dashed border-[var(--line)] text-[var(--muted)] hover:border-[var(--green)]/40 hover:text-[var(--green)] transition-colors min-h-[180px]"
              >
                <FiPlus className="w-6 h-6" />
                <span className="text-sm font-medium">Agregar institución</span>
              </button>
            )}
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ---------- CTA final ---------- */}
      <section className="relative py-20 px-6 overflow-hidden bg-[var(--bg)]">
        <div className="pointer-events-none absolute inset-0 bg-noise opacity-10" />
        <div className="relative max-w-5xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-8 text-center md:text-left">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-[var(--ink)] mb-3">
              ¿Listo para dar el siguiente paso?
            </h2>
            <p className="text-[var(--ink)]/70 max-w-md mx-auto md:mx-0">
              Inicia tu proceso de admisión y asegura tu lugar para el ciclo 2026.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 shrink-0">
            <motion.button
              type="button"
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className="flex items-center gap-2 px-7 py-3.5 rounded-full bg-[var(--ink)] text-[var(--bg)] text-sm font-semibold shadow-lg shadow-black/20"
            >
              Ver oferta educativa
              <FiArrowRight className="w-4 h-4" />
            </motion.button>

            <motion.button
              type="button"
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className="flex items-center gap-2 px-7 py-3.5 rounded-full border border-[var(--ink)]/40 text-[var(--ink)] text-sm font-medium hover:bg-[var(--ink)]/10 transition-colors"
            >
              <FiDownload className="w-4 h-4" />
              Descargar información
            </motion.button>
          </div>
        </div>
      </section>

      <div className="sticky bottom-6 z-50 flex justify-end px-6 pointer-events-none">
        <button
          type="button"
          onClick={() => setEditMode((v) => !v)}
          className={`pointer-events-auto flex items-center gap-2 px-5 py-3 rounded-full font-data text-xs uppercase tracking-wider font-medium shadow-lg transition-colors ${
            editMode ? "bg-[var(--orange)] text-[var(--bg)]" : "bg-[var(--ink)] text-[var(--bg)] hover:bg-[var(--green)]"
          }`}
        >
          {editMode ? <FiX className="w-4 h-4" /> : <FiEdit3 className="w-4 h-4" />}
          {editMode ? "Salir de edición" : "Editar página"}
        </button>
      </div>
    </div>
  );
}