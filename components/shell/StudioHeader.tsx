"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { LogOut, Plus } from "lucide-react";
import { useState, useTransition } from "react";
import { logoutAction } from "@/app/actions/auth";
import { Wordmark } from "@/components/brand/Brand";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { cn } from "@/lib/cn";

export function StudioHeader() {
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [pending, start] = useTransition();
  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 12));

  const isCatalogue = pathname === "/studio";

  return (
    <header className="sticky top-0 z-40">
      <div
        className={cn(
          "absolute inset-0 border-b transition-opacity duration-500",
          "glass !rounded-none !border-x-0 !border-t-0 !shadow-none",
          scrolled ? "opacity-100" : "opacity-0",
        )}
      />
      <div className="relative mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
        <Link href="/studio" className="rounded-lg" aria-label="Rangriti Studio — catalogue">
          <Wordmark />
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          <Link
            href="/studio"
            aria-current={isCatalogue ? "page" : undefined}
            className="draw-underline text-[0.78rem] font-semibold uppercase tracking-[0.18em] text-ink-soft transition-colors hover:text-ink aria-[current=page]:text-ink"
          >
            Catalogue
          </Link>
          <Link
            href="/studio/new"
            aria-current={pathname === "/studio/new" ? "page" : undefined}
            className="draw-underline text-[0.78rem] font-semibold uppercase tracking-[0.18em] text-ink-soft transition-colors hover:text-ink aria-[current=page]:text-ink"
          >
            New piece
          </Link>
          <Link
            href="/"
            className="draw-underline text-[0.78rem] font-semibold uppercase tracking-[0.18em] text-ink-soft transition-colors hover:text-ink"
          >
            View store
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <motion.button
            type="button"
            whileTap={{ scale: 0.94 }}
            onClick={() => start(() => logoutAction())}
            disabled={pending}
            className="group grid h-10 w-10 place-items-center rounded-full border border-line text-ink-soft transition-colors hover:text-accent sm:w-auto sm:gap-2 sm:px-4 sm:[grid-auto-flow:column]"
            aria-label="Sign out"
          >
            <LogOut size={16} strokeWidth={1.4} className="transition-transform duration-300 group-hover:translate-x-0.5" />
            <span className="hidden text-[0.72rem] font-semibold uppercase tracking-[0.16em] sm:inline">Sign out</span>
          </motion.button>
        </div>
      </div>

      <nav aria-label="Primary" className="relative mx-auto flex max-w-7xl gap-1 px-4 pb-2.5 sm:px-6 md:hidden">
        {[
          { href: "/studio", label: "Catalogue", active: isCatalogue },
          { href: "/studio/new", label: "New piece", active: pathname === "/studio/new", icon: true },
          { href: "/", label: "Store", active: false },
        ].map((l) => (
          <Link
            key={l.href}
            href={l.href}
            aria-current={l.active ? "page" : undefined}
            className={cn(
              "inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full text-[0.7rem] font-semibold uppercase tracking-[0.14em] transition-colors",
              l.active ? "bg-accent text-accent-ink" : "border border-line text-ink-soft",
            )}
          >
            {l.icon ? <Plus size={13} strokeWidth={1.8} /> : null}
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
