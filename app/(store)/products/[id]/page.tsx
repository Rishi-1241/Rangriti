import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, PackageCheck, Truck } from "lucide-react";
import { z } from "zod";
import { Reveal } from "@/components/motion/Reveal";
import { ProductGallery } from "@/components/store/ProductGallery";
import { WhatsAppButton } from "@/components/store/WhatsAppButton";
import { storeConfig } from "@/lib/config";
import { formatPrice } from "@/lib/format";
import { getPublicProduct } from "@/lib/products/repo";

export const dynamic = "force-dynamic";

async function load(id: string) {
  if (!z.uuid().safeParse(id).success) return null;
  return getPublicProduct(id);
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const p = await load((await params).id);
  return { title: p?.title ?? "Piece" };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const product = await load((await params).id);
  if (!product) notFound();
  const price = formatPrice(product.price, product.currency);
  const { whatsappNumber } = storeConfig();

  return (
    <div className="pt-8">
      <Link
        href="/"
        className="group inline-flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-ink-faint transition-colors hover:text-ink"
      >
        <ArrowLeft size={14} strokeWidth={1.5} className="transition-transform duration-300 group-hover:-translate-x-1" />
        Collection
      </Link>

      <div className="mt-6 grid gap-8 sm:mt-8 sm:gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16">
        <ProductGallery images={product.images} title={product.title} />

        <div className="lg:sticky lg:top-24 lg:self-start">
          <Reveal>
            <p className="eyebrow !text-accent">{product.category}</p>
            <h1 className="mt-3 text-[2.4rem] leading-[1.05] text-ink sm:mt-4 sm:text-6xl">{product.title}</h1>
            {product.fabric ? <p className="mt-3 text-sm tracking-wide text-ink-soft">{product.fabric}</p> : null}
            {price ? <p className="mt-4 font-display text-3xl text-accent sm:mt-6 sm:text-4xl">{price}</p> : null}
            {whatsappNumber ? (
              <div className="mt-8">
                <WhatsAppButton
                  number={whatsappNumber}
                  product={{ id: product.id, title: product.title, price: product.price, currency: product.currency }}
                />
                <p className="mt-3 text-center text-xs text-ink-faint">Opens WhatsApp with this piece pre-filled.</p>
              </div>
            ) : null}
          </Reveal>

          <Reveal delay={0.1}>
            <div className="hairline mt-8" />
            {product.sizes.length ? (
              <div className="mt-8">
                <p className="eyebrow">Sizes</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <li
                      key={s}
                      className="grid h-10 min-w-10 place-items-center rounded-full border border-line bg-surface-solid px-3 text-sm font-medium text-ink shadow-soft transition-transform duration-300 hover:-translate-y-0.5"
                    >
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {product.ready_to_ship || product.free_shipping ? (
              <div className="mt-8 flex flex-wrap gap-3">
                {product.ready_to_ship ? (
                  <span className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-[0.75rem] font-medium text-ink-soft">
                    <PackageCheck size={15} strokeWidth={1.4} className="text-brass" /> Ready to dispatch
                  </span>
                ) : null}
                {product.free_shipping ? (
                  <span className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-[0.75rem] font-medium text-ink-soft">
                    <Truck size={15} strokeWidth={1.4} className="text-brass" /> Free shipping
                  </span>
                ) : null}
              </div>
            ) : null}

            {product.description ? (
              <div className="mt-10">
                <p className="eyebrow">The piece</p>
                <p className="mt-3 whitespace-pre-line text-[0.95rem] leading-8 text-ink-soft">{product.description}</p>
              </div>
            ) : null}
          </Reveal>
        </div>
      </div>
    </div>
  );
}
