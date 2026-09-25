import { ArrowDown } from "lucide-react";
import { ArchMotif } from "@/components/brand/Brand";
import { Reveal } from "@/components/motion/Reveal";
import { StoreCatalogue } from "@/components/store/StoreCatalogue";
import { storeConfig } from "@/lib/config";
import { listPublicProducts } from "@/lib/products/repo";

export const dynamic = "force-dynamic";

export default async function StorePage() {
  const products = await listPublicProducts();
  return (
    <>
      <section className="relative isolate -mx-4 overflow-hidden px-4 pb-12 pt-10 sm:-mx-6 sm:pb-16 sm:pt-14 sm:px-6 lg:-mx-10 lg:px-10 lg:pb-24 lg:pt-20">
        <ArchMotif className="pointer-events-none absolute -right-20 -top-10 -z-10 hidden h-[130%] w-[45%] opacity-60 md:block" />
        <p aria-hidden className="pointer-events-none absolute -bottom-8 left-0 -z-10 select-none font-display text-[11rem] italic leading-none text-accent/[0.06] sm:text-[16rem]">
          Rangriti
        </p>
        <Reveal>
          <p className="eyebrow !text-accent">The collection</p>
        </Reveal>
        <Reveal delay={0.1}>
          <h1 className="mt-5 max-w-3xl text-[clamp(2.75rem,8vw,6rem)] leading-[1.02] text-ink">
            Crafted for <em className="font-normal text-accent">every occasion.</em>
          </h1>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mt-6 max-w-lg text-[0.98rem] leading-7 text-ink-soft">
            Sarees, suit sets, lehengas and kurtis — hand-picked prints, fabrics and finishes.
          </p>
        </Reveal>
        <Reveal delay={0.3}>
          <a
            href="#collection"
            className="draw-underline group mt-10 inline-flex items-center gap-2 text-[0.75rem] font-semibold uppercase tracking-[0.2em] text-ink"
          >
            Explore {products.length ? `${products.length} ${products.length === 1 ? "piece" : "pieces"}` : "the collection"}
            <ArrowDown size={14} strokeWidth={1.5} className="transition-transform duration-500 group-hover:translate-y-1" />
          </a>
        </Reveal>
      </section>
      <StoreCatalogue products={products} whatsappNumber={storeConfig().whatsappNumber} />
    </>
  );
}
