import {
  useCallback,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiAlertTriangle } from "react-icons/fi";
import { ConfirmContext, type ConfirmFn, type ConfirmOptions } from "./confirmContext";

interface ConfirmState extends ConfirmOptions {
  resolve: (value: boolean) => void;
}

/**
 * Envuelve tu app (idealmente en main.tsx / App.tsx) UNA sola vez:
 *
 *   <ConfirmProvider>
 *     <App />
 *   </ConfirmProvider>
 *
 * y luego, en cualquier componente hijo:
 *
 *   const confirm = useConfirm();
 *   const ok = await confirm({ title: "¿Eliminar?", destructive: true });
 */
export const ConfirmProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<ConfirmState | null>(null);

  const confirm = useCallback<ConfirmFn>((options = {}) => {
    return new Promise<boolean>((resolve) => {
      setState({ ...options, resolve });
    });
  }, []);

  const settle = (result: boolean) => {
    state?.resolve(result);
    setState(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}

      <AnimatePresence>
        {state && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--bg)]/70 backdrop-blur-sm px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => settle(false)}
          >
            <motion.div
              role="alertdialog"
              aria-modal="true"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-full max-w-sm rounded-2xl border border-[var(--line)] bg-[var(--glass)] backdrop-blur-md p-6 shadow-2xl shadow-black/40"
            >
              <div className="flex items-start gap-3">
                <span
                  className={`flex items-center justify-center w-9 h-9 rounded-full shrink-0 ${
                    state.destructive
                      ? "bg-[var(--orange)]/15 text-[var(--orange)]"
                      : "bg-[var(--green)]/15 text-[var(--green)]"
                  }`}
                >
                  <FiAlertTriangle className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-display text-lg font-semibold text-[var(--ink)]">
                    {state.title ?? "¿Estás seguro?"}
                  </h3>
                  {state.description && (
                    <p className="text-sm text-[var(--muted)] mt-1 leading-relaxed">
                      {state.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => settle(false)}
                  className="px-4 py-2 rounded-full text-sm font-medium text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--ink)]/5 transition-colors"
                >
                  {state.cancelLabel ?? "Cancelar"}
                </button>
                <button
                  type="button"
                  onClick={() => settle(true)}
                  className={`px-5 py-2 rounded-full text-sm font-semibold text-[var(--bg)] transition-colors ${
                    state.destructive
                      ? "bg-[var(--orange)] hover:brightness-110"
                      : "bg-[var(--green)] hover:brightness-110"
                  }`}
                >
                  {state.confirmLabel ?? "Confirmar"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ConfirmContext.Provider>
  );
};
