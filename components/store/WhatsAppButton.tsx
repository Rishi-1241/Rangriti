"use client";

import { MessageCircle } from "lucide-react";
import { buttonClass } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";
import { enquiryMessage, whatsappLink, type EnquiryProduct } from "@/lib/whatsapp";

function buildHref(number: string, product: EnquiryProduct & { id: string }) {
  const url = typeof window !== "undefined" ? `${window.location.origin}/products/${product.id}` : null;
  return whatsappLink(number, enquiryMessage(product, url, formatPrice(product.price, product.currency)));
}

function open(number: string, product: EnquiryProduct & { id: string }) {
  window.open(buildHref(number, product), "_blank", "noopener,noreferrer");
}

/** Full-width call to action for the product page. */
export function WhatsAppButton({
  number,
  product,
  className,
}: {
  number: string;
  product: EnquiryProduct & { id: string };
  className?: string;
}) {
  return (
    <button type="button" onClick={() => open(number, product)} className={buttonClass("primary", "lg", cn("w-full", className))}>
      <MessageCircle size={17} strokeWidth={1.5} className="transition-transform duration-500 group-hover:-rotate-12 group-hover:scale-110" />
      Enquire on WhatsApp
    </button>
  );
}

/** Compact round icon for product cards. */
export function WhatsAppIconButton({ number, product }: { number: string; product: EnquiryProduct & { id: string } }) {
  return (
    <button
      type="button"
      onClick={() => open(number, product)}
      aria-label={`Enquire about ${product.title} on WhatsApp`}
      title="Enquire on WhatsApp"
      className="grid h-9 w-9 place-items-center rounded-full bg-raised/90 text-accent shadow-float transition-transform duration-300 hover:-translate-y-0.5 hover:scale-105"
    >
      <MessageCircle size={15} strokeWidth={1.6} />
    </button>
  );
}
