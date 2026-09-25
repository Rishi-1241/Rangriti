import { z } from "zod";
import { CATEGORIES, CURRENCIES, LIMITS, UPLOAD } from "@/lib/constants";

/** Row shape — mirrors the `products` table exactly. */
export type ProductRow = {
  id: string;
  title: string;
  category: string;
  fabric: string | null;
  description: string | null;
  sizes: string[];
  price: number | null;
  currency: string;
  free_shipping: boolean;
  ready_to_ship: boolean;
  images: string[];
  raw_input: string | null;
  created_at: string;
  updated_at: string;
};

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => (v.length ? v : null))
    .nullable();

/** What the form submits. images[0] is the primary image. */
export const productInputSchema = z.object({
  title: z.string().trim().min(2, "Give the piece a title.").max(LIMITS.titleMax),
  category: z.enum(CATEGORIES, { message: "Choose a category." }),
  fabric: optionalText(LIMITS.fabricMax),
  description: optionalText(LIMITS.descriptionMax),
  sizes: z.array(z.string().trim().min(1).max(24)).max(LIMITS.sizesMax),
  price: z
    .number({ message: "Price must be a number." })
    .nonnegative("Price cannot be negative.")
    .max(10_000_000)
    .nullable(),
  currency: z.enum(CURRENCIES),
  free_shipping: z.boolean(),
  ready_to_ship: z.boolean(),
  images: z.array(z.url()).max(UPLOAD.maxFiles),
  raw_input: optionalText(LIMITS.rawInputMaxChars),
});

export type ProductInput = z.infer<typeof productInputSchema>;
