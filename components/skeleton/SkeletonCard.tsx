type SkeletonVariant = "row" | "grid";

interface SkeletonCardProps {
  variant?: SkeletonVariant;
}

const VARIANT_WIDTHS: Record<SkeletonVariant, string> = {
  row: "w-36 sm:w-40",
  grid: "w-40 sm:w-44",
};

export function SkeletonCard({ variant = "row" }: SkeletonCardProps) {
  return (
    <div className={`block ${VARIANT_WIDTHS[variant]}`}>
      <div className="aspect-[2/3] animate-pulse rounded-[10px] bg-secondary" />
      <div className="mt-2 space-y-1.5">
        <div className="h-3 w-4/5 animate-pulse rounded bg-secondary" />
        <div className="h-2.5 w-2/5 animate-pulse rounded bg-secondary" />
      </div>
    </div>
  );
}

export function SkeletonCardGrid() {
  return (
    <div className="grid grid-cols-3 gap-4 px-4 sm:grid-cols-4 sm:px-6 md:grid-cols-5 lg:grid-cols-6">
      {Array.from({ length: 18 }).map((_, index) => (
        <SkeletonCard key={index} variant="grid" />
      ))}
    </div>
  );
}