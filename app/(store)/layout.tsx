import { StoreHeader } from "@/components/store/StoreHeader";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      <StoreHeader />
      <main className="mx-auto w-full max-w-7xl px-4 pb-24 sm:px-6 lg:px-10">{children}</main>
      <footer className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-10">
        <div className="hairline" />
        <p className="mt-6 text-center text-xs tracking-[0.2em] text-ink-faint">RANGRITI · WOMEN&apos;S ETHNIC WEAR</p>
      </footer>
    </div>
  );
}
