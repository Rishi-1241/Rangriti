import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div role="status" aria-label="Loading piece">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-5 h-12 w-80" />
      <div className="mt-10 grid gap-8 lg:grid-cols-[5fr_7fr]">
        <Skeleton className="h-[28rem] !rounded-[26px]" />
        <div className="space-y-6">
          <Skeleton className="h-80 !rounded-[26px]" />
          <Skeleton className="h-64 !rounded-[26px]" />
        </div>
      </div>
    </div>
  );
}
