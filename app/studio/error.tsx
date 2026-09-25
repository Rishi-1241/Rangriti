"use client";

import { useEffect } from "react";
import { ErrorPanel } from "@/components/shell/ErrorPanel";

export default function StudioError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return <ErrorPanel onRetry={reset} />;
}
