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
    <div className={`block ${variant === "grid" ? "w-full" : VARIANT_WIDTHS[variant]}`}>
      <div className={`animate-pulse rounded-[10px] bg-white/10 ${variant === "grid" ? "aspect-[16/9]" : "aspect-[2/3]"}`} />
      <div className="mt-2.5 space-y-1.5 px-0.5">
        <div className="h-3 w-4/5 animate-pulse rounded bg-white/10" />
        <div className="h-2.5 w-2/5 animate-pulse rounded bg-white/10" />
      </div>
    </div>
  );
}

export function SkeletonCardGrid() {
  return (
    <div className="mt-4 grid grid-cols-1 gap-4 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <SkeletonCard key={index} variant="grid" />
      ))}
    </div>
  );
}