"use client";

import Link from "next/link";
import { useMotionValueEvent, useScroll } from "motion/react";
import { LockKeyhole } from "lucide-react";
import { useState } from "react";
import { Wordmark } from "@/components/brand/Brand";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { cn } from "@/lib/cn";

export function StoreHeader() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 12));

  return (
    <header className="sticky top-0 z-40">
      <div
        className={cn(
          "glass absolute inset-0 !rounded-none !border-x-0 !border-t-0 !shadow-none transition-opacity duration-500",
          scrolled ? "opacity-100" : "opacity-0",
        )}
      />
      <div className="relative mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
        <Link href="/" className="rounded-lg" aria-label="Rangriti — home">
          <Wordmark />
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/login"
            className="group inline-flex h-10 items-center gap-2 rounded-full border border-line px-4 text-ink-soft transition-colors hover:border-accent/50 hover:text-accent"
          >
            <LockKeyhole size={14} strokeWidth={1.5} className="transition-transform duration-300 group-hover:-rotate-12" />
            <span className="text-[0.72rem] font-semibold uppercase tracking-[0.16em]">Admin</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
