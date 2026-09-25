"use client";

import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { PackageCheck, Search, SlidersHorizontal, Truck, X } from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";
import { Monogram } from "@/components/brand/Brand";
import { ProductCard, type CardProduct } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/Button";
import { SortSelect } from "@/components/ui/SortSelect";
import { CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/cn";
import { sortProducts, type SortKey } from "@/lib/products/sort";

type Filter = "All" | (typeof CATEGORIES)[number];

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-[0.75rem] font-medium transition-[transform,colors] duration-300 hover:-translate-y-0.5",
        active ? "border-accent bg-accent-soft text-accent" : "border-line text-ink-soft hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}

export function StoreCatalogue({
  products,
  whatsappNumber,
}: {
  products: CardProduct[];
  whatsappNumber?: string | null;
}) {
  const [query, setQuery] = useState("");
  const q = useDeferredValue(query);
  const [filter, setFilter] = useState<Filter>("All");
  const [sort, setSort] = useState<SortKey>("newest");
  const [readyOnly, setReadyOnly] = useState(false);
  const [freeShipOnly, setFreeShipOnly] = useState(false);
  const [size, setSize] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const allSizes = useMemo(() => {
    const seen = new Map<string, string>();
    for (const p of products) for (const s of p.sizes) if (!seen.has(s.toLowerCase())) seen.set(s.toLowerCase(), s);
    return [...seen.values()].sort((a, b) => {
      const na = Number(a);
      const nb = Number(b);
      if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
      return a.localeCompare(b);
    });
  }, [products]);

  const refined = readyOnly || freeShipOnly || !!size || !!minPrice || !!maxPrice;
  const clearAll = () => {
    setQuery("");
    setFilter("All");
    setReadyOnly(false);
    setFreeShipOnly(false);
    setSize("");
    setMinPrice("");
    setMaxPrice("");
  };

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of products) m.set(p.category, (m.get(p.category) ?? 0) + 1);
    return m;
  }, [products]);
  const filters: Filter[] = ["All", ...CATEGORIES.filter((c) => counts.has(c))];

  const visible = useMemo(() => {
    const s = q.trim().toLowerCase();
    const min = minPrice ? Number(minPrice) : null;
    const max = maxPrice ? Number(maxPrice) : null;
    const filtered = products.filter((p) => {
      if (filter !== "All" && p.category !== filter) return false;
      if (readyOnly && !p.ready_to_ship) return false;
      if (freeShipOnly && !p.free_shipping) return false;
      if (size && !p.sizes.some((x) => x.toLowerCase() === size.toLowerCase())) return false;
      if (min != null && (p.price == null || p.price < min)) return false;
      if (max != null && (p.price == null || p.price > max)) return false;
      if (!s) return true;
      return [p.title, p.category, p.fabric, p.description, p.sizes.join(" ")]
        .filter(Boolean)
        .some((t) => t!.toLowerCase().includes(s));
    });
    return sortProducts(filtered, sort);
  }, [products, filter, q, sort, readyOnly, freeShipOnly, size, minPrice, maxPrice]);

  if (!products.length) {
    return (
      <div className="glass mt-12 rounded-[32px] px-6 py-20 text-center">
        <Monogram size={64} className="mx-auto" />
        <h2 className="mt-6 text-4xl text-ink">The collection is being composed</h2>
        <p className="mt-3 text-sm text-ink-soft">New pieces will appear here shortly.</p>
      </div>
    );
  }

  return (
    <div id="collection" className="scroll-mt-24">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="field flex min-w-0 flex-1 items-center sm:max-w-xl">
          <Search aria-hidden size={17} strokeWidth={1.4} className="ml-4 shrink-0 text-ink-faint" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search sarees, suits, fabrics"
            aria-label="Search the collection"
            className="h-13 w-full bg-transparent px-3 text-[0.95rem] text-ink outline-none placeholder:text-ink-faint [&::-webkit-search-cancel-button]:hidden"
          />
          {query ? (
            <button
              onClick={() => setQuery("")}
              className="mr-3 grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink-faint hover:bg-sunken hover:text-ink"
              aria-label="Clear search"
            >
              <X size={14} strokeWidth={1.6} />
            </button>
          ) : null}
        </div>
        <SortSelect value={sort} onChange={setSort} />
      </div>

      <div className="mt-4">
        <LayoutGroup id="store-filters">
          <div role="tablist" aria-label="Filter by category" className="scroll-quiet -mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
            {filters.map((f) => {
              const active = f === filter;
              return (
                <button
                  key={f}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "relative shrink-0 rounded-full px-4 py-2 text-[0.75rem] font-semibold tracking-[0.06em] transition-colors",
                    active ? "text-accent-ink" : "text-ink-soft hover:text-ink",
                  )}
                >
                  {active ? (
                    <motion.span
                      layoutId="store-pill"
                      className="absolute inset-0 rounded-full bg-accent"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  ) : null}
                  <span className="relative">{f}</span>
                </button>
              );
            })}
          </div>
        </LayoutGroup>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="eyebrow mr-1 inline-flex items-center gap-1.5">
          <SlidersHorizontal size={12} strokeWidth={1.6} /> Refine
        </span>
        <Pill active={readyOnly} onClick={() => setReadyOnly((v) => !v)}>
          <PackageCheck size={13} strokeWidth={1.5} /> Ready to dispatch
        </Pill>
        <Pill active={freeShipOnly} onClick={() => setFreeShipOnly((v) => !v)}>
          <Truck size={13} strokeWidth={1.5} /> Free shipping
        </Pill>
        {allSizes.length ? (
          <label className="relative">
            <span className="sr-only">Size</span>
            <select
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className={cn(
                "h-9 cursor-pointer appearance-none rounded-full border bg-transparent pl-3.5 pr-8 text-[0.75rem] font-medium outline-none",
                size ? "border-accent bg-accent-soft text-accent" : "border-line text-ink-soft",
              )}
            >
              <option value="">Any size</option>
              {allSizes.map((s) => (
                <option key={s} value={s}>
                  Size {s}
                </option>
              ))}
            </select>
            <span aria-hidden className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[0.6rem] text-ink-faint">
              ▾
            </span>
          </label>
        ) : null}
        <div className="inline-flex h-9 items-center gap-1 rounded-full border border-line pl-3.5 pr-1.5 text-[0.75rem] text-ink-soft">
          <span aria-hidden>₹</span>
          <input
            inputMode="numeric"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value.replace(/\D/g, ""))}
            placeholder="Min"
            aria-label="Minimum price"
            className="w-14 bg-transparent text-ink outline-none placeholder:text-ink-faint"
          />
          <span aria-hidden className="text-ink-faint">–</span>
          <input
            inputMode="numeric"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value.replace(/\D/g, ""))}
            placeholder="Max"
            aria-label="Maximum price"
            className="w-14 bg-transparent text-ink outline-none placeholder:text-ink-faint"
          />
        </div>
        <AnimatePresence>
          {refined || filter !== "All" || query ? (
            <motion.button
              type="button"
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              onClick={clearAll}
              className="draw-underline ml-1 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-accent"
            >
              Clear all
            </motion.button>
          ) : null}
        </AnimatePresence>
        <span className="ml-auto text-xs tabular-nums text-ink-faint" aria-live="polite">
          {visible.length} of {products.length}
        </span>
      </div>

      <div className="hairline mt-6" />

      {visible.length ? (
        <motion.ul layout className="mt-6 grid grid-cols-2 gap-x-3 gap-y-5 sm:mt-10 sm:gap-x-6 sm:gap-y-8 md:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {visible.map((p, i) => (
              <motion.li
                key={p.id}
                layout
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.3 } }}
                transition={{ delay: Math.min(i % 4, 3) * 0.07, duration: 0.7 }}
              >
                <ProductCard product={p} href={`/products/${p.id}`} whatsappNumber={whatsappNumber} />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      ) : (
        <div className="py-24 text-center">
          <p className="font-display text-3xl text-ink">Nothing matches</p>
          <Button
            variant="secondary"
            className="mt-6"
            onClick={clearAll}
          >
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}
