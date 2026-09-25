import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";
import { ProductEditor } from "@/components/product/ProductEditor";
import { getProduct } from "@/lib/products/repo";

export const metadata: Metadata = { title: "Edit piece" };
export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const product = await getProduct(id);
  if (!product) notFound();
  return <ProductEditor key={product.updated_at} product={product} />;
}
