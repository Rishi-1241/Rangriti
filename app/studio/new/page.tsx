import type { Metadata } from "next";
import { ProductEditor } from "@/components/product/ProductEditor";

export const metadata: Metadata = { title: "New piece" };

export default function NewProductPage() {
  return <ProductEditor />;
}
