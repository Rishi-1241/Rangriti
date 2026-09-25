import { cn } from "@/lib/cn";

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("shimmer rounded-xl", className)} />;
}

export function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[22px] border border-line bg-surface">
      <Skeleton className="aspect-[4/5] !rounded-none" />
      <div className="space-y-2.5 p-3 sm:space-y-3 sm:p-5">
        <Skeleton className="h-2.5 w-20" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}
