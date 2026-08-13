import type { MediaType } from "@/lib/tmdb";
import { getMediaTypeLabel } from "@/lib/utils/media";

interface MediaTypeBadgeProps {
  mediaType: MediaType;
  className?: string;
}

export function MediaTypeBadge({ mediaType, className = "" }: MediaTypeBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border border-white/20 px-2 py-0.5 text-[11px] font-medium text-foreground/90 ${className}`}
    >
      {getMediaTypeLabel(mediaType)}
    </span>
  );
}