"use client";

import Link from "next/link";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { Plus, Search, X } from "lucide-react";
import { useDeferredValue, useEffect, useMemo, useOptimistic, useState, useTransition } from "react";
import { deleteProductAction } from "@/app/actions/products";
import { Monogram } from "@/components/brand/Brand";
import { Button, buttonClass } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { SortSelect } from "@/components/ui/SortSelect";
import { sortProducts, type SortKey } from "@/lib/products/sort";
import { useToast } from "@/components/ui/Toast";
import { CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/cn";
import type { ProductRow } from "@/lib/products/schema";
import { ProductCard } from "./ProductCard";

type Filter = "All" | (typeof CATEGORIES)[number];

export function ProductGrid({ initialProducts }: { initialProducts: ProductRow[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [optimistic, removeOptimistic] = useOptimistic(products, (state, id: string) => state.filter((p) => p.id !== id));
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [filter, setFilter] = useState<Filter>("All");
  const [sort, setSort] = useState<SortKey>("newest");
  const [pendingDelete, setPendingDelete] = useState<ProductRow | null>(null);
  const [, start] = useTransition();
  const toast = useToast();

  useEffect(() => setProducts(initialProducts), [initialProducts]);

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of optimistic) m.set(p.category, (m.get(p.category) ?? 0) + 1);
    return m;
  }, [optimistic]);

  const filters: Filter[] = ["All", ...CATEGORIES.filter((c) => counts.has(c))];

  const visible = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    const filtered = optimistic.filter((p) => {
      if (filter !== "All" && p.category !== filter) return false;
      if (!q) return true;
      return [p.title, p.category, p.fabric, p.description, p.sizes.join(" ")]
        .filter(Boolean)
        .some((s) => s!.toLowerCase().includes(q));
    });
    return sortProducts(filtered, sort);
  }, [optimistic, filter, deferredQuery, sort]);

  const confirmDelete = () => {
    const target = pendingDelete;
    if (!target) return;
    setPendingDelete(null);
    start(async () => {
      removeOptimistic(target.id);
      const res = await deleteProductAction(target.id);
      if (res.ok) {
        setProducts((list) => list.filter((p) => p.id !== target.id));
        toast.push({ tone: "success", title: "Removed from the catalogue", description: target.title });
      } else {
        toast.push({ tone: "error", title: "Could not delete", description: res.error });
      }
    });
  };

  return (
    <div>
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="eyebrow">
            {optimistic.length} {optimistic.length === 1 ? "piece" : "pieces"}
          </motion.p>
          <h1 className="mt-3 text-[2.6rem] leading-[1.05] text-ink sm:text-6xl">
            The <em className="font-normal text-accent">Catalogue</em>
          </h1>
        </div>
        <Link href="/studio/new" className={buttonClass("primary", "md", "hidden md:inline-flex")}>
          <Plus size={16} strokeWidth={1.6} className="transition-transform duration-500 group-hover:rotate-90" />
          New piece
        </Link>
      </div>

      {products.length > 0 ? (
        <>
          <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="field flex max-w-xl flex-1 items-center">
              <Search aria-hidden size={17} strokeWidth={1.4} className="ml-4 shrink-0 text-ink-faint" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search title, fabric, size"
                aria-label="Search products"
                className="h-13 w-full bg-transparent px-3 text-[0.95rem] text-ink outline-none placeholder:text-ink-faint [&::-webkit-search-cancel-button]:hidden"
              />
              <AnimatePresence>
                {query ? (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.6 }}
                    onClick={() => setQuery("")}
                    className="mr-3 grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink-faint hover:bg-sunken hover:text-ink"
                    aria-label="Clear search"
                  >
                    <X size={14} strokeWidth={1.6} />
                  </motion.button>
                ) : null}
              </AnimatePresence>
            </div>
            <SortSelect value={sort} onChange={setSort} />

            <LayoutGroup id="filters">
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
                          layoutId="filter-pill"
                          className="absolute inset-0 rounded-full bg-accent shadow-[inset_0_1px_0_rgb(255_255_255/0.2)]"
                          transition={{ type: "spring", stiffness: 420, damping: 34 }}
                        />
                      ) : null}
                      <span className="relative">
                        {f}
                        <span className={cn("ml-1.5 tabular-nums", active ? "opacity-80" : "text-ink-faint")}>
                          {f === "All" ? optimistic.length : counts.get(f) ?? 0}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </LayoutGroup>
          </div>

          <div className="hairline mt-8" />

          {visible.length ? (
            <motion.ul layout className="mt-6 grid grid-cols-2 gap-x-3 gap-y-5 sm:mt-10 sm:gap-x-6 sm:gap-y-8 md:grid-cols-3 xl:grid-cols-4">
              <AnimatePresence mode="popLayout">
                {visible.map((p, i) => (
                  <motion.li
                    key={p.id}
                    layout
                    initial={{ opacity: 0, y: 28, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1, transition: { delay: Math.min(i, 12) * 0.05, duration: 0.6 } }}
                    exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.3 } }}
                  >
                    <ProductCard product={p} onDelete={setPendingDelete} />
                  </motion.li>
                ))}
              </AnimatePresence>
            </motion.ul>
          ) : (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="py-24 text-center">
              <p className="font-display text-3xl text-ink">Nothing matches</p>
              <p className="mt-2 text-sm text-ink-soft">Try a different word, or clear the filters.</p>
              <Button
                variant="secondary"
                className="mt-6"
                onClick={() => {
                  setQuery("");
                  setFilter("All");
                }}
              >
                Clear filters
              </Button>
            </motion.div>
          )}
        </>
      ) : (
        <EmptyCatalogue />
      )}

      <Modal
        open={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        title="Remove this piece?"
        description={
          <>
            <span className="font-medium text-ink">{pendingDelete?.title}</span> and its images will be removed from the
            catalogue. This cannot be undone.
          </>
        }
        footer={
          <>
            <Button variant="secondary" onClick={() => setPendingDelete(null)} data-autofocus>
              Keep it
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Remove
            </Button>
          </>
        }
      />
    </div>
  );
}

function EmptyCatalogue() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.8 }}
      className="glass relative mt-12 overflow-hidden rounded-[32px] px-6 py-20 text-center sm:px-16"
    >
      <div aria-hidden className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
      <div aria-hidden className="absolute -bottom-24 -right-10 h-72 w-72 rounded-full bg-brass/15 blur-3xl" />
      <Monogram size={72} className="relative mx-auto" />
      <h2 className="relative mt-8 text-4xl text-ink sm:text-5xl">An empty atelier</h2>
      <p className="relative mx-auto mt-4 max-w-md text-sm leading-6 text-ink-soft">
        Paste a product note from WhatsApp and the studio will compose a clean listing for you to refine.
      </p>
      <Link href="/studio/new" className={buttonClass("primary", "lg", "relative mt-8")}>
        <Plus size={16} strokeWidth={1.6} className="transition-transform duration-500 group-hover:rotate-90" />
        Catalogue your first piece
      </Link>
    </motion.div>
  );
}
