import { SkeletonCard } from "@/components/skeleton/SkeletonCard";

interface SkeletonRowProps {
  count?: number;
}

export function SkeletonRow({ count = 12 }: SkeletonRowProps) {
  return (
    <section className="py-6" aria-hidden="true">
      <div className="mb-3 h-6 w-40 animate-pulse rounded bg-secondary px-4 sm:px-6" />
      <div className="no-scrollbar flex gap-4 overflow-hidden px-4 sm:px-6">
        {Array.from({ length: count }).map((_, index) => (
          <SkeletonCard key={index} variant="row" />
        ))}
      </div>
    </section>
  );
}