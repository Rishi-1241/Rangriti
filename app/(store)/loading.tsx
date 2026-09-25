import { CardSkeleton, Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div role="status" aria-label="Loading collection" className="pt-14">
      <Skeleton className="h-3 w-28" />
      <Skeleton className="mt-5 h-20 w-full max-w-2xl" />
      <div className="mt-16 grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
