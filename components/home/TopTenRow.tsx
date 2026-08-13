import Link from "next/link";

import type { MediaSummary } from "@/lib/tmdb";
import { getPosterUrl } from "@/lib/tmdb/image";
import { getMediaHref, getYear } from "@/lib/utils/media";

import { ContentRow } from "@/components/content/ContentRow";
import { MediaTypeBadge } from "@/components/ui/MediaTypeBadge";
import { RatingBadge } from "@/components/ui/RatingBadge";

interface TopTenRowProps {
  items: MediaSummary[];
}

export function TopTenRow({ items }: TopTenRowProps) {
  return (
    <ContentRow title="TOP 10 Today">
      {items.map((item, index) => (
        <TopTenCard key={item.id} media={item} rank={index + 1} />
      ))}
    </ContentRow>
  );
}

interface TopTenCardProps {
  media: MediaSummary;
  rank: number;
}

function TopTenCard({ media, rank }: TopTenCardProps) {
  const posterUrl = getPosterUrl(media.posterPath, "w342");
  const year = getYear(media.releaseDate);

  return (
    <Link
      href={getMediaHref(media.mediaType, media.id)}
      className="group flex items-end"
      aria-label={`${rank}. ${media.title}`}
    >
      <span
        className="select-none pr-1 text-[96px] font-black leading-[0.8] text-primary/40 transition-colors duration-300 group-hover:text-primary"
        aria-hidden="true"
      >
        {rank}
      </span>

      <div className="w-28 sm:w-32">
        <div className="relative aspect-[2/3] overflow-hidden rounded-[10px] bg-secondary transition-all duration-300 group-hover:scale-[1.04] group-hover:brightness-110">
          {posterUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={posterUrl} alt={media.title} loading="lazy" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center p-2 text-center text-[11px] font-medium text-muted-foreground">
              {media.title}
            </div>
          )}
        </div>

        <div className="mt-2 space-y-0.5">
          <h3 className="truncate text-[13px] font-medium leading-tight group-hover:text-primary">
            {media.title}
          </h3>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            {media.voteAverage > 0 && <RatingBadge score={media.voteAverage} />}
            {year && <span>{year}</span>}
            <MediaTypeBadge mediaType={media.mediaType} />
          </div>
        </div>
      </div>
    </Link>
  );
}