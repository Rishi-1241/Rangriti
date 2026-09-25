"use client";

import { animate, AnimatePresence, motion, useMotionValue } from "motion/react";
import { useEffect, useState } from "react";

const STAGES = ["Reading the note", "Identifying the garment", "Refining the copy", "Composing the fields"];

export type Phase = "idle" | "analysing" | "filling";

export function ExtractProgress({ phase }: { phase: Phase }) {
  const [stage, setStage] = useState(0);
  const progress = useMotionValue(0);

  useEffect(() => {
    if (phase === "analysing") {
      setStage(0);
      progress.set(0);
      const a = animate(progress, 0.92, { duration: 9, ease: [0.1, 0.7, 0.2, 1] });
      const t = setInterval(() => setStage((s) => Math.min(s + 1, STAGES.length - 2)), 1700);
      return () => {
        a.stop();
        clearInterval(t);
      };
    }
    if (phase === "filling") {
      setStage(STAGES.length - 1);
      const a = animate(progress, 1, { duration: 0.6, ease: "easeOut" });
      return () => a.stop();
    }
  }, [phase, progress]);

  return (
    <AnimatePresence>
      {phase !== "idle" ? (
        <motion.div
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6, transition: { delay: 0.3 } }}
          className="mt-5"
        >
          <div className="flex items-center justify-between">
            <div className="relative h-5 flex-1 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.p
                  key={stage}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35 }}
                  className="absolute font-display text-[1.05rem] italic text-ink"
                >
                  {STAGES[stage]}
                </motion.p>
              </AnimatePresence>
            </div>
            <div className="flex gap-1.5" aria-hidden>
              {STAGES.map((_, i) => (
                <motion.span
                  key={i}
                  className="h-1 w-1 rounded-full bg-accent"
                  animate={{ opacity: i <= stage ? 1 : 0.25, scale: i === stage ? 1.5 : 1 }}
                  transition={{ duration: 0.4 }}
                />
              ))}
            </div>
          </div>
          <div className="relative mt-3 h-px overflow-hidden bg-line">
            <motion.div style={{ scaleX: progress }} className="absolute inset-0 origin-left bg-gradient-to-r from-brass via-accent to-accent" />
            <span className="absolute inset-y-[-1px] left-0 w-1/4 bg-gradient-to-r from-transparent via-[rgb(255_240_225/0.9)] to-transparent [animation:gleam_1.8s_var(--ease-draw)_infinite]" />
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
