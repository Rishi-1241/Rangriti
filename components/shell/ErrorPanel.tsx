"use client";

import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { Button, buttonClass } from "@/components/ui/Button";

export function ErrorPanel({
  title = "Something slipped a stitch",
  message,
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center py-24 text-center">
      <p className="eyebrow !text-accent">Interrupted</p>
      <h1 className="mt-4 text-5xl text-ink">{title}</h1>
      <p className="mt-4 text-sm leading-6 text-ink-soft">
        {message ?? "We could not complete that request. Please try again in a moment."}
      </p>
      <div className="mt-8 flex gap-3">
        {onRetry ? (
          <Button onClick={onRetry}>
            <RotateCcw size={15} strokeWidth={1.5} className="transition-transform duration-500 group-hover:-rotate-180" />
            Try again
          </Button>
        ) : null}
        <Link href="/studio" className={buttonClass("secondary")}>
          Catalogue
        </Link>
      </div>
    </div>
  );
}
