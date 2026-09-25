import "server-only";
import { supabaseServer, tables } from "@/lib/supabase/server";
import type { ProductInput, ProductRow } from "./schema";

const COLUMNS =
  "id,title,category,fabric,description,sizes,price,currency,free_shipping,ready_to_ship,images,raw_input,created_at,updated_at";

function normalize(row: ProductRow): ProductRow {
  return {
    ...row,
    sizes: row.sizes ?? [],
    images: row.images ?? [],
    price: row.price == null ? null : Number(row.price),
  };
}

export async function listProducts(): Promise<ProductRow[]> {
  const { productsTable } = tables();
  const { data, error } = await supabaseServer()
    .from(productsTable)
    .select(COLUMNS)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Could not load products: ${error.message}`);
  return (data as ProductRow[]).map(normalize);
}

const PUBLIC_COLUMNS =
  "id,title,category,fabric,description,sizes,price,currency,free_shipping,ready_to_ship,images,created_at,updated_at";

export type PublicProduct = Omit<ProductRow, "raw_input">;

function toPublic(row: ProductRow): PublicProduct {
  const { raw_input: _omit, ...p } = normalize(row);
  return p;
}

export async function listPublicProducts(): Promise<PublicProduct[]> {
  const { productsTable } = tables();
  const { data, error } = await supabaseServer()
    .from(productsTable)
    .select(PUBLIC_COLUMNS)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Could not load products: ${error.message}`);
  return (data as ProductRow[]).map(toPublic);
}

export async function getPublicProduct(id: string): Promise<PublicProduct | null> {
  const { productsTable } = tables();
  const { data, error } = await supabaseServer().from(productsTable).select(PUBLIC_COLUMNS).eq("id", id).maybeSingle();
  if (error) throw new Error(`Could not load product: ${error.message}`);
  return data ? toPublic(data as ProductRow) : null;
}

export async function getProduct(id: string): Promise<ProductRow | null> {
  const { productsTable } = tables();
  const { data, error } = await supabaseServer().from(productsTable).select(COLUMNS).eq("id", id).maybeSingle();
  if (error) throw new Error(`Could not load product: ${error.message}`);
  return data ? normalize(data as ProductRow) : null;
}

export async function insertProduct(input: ProductInput): Promise<ProductRow> {
  const { productsTable } = tables();
  const { data, error } = await supabaseServer().from(productsTable).insert(input).select(COLUMNS).single();
  if (error) throw new Error(error.message);
  return normalize(data as ProductRow);
}

export async function updateProduct(id: string, input: ProductInput): Promise<ProductRow> {
  const { productsTable } = tables();
  const { data, error } = await supabaseServer()
    .from(productsTable)
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select(COLUMNS)
    .single();
  if (error) throw new Error(error.message);
  return normalize(data as ProductRow);
}

export async function deleteProduct(id: string): Promise<void> {
  const { productsTable, storageBucket } = tables();
  const sb = supabaseServer();
  const existing = await getProduct(id);
  const { error } = await sb.from(productsTable).delete().eq("id", id);
  if (error) throw new Error(error.message);
  const paths = (existing?.images ?? [])
    .map((u) => storagePathFromPublicUrl(u, storageBucket))
    .filter((p): p is string => !!p);
  if (paths.length) {
    const { error: rmErr } = await sb.storage.from(storageBucket).remove(paths);
    if (rmErr) console.warn("[products] image cleanup failed", rmErr.message);
  }
}

export function storagePathFromPublicUrl(url: string, bucket: string): string | null {
  const marker = `/storage/v1/object/public/${bucket}/`;
  const i = url.indexOf(marker);
  return i === -1 ? null : decodeURIComponent(url.slice(i + marker.length));
}
