"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Monogram } from "@/components/brand/Brand";
import { cn } from "@/lib/cn";

export function ProductGallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);

  if (!images.length) {
    return (
      <div className="grid aspect-[4/5] place-items-center rounded-[28px] border border-line bg-sunken">
        <Monogram size={96} className="opacity-50" />
      </div>
    );
  }

  return (
    <div className="flex flex-col-reverse gap-4 sm:flex-row">
      {images.length > 1 ? (
        <ul className="scroll-quiet -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:max-h-[42rem] sm:flex-col sm:gap-3 sm:overflow-y-auto sm:px-0" aria-label="Images">
          {images.map((src, i) => (
            <li key={src} className="shrink-0">
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Show image ${i + 1}`}
                aria-current={i === active}
                className={cn(
                  "relative block h-20 w-16 overflow-hidden rounded-xl border sm:h-24 sm:w-20 transition-[transform,opacity] duration-300 hover:-translate-y-0.5",
                  i === active ? "border-accent opacity-100" : "border-line opacity-60 hover:opacity-100",
                )}
              >
                <Image src={src} alt="" fill sizes="80px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <div className="group relative aspect-[4/5] flex-1 overflow-hidden rounded-[20px] border sm:rounded-[28px] border-line bg-sunken shadow-float">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={images[active]}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0"
          >
            <Image
              src={images[active]}
              alt={title}
              fill
              priority
              sizes="(min-width: 1024px) 55vw, 100vw"
              className="object-cover transition-transform duration-[1800ms] ease-[var(--ease-silk)] group-hover:scale-[1.05]"
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
