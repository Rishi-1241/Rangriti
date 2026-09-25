"use client";

import { ArrowUpDown, ChevronDown } from "lucide-react";
import { SORT_OPTIONS, type SortKey } from "@/lib/products/sort";

export function SortSelect({ value, onChange }: { value: SortKey; onChange: (v: SortKey) => void }) {
  return (
    <label className="field relative flex h-13 shrink-0 items-center gap-2 pl-4 pr-3 sm:w-56">
      <ArrowUpDown aria-hidden size={15} strokeWidth={1.4} className="text-ink-faint" />
      <span className="sr-only">Sort by</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortKey)}
        className="h-full min-w-0 flex-1 cursor-pointer appearance-none bg-transparent pr-7 text-[0.85rem] font-medium text-ink outline-none"
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown aria-hidden size={14} strokeWidth={1.5} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink-faint" />
    </label>
  );
}
