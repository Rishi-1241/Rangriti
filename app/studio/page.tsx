import type { Metadata } from "next";
import { listProducts } from "@/lib/products/repo";
import { ProductGrid } from "@/components/product/ProductGrid";

export const metadata: Metadata = { title: "Catalogue" };
export const dynamic = "force-dynamic";

export default async function CataloguePage() {
  const products = await listProducts();
  return <ProductGrid initialProducts={products} />;
}
