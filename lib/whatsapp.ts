export type EnquiryProduct = { title: string; price: number | null; currency: string };

export function enquiryMessage(p: EnquiryProduct, url: string | null, priceText: string | null): string {
  const lines = [
    "Hello, could you please give more information on this product?",
    "",
    `Product: ${p.title}`,
  ];
  if (priceText) lines.push(`Price: ${priceText}`);
  if (url) lines.push(`Link: ${url}`);
  return lines.join("\n");
}

export function whatsappLink(number: string, message: string): string {
  return `https://wa.me/${number.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
}
