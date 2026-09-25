"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { ArrowLeft, Check, ClipboardPaste, Eraser, PackageCheck, Truck, WandSparkles } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { saveProductAction } from "@/app/actions/products";
import { Button } from "@/components/ui/Button";
import { ChipInput } from "@/components/ui/ChipInput";
import { SelectField, TextArea, TextField, Toggle } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { normalizeSize } from "@/lib/chips";
import { cn } from "@/lib/cn";
import { CATEGORIES, CURRENCIES, DEFAULT_CURRENCY, LIMITS, SIZE_PRESETS } from "@/lib/constants";
import type { Extraction } from "@/lib/llm/extraction-schema";
import {
  extractionToPatch,
  FIELD_LABELS,
  FIELD_ORDER,
  findConflicts,
  type FieldKey,
  type FormValues,
  type Sources,
} from "@/lib/products/merge";
import { productInputSchema, type ProductRow } from "@/lib/products/schema";
import { ExtractProgress, type Phase } from "./ExtractProgress";
import { fromUrls, ImageManager, type ImageItem } from "./ImageManager";

const EMPTY: FormValues = {
  title: "",
  category: "",
  fabric: "",
  description: "",
  sizes: [],
  price: "",
  currency: DEFAULT_CURRENCY,
  free_shipping: false,
  ready_to_ship: false,
};

const SAMPLE = `Rich & Party Wear Awesome Designer Suit in very Premium Dhabu Cotton with side slit Kurta.... Heavy Embroidery and Mirror Work On the yoke...
Kurta with Both side pockets
Ajrakh Lace Work on Sleeves
Kurta in Princess Cut pattern with ajrakh Print Lace work Detailings...
Plazzo Pants in Dhabu Cotton...
Full length Pure Ajrakh Cotton Dupatta...
Size : 38 40 42 44 46
Price : 1700 Freeship
Ready to dispatch`;

const STAGGER_MS = 130;
const GLOW_MS = 1600;

function rowToValues(p: ProductRow): FormValues {
  return {
    title: p.title,
    category: (CATEGORIES as readonly string[]).includes(p.category) ? (p.category as FormValues["category"]) : "Other",
    fabric: p.fabric ?? "",
    description: p.description ?? "",
    sizes: p.sizes,
    price: p.price == null ? "" : String(p.price),
    currency: (CURRENCIES as readonly string[]).includes(p.currency) ? (p.currency as FormValues["currency"]) : DEFAULT_CURRENCY,
    free_shipping: p.free_shipping,
    ready_to_ship: p.ready_to_ship,
  };
}

export function ProductEditor({ product }: { product?: ProductRow }) {
  const router = useRouter();
  const toast = useToast();
  const [values, setValues] = useState<FormValues>(product ? rowToValues(product) : EMPTY);
  const [sources, setSources] = useState<Sources>({});
  const [glow, setGlow] = useState<Set<FieldKey>>(new Set());
  const [pendingFields, setPendingFields] = useState<Set<FieldKey>>(new Set());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [shake, setShake] = useState(0);
  const [raw, setRaw] = useState(product?.raw_input ?? "");
  const [rawError, setRawError] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [images, setImages] = useState<ImageItem[]>(fromUrls(product?.images ?? []));
  const [conflict, setConflict] = useState<{ patch: Partial<FormValues>; keys: FieldKey[] } | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, startSaving] = useTransition();
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const abort = useRef<AbortController | null>(null);

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
      abort.current?.abort();
    },
    [],
  );

  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  const update = useCallback(<K extends FieldKey>(k: K, v: FormValues[K]) => {
    setValues((prev) => ({ ...prev, [k]: v }));
    setSources((s) => ({ ...s, [k]: "manual" }));
    setErrors((e) => {
      if (!e[k]) return e;
      const { [k]: _, ...rest } = e;
      return rest;
    });
    setDirty(true);
  }, []);

  const onImages = useCallback((updater: (prev: ImageItem[]) => ImageItem[]) => {
    setImages(updater);
    setDirty(true);
  }, []);

  const applyPatch = (patch: Partial<FormValues>, skip: FieldKey[] = []) => {
    const keys = FIELD_ORDER.filter((k) => k in patch && !skip.includes(k));
    setPendingFields(new Set(keys));
    setPhase("filling");
    keys.forEach((k, i) => {
      timers.current.push(
        setTimeout(() => {
          setValues((prev) => ({ ...prev, [k]: patch[k] }));
          setSources((s) => ({ ...s, [k]: "llm" }));
          setErrors((e) => {
            if (!e[k]) return e;
            const { [k]: _, ...rest } = e;
            return rest;
          });
          setPendingFields((p) => {
            const n = new Set(p);
            n.delete(k);
            return n;
          });
          setGlow((g) => new Set(g).add(k));
          timers.current.push(
            setTimeout(
              () =>
                setGlow((g) => {
                  const n = new Set(g);
                  n.delete(k);
                  return n;
                }),
              GLOW_MS,
            ),
          );
        }, 220 + i * STAGGER_MS),
      );
    });
    timers.current.push(
      setTimeout(
        () => {
          setPhase("idle");
          setDirty(true);
          toast.push({
            tone: "success",
            title: "Listing composed",
            description: `${keys.length} ${keys.length === 1 ? "field" : "fields"} filled. Review and refine before saving.`,
          });
        },
        220 + keys.length * STAGGER_MS + 200,
      ),
    );
  };

  const extract = async () => {
    const text = raw.trim();
    if (text.length < 10) {
      setRawError("Paste the product note first — at least a line or two.");
      setShake((s) => s + 1);
      return;
    }
    setRawError(null);
    abort.current?.abort();
    const ctrl = new AbortController();
    abort.current = ctrl;
    setPhase("analysing");
    setPendingFields(new Set(FIELD_ORDER));
    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raw: text }),
        signal: ctrl.signal,
      });
      if (res.status === 401) {
        toast.push({ tone: "error", title: "Session ended", description: "Please sign in again." });
        router.push("/login");
        return;
      }
      const body = (await res.json().catch(() => ({}))) as { extraction?: Extraction; error?: string };
      if (!res.ok || !body.extraction) throw new Error(body.error ?? "Extraction failed.");

      const patch = extractionToPatch(body.extraction);
      if (!Object.keys(patch).length) {
        setPhase("idle");
        setPendingFields(new Set());
        toast.push({ tone: "info", title: "Nothing certain to extract", description: "Fill the fields by hand." });
        return;
      }
      const keys = findConflicts(values, sources, patch);
      if (keys.length) {
        setPhase("idle");
        setPendingFields(new Set());
        setConflict({ patch, keys });
        return;
      }
      applyPatch(patch);
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      setPhase("idle");
      setPendingFields(new Set());
      toast.push({ tone: "error", title: "Could not compose the listing", description: (e as Error).message });
    }
  };

  const uploading = images.some((i) => i.status === "uploading");
  const failed = images.some((i) => i.status === "error");

  const save = () => {
    if (uploading) {
      toast.push({ tone: "info", title: "Images still uploading", description: "Saving will be available in a moment." });
      return;
    }
    const priceText = values.price.replace(/[,\s₹]/g, "");
    const payload = {
      title: values.title,
      category: values.category,
      fabric: values.fabric,
      description: values.description,
      sizes: values.sizes,
      price: priceText ? Number(priceText) : null,
      currency: values.currency,
      free_shipping: values.free_shipping,
      ready_to_ship: values.ready_to_ship,
      images: images.filter((i) => i.status === "done" && i.url).map((i) => i.url!),
      raw_input: raw,
    };
    const parsed = productInputSchema.safeParse(payload);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const issue of parsed.error.issues) errs[String(issue.path[0])] ??= issue.message;
      setErrors(errs);
      setShake((s) => s + 1);
      toast.push({ tone: "error", title: "A few details need attention" });
      return;
    }
    startSaving(async () => {
      const res = await saveProductAction(product?.id ?? null, parsed.data);
      if (!res.ok) {
        if (res.fieldErrors) {
          setErrors(res.fieldErrors);
          setShake((s) => s + 1);
        }
        toast.push({ tone: "error", title: "Could not save", description: res.error });
        return;
      }
      setDirty(false);
      toast.push({
        tone: "success",
        title: product ? "Changes saved" : "Added to the catalogue",
        description: parsed.data.title,
      });
      router.push("/studio");
      router.refresh();
    });
  };

  const busy = phase !== "idle";
  const fieldProps = (k: FieldKey) => ({
    source: sources[k],
    glow: glow.has(k),
    loading: busy && pendingFields.has(k),
    error: errors[k],
    shakeKey: shake,
  });

  const sectionAnim = useMemo(
    () => ({
      initial: { opacity: 0, y: 18 },
      animate: { opacity: 1, y: 0 },
    }),
    [],
  );

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link
            href="/studio"
            className="group inline-flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-ink-faint transition-colors hover:text-ink"
          >
            <ArrowLeft size={14} strokeWidth={1.5} className="transition-transform duration-300 group-hover:-translate-x-1" />
            Catalogue
          </Link>
          <h1 className="mt-4 text-[2.6rem] leading-[1.05] text-ink sm:text-6xl">
            {product ? (
              <>
                Refine <em className="font-normal text-accent">the piece</em>
              </>
            ) : (
              <>
                A new <em className="font-normal text-accent">piece</em>
              </>
            )}
          </h1>
        </div>
      </div>

      <div className="mt-8 grid gap-6 sm:mt-10 sm:gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-10">
        {/* Composer */}
        <motion.section
          {...sectionAnim}
          transition={{ duration: 0.7 }}
          aria-labelledby="composer-title"
          className="lg:sticky lg:top-24 lg:self-start"
        >
          <div className="glass relative overflow-hidden rounded-[26px] p-5 sm:p-7">
            <div aria-hidden className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-accent/10 blur-3xl" />
            <div className="relative flex items-center justify-between gap-3">
              <div>
                <p className="eyebrow">Step one</p>
                <h2 id="composer-title" className="mt-2 text-3xl text-ink">
                  The source note
                </h2>
              </div>
              <ClipboardPaste aria-hidden size={22} strokeWidth={1.2} className="text-brass" />
            </div>
            <p className="relative mt-2 text-sm leading-6 text-ink-soft">
              Paste the message exactly as it arrived. The studio will draft the listing; you have the final word.
            </p>

            <div
              className="relative mt-5"
              onKeyDownCapture={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                  e.preventDefault();
                  extract();
                }
              }}
            >
              <TextArea
                label="Paste product note"
                value={raw}
                onChange={(v) => {
                  setRaw(v.slice(0, LIMITS.rawInputMaxChars));
                  setRawError(null);
                  setDirty(true);
                }}
                rows={10}
                error={rawError}
                shakeKey={shake}
                hint={`${raw.length.toLocaleString()} / ${LIMITS.rawInputMaxChars.toLocaleString()} · ⌘/Ctrl + Enter to compose`}
                className="[&_textarea]:min-h-64 [&_textarea]:font-[450] [&_textarea]:leading-7"
              />
            </div>

            <div className="relative mt-2 flex flex-wrap items-center gap-2">
              <Button onClick={extract} loading={phase === "analysing"} disabled={busy} className="flex-1 sm:flex-none">
                <WandSparkles size={16} strokeWidth={1.5} className="transition-transform duration-500 group-hover:-rotate-12" />
                {phase === "analysing" ? "Composing" : sources && Object.values(sources).includes("llm") ? "Compose again" : "Compose listing"}
              </Button>
              {!raw ? (
                <Button variant="ghost" size="sm" onClick={() => setRaw(SAMPLE)}>
                  Use sample note
                </Button>
              ) : (
                <Button variant="ghost" size="sm" onClick={() => setRaw("")} disabled={busy}>
                  <Eraser size={14} strokeWidth={1.5} /> Clear
                </Button>
              )}
            </div>

            <ExtractProgress phase={phase} />
          </div>
        </motion.section>

        {/* Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "s") {
              e.preventDefault();
              save();
            }
          }}
          className="space-y-6"
          noValidate
        >
          <Section index={0} eyebrow="Step two" title="Essentials">
            <TextField label="Title" value={values.title} onChange={(v) => update("title", v)} {...fieldProps("title")} />
            <div className="grid gap-x-4 sm:grid-cols-2">
              <SelectField
                label="Category"
                value={values.category}
                options={CATEGORIES}
                placeholder="Choose a category"
                onChange={(v) => update("category", v)}
                {...fieldProps("category")}
              />
              <TextField label="Fabric" value={values.fabric} onChange={(v) => update("fabric", v)} {...fieldProps("fabric")} />
            </div>
            <TextArea
              label="Description"
              value={values.description}
              onChange={(v) => update("description", v)}
              rows={5}
              {...fieldProps("description")}
            />
          </Section>

          <Section index={1} eyebrow="Step three" title="Sizing & price">
            <ChipInput
              label="Sizes"
              value={values.sizes}
              onChange={(v) => update("sizes", v)}
              normalize={normalizeSize}
              presets={SIZE_PRESETS}
              max={LIMITS.sizesMax}
              placeholder="e.g. 38 40 42 44 or S, M, L, XL"
              hint="Separate with space, comma or enter. Drag to reorder."
              {...fieldProps("sizes")}
            />
            <div className="grid gap-x-4 sm:grid-cols-[1fr_10rem]">
              <TextField
                label="Price"
                value={values.price}
                inputMode="decimal"
                leading={values.currency === "INR" ? "₹" : "$"}
                onChange={(v) => update("price", v.replace(/[^\d.,]/g, ""))}
                {...fieldProps("price")}
              />
              <SelectField
                label="Currency"
                value={values.currency}
                options={CURRENCIES}
                onChange={(v) => update("currency", v)}
                {...fieldProps("currency")}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Toggle
                label="Free shipping"
                description="Shipping included in price"
                icon={<Truck size={18} strokeWidth={1.3} />}
                checked={values.free_shipping}
                onChange={(v) => update("free_shipping", v)}
                source={sources.free_shipping}
                glow={glow.has("free_shipping")}
                loading={busy && pendingFields.has("free_shipping")}
              />
              <Toggle
                label="Ready to dispatch"
                description="In stock, ships now"
                icon={<PackageCheck size={18} strokeWidth={1.3} />}
                checked={values.ready_to_ship}
                onChange={(v) => update("ready_to_ship", v)}
                source={sources.ready_to_ship}
                glow={glow.has("ready_to_ship")}
                loading={busy && pendingFields.has("ready_to_ship")}
              />
            </div>
          </Section>

          <Section index={2} eyebrow="Step four" title="Imagery" aside={`${images.length} / 12`}>
            <ImageManager
              items={images}
              onChange={onImages}
              onToast={(title, description) => toast.push({ tone: "error", title, description })}
            />
            {errors.images ? <p className="mt-2 text-[0.75rem] font-medium text-accent">{errors.images}</p> : null}
          </Section>

          <div className="bottom-safe sticky z-30">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass flex flex-col gap-3 rounded-[22px] p-2.5 sm:flex-row sm:items-center sm:justify-between sm:rounded-full sm:py-3 sm:pl-6 sm:pr-3"
            >
              <p className="hidden text-[0.78rem] text-ink-soft sm:block">
                {uploading
                  ? "Uploading images…"
                  : failed
                    ? "Some images failed — retry or remove them."
                    : dirty
                      ? "Unsaved changes"
                      : product
                        ? "All changes saved"
                        : "Nothing saved yet"}
              </p>
              <div className="flex gap-2">
                <Link href="/studio" className="btn btn-ghost h-11 flex-1 px-4 sm:flex-none sm:px-5">
                  Cancel
                </Link>
                <Button type="submit" loading={saving} disabled={busy || uploading} className="flex-1 sm:flex-none">
                  <Check size={16} strokeWidth={1.6} />
                  {saving ? (
                    "Saving"
                  ) : (
                    <>
                      <span className="sm:hidden">{product ? "Save" : "Save piece"}</span>
                      <span className="hidden sm:inline">{product ? "Save changes" : "Save to catalogue"}</span>
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </div>
        </form>
      </div>

      <Modal
        open={!!conflict}
        onClose={() => setConflict(null)}
        title="Keep your edits?"
        description={
          <>
            The new extraction would change fields you edited by hand:{" "}
            <span className="font-medium text-ink">{conflict?.keys.map((k) => FIELD_LABELS[k]).join(", ")}</span>. Other empty
            or extracted fields will be updated either way.
          </>
        }
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                const c = conflict!;
                setConflict(null);
                applyPatch(c.patch);
              }}
            >
              Replace them
            </Button>
            <Button
              data-autofocus
              onClick={() => {
                const c = conflict!;
                setConflict(null);
                applyPatch(c.patch, c.keys);
              }}
            >
              Keep my edits
            </Button>
          </>
        }
      />
    </div>
  );
}

function Section({
  index,
  eyebrow,
  title,
  aside,
  children,
}: {
  index: number;
  eyebrow: string;
  title: string;
  aside?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.1 + index * 0.08 }}
      className={cn("glass rounded-[26px] p-5 sm:p-7")}
    >
      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="mt-2 text-3xl text-ink">{title}</h2>
        </div>
        {aside ? <span className="text-xs tabular-nums text-ink-faint">{aside}</span> : null}
      </div>
      <div className="space-y-1">{children}</div>
    </motion.section>
  );
}
