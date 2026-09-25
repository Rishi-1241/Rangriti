"use client";

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { rectSortingStrategy, SortableContext, sortableKeyboardCoordinates, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AnimatePresence, motion } from "motion/react";
import { CircleAlert, GripVertical, ImagePlus, RotateCcw, Star, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { moveItem } from "@/lib/chips";
import { cn } from "@/lib/cn";
import { UPLOAD } from "@/lib/constants";

export type ImageItem = {
  id: string;
  url?: string;
  preview?: string;
  file?: File;
  progress: number;
  status: "uploading" | "done" | "error";
  error?: string;
};

export function fromUrls(urls: string[]): ImageItem[] {
  return urls.map((url) => ({ id: url, url, progress: 1, status: "done" }));
}

function uploadFile(file: File, onProgress: (p: number) => void): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload");
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded / e.total);
    xhr.onload = () => {
      let body: { url?: string; error?: string } = {};
      try {
        body = JSON.parse(xhr.responseText);
      } catch {}
      if (xhr.status >= 200 && xhr.status < 300 && body.url) resolve(body.url);
      else reject(new Error(body.error ?? "Upload failed."));
    };
    xhr.onerror = () => reject(new Error("Network error during upload."));
    const fd = new FormData();
    fd.append("file", file);
    xhr.send(fd);
  });
}

export function ImageManager({
  items,
  onChange,
  onToast,
}: {
  items: ImageItem[];
  onChange: (updater: (prev: ImageItem[]) => ImageItem[]) => void;
  onToast: (title: string, description?: string) => void;
}) {
  const [dragOver, setDragOver] = useState(false);
  const picker = useRef<HTMLInputElement>(null);
  const previews = useRef(new Set<string>());

  useEffect(() => {
    const set = previews.current;
    return () => set.forEach((u) => URL.revokeObjectURL(u));
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const patch = useCallback(
    (id: string, p: Partial<ImageItem>) => onChange((prev) => prev.map((it) => (it.id === id ? { ...it, ...p } : it))),
    [onChange],
  );

  const start = useCallback(
    (item: ImageItem) => {
      if (!item.file) return;
      patch(item.id, { status: "uploading", progress: 0, error: undefined });
      uploadFile(item.file, (p) => patch(item.id, { progress: p }))
        .then((url) => patch(item.id, { url, status: "done", progress: 1 }))
        .catch((e: Error) => {
          patch(item.id, { status: "error", error: e.message });
          onToast("Upload failed", e.message);
        });
    },
    [patch, onToast],
  );

  const addFiles = (list: FileList | File[]) => {
    const files = Array.from(list);
    const room = UPLOAD.maxFiles - items.length;
    const accepted: ImageItem[] = [];
    for (const f of files) {
      if (!(UPLOAD.acceptedTypes as readonly string[]).includes(f.type)) {
        onToast("Unsupported file", `${f.name} is not a JPEG, PNG, WebP or AVIF image.`);
        continue;
      }
      if (f.size > UPLOAD.maxBytes) {
        onToast("File too large", `${f.name} exceeds ${Math.round(UPLOAD.maxBytes / 1024 / 1024)} MB.`);
        continue;
      }
      if (accepted.length >= room) {
        onToast("Image limit reached", `Up to ${UPLOAD.maxFiles} images per piece.`);
        break;
      }
      const preview = URL.createObjectURL(f);
      previews.current.add(preview);
      accepted.push({ id: crypto.randomUUID(), preview, file: f, progress: 0, status: "uploading" });
    }
    if (!accepted.length) return;
    onChange((prev) => [...prev, ...accepted]);
    accepted.forEach(start);
  };

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    onChange((prev) =>
      moveItem(
        prev,
        prev.findIndex((i) => i.id === active.id),
        prev.findIndex((i) => i.id === over.id),
      ),
    );
  };

  return (
    <div>
      <div
        onDragOver={(e) => {
          if (!e.dataTransfer.types.includes("Files")) return;
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOver(false);
        }}
        onDrop={(e) => {
          if (!e.dataTransfer.files.length) return;
          e.preventDefault();
          setDragOver(false);
          addFiles(e.dataTransfer.files);
        }}
        className={cn(
          "relative rounded-[20px] border border-dashed p-3 transition-colors duration-300",
          dragOver ? "border-accent bg-accent-soft/60" : "border-line-strong bg-sunken/40",
        )}
      >
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={items.map((i) => i.id)} strategy={rectSortingStrategy}>
            <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              <AnimatePresence initial={false}>
                {items.map((item, i) => (
                  <Thumb
                    key={item.id}
                    item={item}
                    primary={i === 0}
                    onRemove={() => onChange((prev) => prev.filter((x) => x.id !== item.id))}
                    onPrimary={() => onChange((prev) => moveItem(prev, i, 0))}
                    onRetry={() => start(item)}
                  />
                ))}
              </AnimatePresence>
              {items.length < UPLOAD.maxFiles ? (
                <li className={cn(items.length === 0 && "col-span-3 sm:col-span-4")}>
                  <button
                    type="button"
                    onClick={() => picker.current?.click()}
                    className={cn(
                      "group flex w-full flex-col items-center justify-center gap-2 rounded-[14px] border border-line bg-raised/60 text-ink-soft transition-colors hover:border-accent/50 hover:text-accent",
                      items.length === 0 ? "py-12" : "aspect-[4/5]",
                    )}
                  >
                    <motion.span
                      animate={dragOver ? { y: -4, scale: 1.1 } : { y: 0, scale: 1 }}
                      className="grid h-11 w-11 place-items-center rounded-full border border-line bg-surface-solid transition-transform duration-500 group-hover:-translate-y-1"
                    >
                      <ImagePlus size={18} strokeWidth={1.4} />
                    </motion.span>
                    <span className="text-[0.78rem] font-medium">
                      {items.length === 0 ? "Drop images here, or browse" : "Add"}
                    </span>
                    {items.length === 0 ? (
                      <span className="text-[0.7rem] text-ink-faint">
                        JPEG, PNG, WebP, AVIF · up to {Math.round(UPLOAD.maxBytes / 1024 / 1024)} MB · first image is the cover
                      </span>
                    ) : null}
                  </button>
                </li>
              ) : null}
            </ul>
          </SortableContext>
        </DndContext>
        <input
          ref={picker}
          type="file"
          accept={UPLOAD.acceptedTypes.join(",")}
          multiple
          hidden
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}

function Thumb({
  item,
  primary,
  onRemove,
  onPrimary,
  onRetry,
}: {
  item: ImageItem;
  primary: boolean;
  onRemove: () => void;
  onPrimary: () => void;
  onRetry: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const src = item.preview ?? item.url;
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition, zIndex: isDragging ? 10 : undefined }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: isDragging ? 1.04 : 1 }}
        exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
        className={cn(
          "group relative aspect-[4/5] overflow-hidden rounded-[14px] border bg-sunken",
          primary ? "border-accent/60" : "border-line",
          isDragging ? "shadow-lift" : "shadow-soft",
        )}
      >
        {src ? (
          <img
            src={src}
            alt=""
            draggable={false}
            className={cn(
              "h-full w-full object-cover transition-[transform,opacity] duration-[1200ms] ease-[var(--ease-silk)] group-hover:scale-[1.05]",
              item.status === "uploading" && "opacity-60",
            )}
          />
        ) : null}

        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label={`Reorder image${primary ? " (cover)" : ""}. Press space, then arrow keys.`}
          className="absolute inset-0 cursor-grab active:cursor-grabbing"
        />

        <span className="pointer-events-none absolute left-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-raised/80 text-ink-faint opacity-0 transition-opacity group-hover:opacity-100">
          <GripVertical size={12} strokeWidth={1.6} />
        </span>

        {primary ? (
          <span className="pointer-events-none absolute bottom-1.5 left-1.5 inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-accent-ink">
            <Star size={9} strokeWidth={2} fill="currentColor" /> Cover
          </span>
        ) : item.status === "done" ? (
          <button
            type="button"
            onClick={onPrimary}
            className="absolute bottom-1.5 left-1.5 inline-flex translate-y-1 items-center gap-1 rounded-full bg-raised/90 px-2 py-0.5 text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-ink opacity-0 transition-all duration-300 hover:text-accent focus-visible:translate-y-0 focus-visible:opacity-100 group-hover:translate-y-0 group-hover:opacity-100 [@media(hover:none)]:translate-y-0 [@media(hover:none)]:opacity-100"
          >
            <Star size={9} strokeWidth={2} /> Set cover
          </button>
        ) : null}

        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove image"
          className="absolute right-1.5 top-1.5 grid h-6 w-6 scale-75 place-items-center rounded-full bg-raised/90 text-ink opacity-0 transition-all duration-300 hover:bg-accent hover:text-accent-ink focus-visible:scale-100 focus-visible:opacity-100 group-hover:scale-100 group-hover:opacity-100 [@media(hover:none)]:scale-100 [@media(hover:none)]:opacity-100"
        >
          <X size={12} strokeWidth={1.8} />
        </button>

        <AnimatePresence>
          {item.status === "uploading" ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { delay: 0.2 } }}
              className="pointer-events-none absolute inset-x-2 bottom-2"
            >
              <div className="h-[3px] overflow-hidden rounded-full bg-raised/70">
                <motion.div
                  className="h-full origin-left rounded-full bg-accent"
                  animate={{ scaleX: Math.max(0.04, item.progress) }}
                  transition={{ ease: "easeOut", duration: 0.25 }}
                />
              </div>
              <p className="mt-1 text-right text-[0.6rem] font-semibold tabular-nums text-ink">
                {Math.round(item.progress * 100)}%
              </p>
            </motion.div>
          ) : null}
          {item.status === "error" ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-surface-solid/85 p-2 text-center"
            >
              <CircleAlert size={16} strokeWidth={1.5} className="text-accent" />
              <span className="line-clamp-2 text-[0.65rem] text-ink-soft">{item.error}</span>
              <button
                type="button"
                onClick={onRetry}
                className="relative z-10 inline-flex items-center gap-1 rounded-full border border-line px-2 py-0.5 text-[0.62rem] font-semibold text-ink hover:text-accent"
              >
                <RotateCcw size={10} strokeWidth={1.8} /> Retry
              </button>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.div>
    </li>
  );
}
