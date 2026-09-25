import Link from "next/link";
import { buttonClass } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center px-6 text-center">
      <p className="eyebrow !text-accent">Not found</p>
      <h1 className="mt-4 text-6xl text-ink">This page is not in the collection</h1>
      <p className="mt-4 text-sm leading-6 text-ink-soft">It may have been removed, or the link is incomplete.</p>
      <Link href="/studio" className={buttonClass("secondary", "md", "mt-8")}>
        Return to catalogue
      </Link>
    </main>
  );
}
