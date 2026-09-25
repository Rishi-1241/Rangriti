import { Type, type Schema } from "@google/genai";
import { z } from "zod";
import { CATEGORIES, CURRENCIES } from "@/lib/constants";
import { mergeUnique, normalizeSize } from "@/lib/chips";

/** Gemini native structured-output schema. Every field nullable; all keys required. */
export const extractionResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, nullable: true, description: "Short retail-grade title, 3–8 words." },
    category: {
      type: Type.STRING,
      nullable: true,
      format: "enum",
      enum: [...CATEGORIES],
      description: "One category from the fixed list.",
    },
    fabric: { type: Type.STRING, nullable: true, description: "Primary fabric, 1–4 words." },
    description: { type: Type.STRING, nullable: true, description: "2–4 polished sentences." },
    sizes: {
      type: Type.ARRAY,
      nullable: true,
      items: { type: Type.STRING },
      description: "Sizes exactly as listed.",
    },
    price: { type: Type.NUMBER, nullable: true, description: "Selling price as a number." },
    currency: { type: Type.STRING, nullable: true, format: "enum", enum: [...CURRENCIES] },
    free_shipping: { type: Type.BOOLEAN, nullable: true },
    ready_to_ship: { type: Type.BOOLEAN, nullable: true },
  },
  required: [
    "title",
    "category",
    "fabric",
    "description",
    "sizes",
    "price",
    "currency",
    "free_shipping",
    "ready_to_ship",
  ],
  propertyOrdering: [
    "title",
    "category",
    "fabric",
    "description",
    "sizes",
    "price",
    "currency",
    "free_shipping",
    "ready_to_ship",
  ],
};

const EMOJI = /[\p{Extended_Pictographic}\u{FE0F}\u{200D}]/gu;

const cleanText = (max: number) =>
  z
    .string()
    .nullable()
    .optional()
    .transform((v) => {
      if (v == null) return null;
      const t = v.replace(EMOJI, "").replace(/\s+/g, " ").trim().slice(0, max);
      return t.length ? t : null;
    });

/** Zod validation of the parsed model output — the only gate into the form. */
export const extractionSchema = z.object({
  title: cleanText(120),
  category: z
    .string()
    .nullable()
    .optional()
    .transform((v) => ((CATEGORIES as readonly string[]).includes(v ?? "") ? (v as (typeof CATEGORIES)[number]) : null)),
  fabric: cleanText(80),
  description: z
    .string()
    .nullable()
    .optional()
    .transform((v) => {
      if (v == null) return null;
      const t = v.replace(EMOJI, "").replace(/[ \t]+/g, " ").trim().slice(0, 2000);
      return t.length ? t : null;
    }),
  sizes: z
    .array(z.string())
    .nullable()
    .optional()
    .transform((v) => mergeUnique([], (v ?? []).map(normalizeSize), 24)),
  price: z
    .number()
    .nullable()
    .optional()
    .transform((v) => (v == null || !Number.isFinite(v) || v < 0 ? null : v)),
  currency: z
    .string()
    .nullable()
    .optional()
    .transform((v) => ((CURRENCIES as readonly string[]).includes(v ?? "") ? (v as (typeof CURRENCIES)[number]) : null)),
  free_shipping: z.boolean().nullable().optional().transform((v) => v ?? null),
  ready_to_ship: z.boolean().nullable().optional().transform((v) => v ?? null),
});

export type Extraction = z.output<typeof extractionSchema>;
export type ExtractionField = keyof Extraction;
