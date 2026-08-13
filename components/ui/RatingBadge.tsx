interface RatingBadgeProps {
  score: number;
  className?: string;
}

export function RatingBadge({ score, className = "" }: RatingBadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 text-[13px] font-medium ${className}`}>
      <StarIcon className="h-3.5 w-3.5 fill-primary text-primary" />
      {score.toFixed(1)}
    </span>
  );
}

function StarIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  );
}