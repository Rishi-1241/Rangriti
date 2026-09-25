export const CATEGORIES = [
  "Saree",
  "Suit Set",
  "Lehenga",
  "Kurti",
  "Readymade Blouse",
  "Dupatta Set",
  "Palazzo Set",
  "Co-ord Set",
  "Festive Wear",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CURRENCIES = ["INR", "USD"] as const;
export type Currency = (typeof CURRENCIES)[number];
export const DEFAULT_CURRENCY: Currency = "INR";

export const SIZE_PRESETS: { label: string; sizes: string[] }[] = [
  { label: "XS – XXL", sizes: ["XS", "S", "M", "L", "XL", "XXL"] },
  { label: "36 – 46", sizes: ["36", "38", "40", "42", "44", "46"] },
  { label: "Free Size", sizes: ["Free Size"] },
];

export const UPLOAD = {
  maxBytes: 8 * 1024 * 1024,
  maxFiles: 12,
  acceptedTypes: ["image/jpeg", "image/png", "image/webp", "image/avif"] as const,
};

export const LIMITS = {
  rawInputMaxChars: 6000,
  titleMax: 120,
  fabricMax: 80,
  descriptionMax: 2000,
  sizesMax: 24,
};

export const TIMEOUTS = {
  extractionMs: 30_000,
};

export const SESSION = {
  cookieName: "rs_session",
  maxAgeSeconds: 60 * 60 * 12,
};
