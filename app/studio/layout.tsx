import { requireAdmin } from "@/lib/auth/session";
import { StudioHeader } from "@/components/shell/StudioHeader";

export default async function StudioLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="min-h-dvh">
      <a
        href="#main"
        className="sr-only z-[90] rounded-full bg-accent px-4 py-2 text-accent-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <StudioHeader />
      <main id="main" className="mx-auto w-full max-w-7xl px-4 pb-24 pt-8 sm:px-6 lg:px-10">
        {children}
      </main>
    </div>
  );
}
