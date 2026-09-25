"use client";

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { horizontalListSortingStrategy, SortableContext, sortableKeyboardCoordinates, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AnimatePresence, motion } from "motion/react";
import { Plus, X } from "lucide-react";
import { useId, useRef, useState } from "react";
import { mergeUnique, moveItem, splitTokens } from "@/lib/chips";
import { cn } from "@/lib/cn";
import { FieldMessage, SourceBadge, type FieldSource } from "./Field";

const HOLD_SPACE = /^(free|one)$/i;

export function ChipInput({
  label,
  value,
  onChange,
  normalize = (s) => s,
  presets,
  max = 24,
  placeholder = "Type and press space, comma or enter",
  hint,
  error,
  source,
  glow,
  loading,
}: {
  label: string;
  value: string[];
  onChange: (next: string[]) => void;
  normalize?: (s: string) => string;
  presets?: { label: string; sizes: string[] }[];
  max?: number;
  placeholder?: string;
  hint?: string;
  error?: string | null;
  source?: FieldSource;
  glow?: boolean;
  loading?: boolean;
}) {
  const id = useId();
  const [draft, setDraft] = useState("");
  const [armed, setArmed] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const commit = (text: string) => {
    const tokens = splitTokens(text).map(normalize);
    if (!tokens.length) return;
    const next = mergeUnique(value, tokens, max);
    if (next.length === value.length) {
      const dup = value.find((v) => v.toLowerCase() === tokens[0].toLowerCase());
      if (dup) {
        setFlash(dup);
        setTimeout(() => setFlash(null), 600);
      }
    } else onChange(next);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit(draft);
      setDraft("");
    } else if (e.key === " ") {
      if (HOLD_SPACE.test(draft.trim())) return;
      e.preventDefault();
      commit(draft);
      setDraft("");
    } else if (e.key === "Backspace" && !draft && value.length) {
      if (armed) {
        onChange(value.slice(0, -1));
        setArmed(false);
      } else setArmed(true);
    } else setArmed(false);
  };

  const onPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text");
    if (/[\s,;|/]/.test(text)) {
      e.preventDefault();
      commit(draft + text);
      setDraft("");
    }
  };

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    onChange(moveItem(value, value.indexOf(String(active.id)), value.indexOf(String(over.id))));
  };

  const remove = (v: string) => {
    onChange(value.filter((x) => x !== v));
    input.current?.focus();
  };

  return (
    <div>
      <div
        className="field cursor-text px-3 pb-2.5 pt-7"
        data-invalid={!!error || undefined}
        data-glow={glow || undefined}
        onClick={(e) => {
          if (e.target === e.currentTarget) input.current?.focus();
        }}
      >
        <label htmlFor={id} className="pointer-events-none absolute left-4 top-2.5 text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-ink-soft">
          {label}
        </label>
        <div className="absolute right-2.5 top-2">
          <SourceBadge source={source} />
        </div>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={value} strategy={horizontalListSortingStrategy}>
            <ul className="flex flex-wrap items-center gap-1.5" aria-label={`${label} list`}>
              <AnimatePresence initial={false}>
                {value.map((v, i) => (
                  <Chip
                    key={v}
                    value={v}
                    armed={armed && i === value.length - 1}
                    flash={flash === v}
                    onRemove={() => remove(v)}
                  />
                ))}
              </AnimatePresence>
              <li className="min-w-[8rem] flex-1">
                <input
                  ref={input}
                  id={id}
                  value={draft}
                  onChange={(e) => {
                    setDraft(e.target.value);
                    setArmed(false);
                  }}
                  onKeyDown={onKeyDown}
                  onPaste={onPaste}
                  onBlur={() => {
                    if (draft.trim()) {
                      commit(draft);
                      setDraft("");
                    }
                  }}
                  placeholder={value.length ? "" : placeholder}
                  aria-describedby={`${id}-msg`}
                  className="h-8 w-full bg-transparent px-1 text-[0.95rem] text-ink outline-none placeholder:text-ink-faint/80"
                />
              </li>
            </ul>
          </SortableContext>
        </DndContext>
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
      </div>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <FieldMessage id={`${id}-msg`} error={error} hint={hint} />
        {presets?.length || value.length ? (
          <div className="flex flex-wrap items-center gap-1 pt-1">
            {presets?.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => onChange(mergeUnique(value, p.sizes.map(normalize), max))}
                className="group/p inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.7rem] font-medium text-ink-soft transition-colors hover:bg-sunken hover:text-ink"
              >
                <Plus size={11} strokeWidth={1.6} className="transition-transform duration-300 group-hover/p:rotate-90" />
                {p.label}
              </button>
            ))}
            {value.length ? (
              <button
                type="button"
                onClick={() => onChange([])}
                className="rounded-full px-2.5 py-1 text-[0.7rem] font-medium text-ink-faint transition-colors hover:text-accent"
              >
                Clear
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Chip({
  value,
  armed,
  flash,
  onRemove,
}: {
  value: string;
  armed: boolean;
  flash: boolean;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: value });
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition, zIndex: isDragging ? 5 : undefined }}
    >
      <motion.span
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: flash ? [1, 1.14, 1] : isDragging ? 1.06 : 1 }}
        exit={{ opacity: 0, scale: 0.6, transition: { duration: 0.18 } }}
        whileHover={{ scale: 1.04 }}
        transition={{ type: "spring", stiffness: 520, damping: 28 }}
        className={cn(
          "group/chip relative inline-flex h-8 select-none items-center rounded-full border pl-3 pr-1 text-[0.82rem] font-medium",
          "shadow-[inset_0_1px_0_var(--highlight),0_1px_2px_rgb(var(--shadow-rgb)/0.08)]",
          armed || flash
            ? "border-accent bg-accent-soft text-accent"
            : "border-line bg-surface-solid text-ink",
          isDragging && "shadow-float",
        )}
      >
        <span
          {...attributes}
          {...listeners}
          aria-label={`${value}. Press space to reorder, delete to remove.`}
          onKeyDown={(e) => {
            if (e.key === "Delete" || e.key === "Backspace") {
              e.preventDefault();
              onRemove();
              return;
            }
            listeners?.onKeyDown?.(e);
          }}
          className="cursor-grab rounded-full pr-1 outline-none focus-visible:underline active:cursor-grabbing"
        >
          {value}
        </span>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${value}`}
          className="grid h-6 w-6 scale-50 place-items-center rounded-full text-ink-faint opacity-0 transition-[transform,opacity] duration-300 hover:bg-accent hover:text-accent-ink focus-visible:scale-100 focus-visible:opacity-100 group-hover/chip:scale-100 group-hover/chip:opacity-100 [@media(hover:none)]:scale-100 [@media(hover:none)]:opacity-60"
        >
          <X size={12} strokeWidth={1.8} />
        </button>
      </motion.span>
    </li>
  );
}
