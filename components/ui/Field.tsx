"use client";

import { AnimatePresence, motion, useAnimate } from "motion/react";
import { ChevronDown, PenLine, Sparkles } from "lucide-react";
import { useEffect, useId, useRef } from "react";
import { cn } from "@/lib/cn";

export type FieldSource = "llm" | "manual" | undefined;

type Common = {
  label: string;
  error?: string | null;
  hint?: string;
  source?: FieldSource;
  glow?: boolean;
  loading?: boolean;
  shakeKey?: number;
  className?: string;
};

export function SourceBadge({ source }: { source: FieldSource }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      {source ? (
        <motion.span
          key={source}
          initial={{ opacity: 0, y: -3 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 3 }}
          transition={{ duration: 0.25 }}
          title={source === "llm" ? "Filled by extraction" : "Edited by you"}
          className={cn(
            "pointer-events-none inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.16em]",
            source === "llm" ? "text-accent/80" : "text-ink-faint",
          )}
        >
          {source === "llm" ? <Sparkles size={10} strokeWidth={1.6} /> : <PenLine size={10} strokeWidth={1.6} />}
          {source === "llm" ? "Extracted" : "Edited"}
        </motion.span>
      ) : null}
    </AnimatePresence>
  );
}

export function FieldMessage({ id, error, hint }: { id: string; error?: string | null; hint?: string }) {
  return (
    <div className="min-h-[1.25rem] px-1 pt-1.5">
      <AnimatePresence mode="wait" initial={false}>
        {error ? (
          <motion.p
            key="e"
            id={id}
            role="alert"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.28 }}
            className="text-[0.75rem] font-medium text-accent"
          >
            {error}
          </motion.p>
        ) : hint ? (
          <motion.p key="h" id={id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[0.75rem] text-ink-faint">
            {hint}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function useShake(shakeKey: number | undefined, error: string | null | undefined) {
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (error && scope.current) animate(scope.current, { x: [0, -7, 6, -4, 2, 0] }, { duration: 0.42 });
  }, [shakeKey]);
  return scope;
}

function Shell({
  label,
  error,
  hint,
  source,
  glow,
  loading,
  shakeKey,
  className,
  floated,
  children,
  msgId,
}: Common & { floated?: boolean; children: React.ReactNode; msgId: string }) {
  const scope = useShake(shakeKey, error);
  return (
    <div className={className}>
      <div
        ref={scope}
        className="field"
        data-invalid={!!error || undefined}
        data-glow={glow || undefined}
        data-floated={floated || undefined}
      >
        {children}
        <div className="absolute right-2.5 top-2">
          <SourceBadge source={source} />
        </div>
        <AnimatePresence>
          {loading ? (
            <motion.div
              aria-hidden
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.4 } }}
              className="shimmer absolute inset-0 rounded-[13px]"
            />
          ) : null}
        </AnimatePresence>
        <span className="sr-only">{label}</span>
      </div>
      <FieldMessage id={msgId} error={error} hint={hint} />
    </div>
  );
}

export function TextField({
  value,
  onChange,
  type = "text",
  name,
  autoComplete,
  inputMode,
  trailing,
  leading,
  required,
  ...common
}: Common & {
  value: string;
  onChange: (v: string) => void;
  type?: string;
  name?: string;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  trailing?: React.ReactNode;
  leading?: string;
  required?: boolean;
}) {
  const id = useId();
  const msgId = `${id}-msg`;
  return (
    <Shell {...common} msgId={msgId} floated={!!leading}>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        required={required}
        autoComplete={autoComplete}
        inputMode={inputMode}
        placeholder=" "
        aria-invalid={!!common.error || undefined}
        aria-describedby={common.error || common.hint ? msgId : undefined}
        onChange={(e) => onChange(e.target.value)}
        className={cn("field-input peer", !!leading && "pl-10", !!trailing && "pr-12")}
      />
      <label htmlFor={id} className="field-label">
        {common.label}
      </label>
      {leading ? (
        <span aria-hidden className="pointer-events-none absolute bottom-[0.6rem] left-4 text-[0.95rem] text-ink-faint">
          {leading}
        </span>
      ) : null}
      {trailing ? <div className="absolute inset-y-0 right-2 flex items-center">{trailing}</div> : null}
    </Shell>
  );
}

export function TextArea({
  value,
  onChange,
  rows = 5,
  ...common
}: Common & { value: string; onChange: (v: string) => void; rows?: number }) {
  const id = useId();
  const msgId = `${id}-msg`;
  return (
    <Shell {...common} msgId={msgId}>
      <textarea
        id={id}
        rows={rows}
        value={value}
        placeholder=" "
        aria-invalid={!!common.error || undefined}
        aria-describedby={common.error || common.hint ? msgId : undefined}
        onChange={(e) => onChange(e.target.value)}
        className="field-input scroll-quiet min-h-28 resize-y !pt-7"
      />
      <label htmlFor={id} className="field-label">
        {common.label}
      </label>
    </Shell>
  );
}

export function SelectField<T extends string>({
  value,
  onChange,
  options,
  placeholder = "Select",
  ...common
}: Common & { value: T | ""; onChange: (v: T) => void; options: readonly T[]; placeholder?: string }) {
  const id = useId();
  const msgId = `${id}-msg`;
  return (
    <Shell {...common} msgId={msgId} floated>
      <select
        id={id}
        value={value}
        aria-invalid={!!common.error || undefined}
        aria-describedby={common.error || common.hint ? msgId : undefined}
        onChange={(e) => onChange(e.target.value as T)}
        className={cn("field-input cursor-pointer appearance-none pr-10", !value && "text-ink-faint")}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <label htmlFor={id} className="field-label">
        {common.label}
      </label>
      <ChevronDown
        aria-hidden
        size={16}
        strokeWidth={1.5}
        className="pointer-events-none absolute bottom-3.5 right-4 text-ink-faint"
      />
    </Shell>
  );
}

export function Toggle({
  label,
  description,
  checked,
  onChange,
  source,
  glow,
  loading,
  icon,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  source?: FieldSource;
  glow?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
}) {
  const id = useId();
  return (
    <div className="field flex items-center gap-4 px-4 py-3.5" data-glow={glow || undefined}>
      {icon ? <span className="text-brass">{icon}</span> : null}
      <label htmlFor={id} className="min-w-0 flex-1 cursor-pointer">
        <span className="flex items-center gap-2 text-sm font-medium text-ink">
          {label}
          <SourceBadge source={source} />
        </span>
        {description ? <span className="block text-[0.75rem] text-ink-faint">{description}</span> : null}
      </label>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full border transition-colors duration-300",
          checked ? "border-transparent bg-accent" : "border-line-strong bg-sunken",
        )}
      >
        <motion.span
          aria-hidden
          className="absolute left-0.5 top-0.5 h-[18px] w-[18px] rounded-full bg-raised shadow-soft"
          animate={{ x: checked ? 20 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 32 }}
        />
      </button>
      <AnimatePresence>
        {loading ? (
          <motion.div
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="shimmer absolute inset-0 rounded-[13px]"
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
