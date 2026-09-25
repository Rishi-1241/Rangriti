"use client";

import { motion, useMotionValue, useReducedMotion, useSpring, useTransform, type MotionValue } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import { loginAction, type LoginState } from "@/app/actions/auth";
import { ArchMotif, Monogram } from "@/components/brand/Brand";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const initial: LoginState = { error: null, attempt: 0 };

function useDepth(mx: MotionValue<number>, my: MotionValue<number>, depth: number) {
  const x = useTransform(mx, (v) => v * depth);
  const y = useTransform(my, (v) => v * depth);
  return { x, y };
}

export function LoginExperience({ next }: { next: string }) {
  const [state, action, pending] = useActionState(loginAction, initial);
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [reveal, setReveal] = useState(false);
  const [failPrompt, setFailPrompt] = useState(false);
  const router = useRouter();
  const reduce = useReducedMotion();

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const mx = useSpring(rawX, { stiffness: 60, damping: 20 });
  const my = useSpring(rawY, { stiffness: 60, damping: 20 });
  const far = useDepth(mx, my, -10);
  const mid = useDepth(mx, my, -22);
  const near = useDepth(mx, my, 14);

  useEffect(() => {
    if (!state.error) return;
    setPassword("");
    setFailPrompt(true);
  }, [state.attempt, state.error]);

  const onMove = (e: React.PointerEvent) => {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    rawX.set((e.clientX - r.left) / r.width - 0.5);
    rawY.set((e.clientY - r.top) / r.height - 0.5);
  };

  return (
    <main className="relative grid min-h-dvh lg:grid-cols-[1.1fr_1fr]" onPointerMove={onMove}>
      {/* Hero */}
      <section
        aria-hidden
        className="relative isolate hidden overflow-hidden border-r border-line lg:block"
        style={{ perspective: 1200 }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(90%_70%_at_30%_20%,rgb(212_191_159/0.55),transparent_70%),linear-gradient(160deg,var(--color-bone-200),var(--color-sand-400)_120%)] dark:bg-[radial-gradient(90%_70%_at_30%_20%,rgb(134_58_55/0.35),transparent_70%),linear-gradient(160deg,var(--color-espresso-800),var(--color-espresso-950))]" />
        <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_80%_90%,rgb(134_58_55/0.22),transparent_70%)]" />

        <motion.div style={far} className="absolute inset-[-4%] opacity-70">
          <ArchMotif className="h-full w-full" />
        </motion.div>

        <motion.p
          style={mid}
          className="pointer-events-none absolute -bottom-10 -left-6 select-none font-display text-[15rem] italic leading-none text-accent/[0.07] dark:text-accent/[0.09]"
        >
          Rangriti
        </motion.p>

        <motion.div style={near} className="relative z-10 flex h-full flex-col justify-between p-14 xl:p-20">
          <div className="flex items-center gap-3">
            <Monogram size={44} />
            <span className="eyebrow">Private Atelier</span>
          </div>
          <div className="max-w-lg">
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.9 }}
              className="eyebrow mb-6 !text-accent"
            >
              Rangriti Studio
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 1 }}
              className="text-6xl text-ink xl:text-7xl"
            >
              Every piece,
              <br />
              <em className="font-normal text-accent">considered.</em>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 1 }}
              className="mt-6 max-w-sm text-[0.95rem] leading-7 text-ink-soft"
            >
              The cataloguing room for sarees, suits and lehengas — where raw notes become a composed
              collection.
            </motion.p>
          </div>
          <div className="flex items-center gap-4 text-ink-faint">
            <span className="hairline w-16" />
            <span className="text-xs tracking-[0.2em]">WOMEN&apos;S ETHNIC WEAR</span>
          </div>
        </motion.div>
      </section>

      {/* Form */}
      <section className="relative flex flex-col px-5 py-6 sm:px-10">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="group inline-flex items-center gap-2.5 rounded-full py-1 pr-3 text-ink-soft transition-colors hover:text-ink"
          >
            <ArrowLeft size={15} strokeWidth={1.5} className="transition-transform duration-300 group-hover:-translate-x-1" />
            <Monogram size={28} className="lg:hidden" />
            <span className="draw-underline text-[0.72rem] font-semibold uppercase tracking-[0.18em]">Back to store</span>
          </Link>
          <ThemeToggle />
        </div>

        <div className="flex flex-1 items-center justify-center py-10">
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-[26rem]"
          >
            <motion.div
              key={state.attempt}
              animate={state.error ? { x: [0, -9, 8, -5, 3, 0] } : undefined}
              transition={{ duration: 0.45 }}
              className="glass relative overflow-hidden rounded-[28px] p-8 sm:p-10"
            >
              <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brass/60 to-transparent" />
              <div aria-hidden className="absolute -right-24 -top-24 h-56 w-56 rounded-full bg-accent/10 blur-3xl" />

              <p className="eyebrow flex items-center gap-2">
                <LockKeyhole size={12} strokeWidth={1.6} /> Studio access
              </p>
              <h2 className="mt-4 text-[2.6rem] text-ink">Welcome back</h2>
              <p className="mt-2 text-sm leading-6 text-ink-soft">Sign in to continue to the catalogue.</p>

              <form action={action} className="mt-8" noValidate>
                <input type="hidden" name="next" value={next} />
                <TextField
                  label="Studio ID"
                  name="id"
                  autoComplete="username"
                  value={id}
                  onChange={setId}
                  required
                />
                <TextField
                  label="Password"
                  name="password"
                  type={reveal ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={setPassword}
                  required
                  error={state.error}
                  trailing={
                    <button
                      type="button"
                      onClick={() => setReveal((r) => !r)}
                      aria-label={reveal ? "Hide password" : "Show password"}
                      aria-pressed={reveal}
                      className="grid h-9 w-9 place-items-center rounded-full text-ink-faint transition-colors hover:text-accent"
                    >
                      {reveal ? <EyeOff size={17} strokeWidth={1.4} /> : <Eye size={17} strokeWidth={1.4} />}
                    </button>
                  }
                />
                <Button type="submit" size="lg" className="mt-3 w-full" loading={pending} disabled={!id || !password}>
                  {pending ? "Signing in" : "Enter the studio"}
                  <ArrowRight size={16} strokeWidth={1.5} className="transition-transform duration-500 group-hover:translate-x-1" />
                </Button>
              </form>
            </motion.div>
            <p className="mt-6 text-center text-xs tracking-wide text-ink-faint">
              Restricted to the Rangriti team.{" "}
              <Link href="/" className="draw-underline text-ink-soft hover:text-ink">
                Browse the collection
              </Link>
            </p>
          </motion.div>
        </div>
      </section>

      <Modal
        open={failPrompt}
        onClose={() => setFailPrompt(false)}
        title="Access not granted"
        description={
          <>
            {state.error} The studio is reserved for the Rangriti team. Would you like to return to the store?
          </>
        }
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setFailPrompt(false);
                setTimeout(() => document.querySelector<HTMLInputElement>('input[name="password"]')?.focus(), 60);
              }}
            >
              Try again
            </Button>
            <Button data-autofocus onClick={() => router.push("/")}>
              <ArrowLeft size={15} strokeWidth={1.5} />
              Return to store
            </Button>
          </>
        }
      />
    </main>
  );
}
