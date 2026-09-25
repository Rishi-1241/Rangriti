"use client";

import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import { ArrowUpRight, PackageCheck, PenLine, Trash2, Truck } from "lucide-react";
import { Monogram } from "@/components/brand/Brand";
import { WhatsAppIconButton } from "@/components/store/WhatsAppButton";
import { formatPrice } from "@/lib/format";
import type { ProductRow } from "@/lib/products/schema";

export type CardProduct = Omit<ProductRow, "raw_input">;

export function ProductCard<T extends CardProduct>({
  product,
  onDelete,
  href,
  whatsappNumber,
}: {
  product: T;
  onDelete?: (p: T) => void;
  href?: string;
  whatsappNumber?: string | null;
}) {
  const link = href ?? `/studio/${product.id}`;
  const admin = !!onDelete;
  const reduce = useReducedMotion();
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const hover = useMotionValue(0);
  const spring = { stiffness: 180, damping: 18, mass: 0.6 };
  const sx = useSpring(px, spring);
  const sy = useSpring(py, spring);
  const lift = useSpring(hover, { stiffness: 200, damping: 22 });

  const rotateY = useTransform(sx, [0, 1], [-7, 7]);
  const rotateX = useTransform(sy, [0, 1], [6, -6]);
  const imgX = useTransform(sx, [0, 1], [8, -8]);
  const imgY = useTransform(sy, [0, 1], [6, -6]);
  const y = useTransform(lift, [0, 1], [0, -8]);
  const shadowOpacity = useTransform(lift, [0, 1], [0, 1]);
  const lightX = useTransform(sx, (v) => `${v * 100}%`);
  const lightY = useTransform(sy, (v) => `${v * 100}%`);
  const light = useMotionTemplate`radial-gradient(420px circle at ${lightX} ${lightY}, rgb(255 244 230 / 0.28), transparent 45%)`;

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduce || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  };
  const onEnter = () => !reduce && hover.set(1);
  const onLeave = () => {
    px.set(0.5);
    py.set(0.5);
    hover.set(0);
  };

  const cover = product.images[0];
  const price = formatPrice(product.price, product.currency);

  return (
    <div style={{ perspective: 1100 }} onPointerMove={onMove} onPointerEnter={onEnter} onPointerLeave={onLeave}>
      <motion.article
        style={{ rotateX, rotateY, y, transformStyle: "preserve-3d" }}
        className="group relative rounded-[22px] border border-line bg-surface-solid shadow-soft focus-within:ring-2 focus-within:ring-accent/40"
      >
        <motion.div
          aria-hidden
          style={{ opacity: shadowOpacity }}
          className="pointer-events-none absolute inset-0 -z-10 rounded-[22px] shadow-lift"
        />

        <Link href={link} className="block rounded-[22px] outline-none" aria-label={admin ? `Edit ${product.title}` : product.title}>
          <div className="relative m-1.5 aspect-[4/5] overflow-hidden rounded-[14px] bg-sunken sm:m-2.5 sm:rounded-[16px]">
            {cover ? (
              <motion.div style={{ x: imgX, y: imgY, scale: 1.08 }} className="absolute inset-0">
                <Image
                  src={cover}
                  alt={product.title}
                  fill
                  sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 48vw"
                  className="object-cover transition-transform duration-[1600ms] ease-[var(--ease-silk)] group-hover:scale-[1.06]"
                />
              </motion.div>
            ) : (
              <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_30%_20%,var(--color-bone-200),transparent_70%)] dark:bg-[radial-gradient(circle_at_30%_20%,var(--color-espresso-700),transparent_70%)]">
                <Monogram size={64} className="opacity-50" />
              </div>
            )}
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[rgb(30_20_15/0.35)] via-transparent to-transparent opacity-60 transition-opacity duration-700 group-hover:opacity-90" />
            <motion.div aria-hidden style={{ background: light, opacity: shadowOpacity }} className="absolute inset-0 mix-blend-soft-light" />

            <div className="absolute left-2 top-2 flex flex-col items-start gap-1 sm:left-3 sm:top-3 sm:flex-row sm:flex-wrap sm:gap-1.5">
              {product.ready_to_ship ? (
                <span className="glass inline-flex items-center gap-1 rounded-full !border-white/20 p-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-ink lg:px-2.5 lg:py-1">
                  <PackageCheck size={11} strokeWidth={1.6} aria-label="Ready to dispatch" />
                  <span className="hidden lg:inline">Ready</span>
                </span>
              ) : null}
              {product.free_shipping ? (
                <span className="glass inline-flex items-center gap-1 rounded-full !border-white/20 p-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-ink lg:px-2.5 lg:py-1">
                  <Truck size={11} strokeWidth={1.6} aria-label="Free shipping" />
                  <span className="hidden lg:inline">Free ship</span>
                </span>
              ) : null}
            </div>

            <span
              aria-hidden
              className="absolute bottom-3 right-3 hidden h-9 w-9 translate-y-2 place-items-center sm:grid rounded-full bg-raised/90 text-ink opacity-0 shadow-float transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100"
            >
              <ArrowUpRight size={16} strokeWidth={1.5} className="transition-transform duration-500 group-hover:rotate-45" />
            </span>
          </div>

          <div className="px-3 pb-4 pt-1.5 sm:px-5 sm:pb-5 sm:pt-2" style={{ transform: "translateZ(24px)" }}>
            <p className="eyebrow truncate !text-[0.58rem] !tracking-[0.18em] sm:!text-[0.68rem] sm:!tracking-[0.24em]">{product.category}</p>
            <h3 className="mt-1.5 line-clamp-2 text-[1.08rem] leading-tight text-ink sm:mt-2 sm:text-[1.45rem]">{product.title}</h3>
            <div className="mt-2 flex flex-col gap-1 sm:mt-3 sm:flex-row sm:items-end sm:justify-between sm:gap-3">
              <div className="min-w-0">
                {product.fabric ? <p className="truncate text-[0.74rem] text-ink-soft sm:text-[0.8rem]">{product.fabric}</p> : null}
                {product.sizes.length ? (
                  <p className="mt-0.5 truncate text-[0.68rem] tracking-wide text-ink-faint sm:text-[0.72rem]">{product.sizes.join(" · ")}</p>
                ) : null}
              </div>
              {price ? <p className="shrink-0 font-display text-lg text-accent sm:text-xl">{price}</p> : null}
            </div>
          </div>
        </Link>

        {admin ? (
        <div className="absolute right-3 top-3 flex gap-1.5 opacity-0 sm:right-4 sm:top-4 transition-opacity duration-300 focus-within:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100">
          <Link
            href={`/studio/${product.id}`}
            className="grid h-9 w-9 place-items-center rounded-full bg-raised/90 text-ink shadow-float transition-transform duration-300 hover:-translate-y-0.5"
            aria-label={`Edit ${product.title}`}
          >
            <PenLine size={14} strokeWidth={1.5} />
          </Link>
          <button
            type="button"
            onClick={() => onDelete?.(product)}
            className="grid h-9 w-9 place-items-center rounded-full bg-raised/90 text-accent shadow-float transition-transform duration-300 hover:-translate-y-0.5"
            aria-label={`Delete ${product.title}`}
          >
            <Trash2 size={14} strokeWidth={1.5} />
          </button>
        </div>
        ) : whatsappNumber ? (
          <div className="absolute right-3 top-3 opacity-0 sm:right-4 sm:top-4 transition-opacity duration-300 focus-within:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100">
            <WhatsAppIconButton number={whatsappNumber} product={product} />
          </div>
        ) : null}
      </motion.article>
    </div>
  );
}
