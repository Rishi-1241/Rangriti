import { CardSkeleton, Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div role="status" aria-label="Loading catalogue">
      <Skeleton className="h-3 w-28" />
      <Skeleton className="mt-4 h-12 w-72" />
      <Skeleton className="mt-8 h-14 w-full max-w-xl !rounded-2xl" />
      <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
