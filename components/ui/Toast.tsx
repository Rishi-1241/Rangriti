"use client";

import { AnimatePresence, motion } from "motion/react";
import { CircleAlert, CircleCheck, Info, X } from "lucide-react";
import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

type Tone = "success" | "error" | "info";
type Toast = { id: number; tone: Tone; title: string; description?: string };
type ToastApi = { push: (t: Omit<Toast, "id">) => void };

const Ctx = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const v = useContext(Ctx);
  if (!v) throw new Error("useToast must be used within ToastProvider");
  return v;
}

const icons = { success: CircleCheck, error: CircleAlert, info: Info };

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const seq = useRef(0);

  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const push = useCallback(
    (t: Omit<Toast, "id">) => {
      const id = ++seq.current;
      setToasts((list) => [...list.slice(-3), { ...t, id }]);
      setTimeout(() => dismiss(id), t.tone === "error" ? 6500 : 4200);
    },
    [dismiss],
  );

  const api = useMemo(() => ({ push }), [push]);

  return (
    <Ctx.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        className="pb-safe pointer-events-none fixed inset-x-0 bottom-0 z-[70] flex flex-col items-center gap-3 p-3 sm:inset-x-auto sm:right-0 sm:items-end sm:p-6"
      >
        <AnimatePresence initial={false}>
          {toasts.map((t) => {
            const Icon = icons[t.tone];
            return (
              <motion.div
                key={t.id}
                layout
                role={t.tone === "error" ? "alert" : "status"}
                initial={{ opacity: 0, x: 40, y: 12, scale: 0.96 }}
                animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40, scale: 0.96, transition: { duration: 0.25 } }}
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
                className="glass pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl px-4 py-3.5"
              >
                <span
                  className={
                    t.tone === "error"
                      ? "mt-0.5 text-accent"
                      : t.tone === "success"
                        ? "mt-0.5 text-brass"
                        : "mt-0.5 text-ink-soft"
                  }
                >
                  <Icon size={18} strokeWidth={1.5} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink">{t.title}</p>
                  {t.description ? <p className="mt-0.5 text-[0.8rem] leading-5 text-ink-soft">{t.description}</p> : null}
                </div>
                <button
                  onClick={() => dismiss(t.id)}
                  className="-m-1 rounded-full p-1 text-ink-faint transition-transform duration-300 hover:rotate-90 hover:text-ink"
                  aria-label="Dismiss"
                >
                  <X size={15} strokeWidth={1.5} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  );
}
