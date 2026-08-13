import Link from "next/link";

import type { MediaSummary } from "@/lib/tmdb";
import { getPosterResponsiveUrls } from "@/lib/tmdb/image";
import { getMediaHref, getYear } from "@/lib/utils/media";

import { StarIcon } from "@/components/ui/icons";

type CardVariant = "row" | "grid";

const VARIANT_WIDTH: Record<CardVariant, string> = {
  row: "w-36 sm:w-40",
  grid: "w-40 sm:w-44",
};

interface MovieCardProps {
  media: MediaSummary;
  variant?: CardVariant;
  rank?: number;
  className?: string;
}

function getTypeLabel(mediaType: MediaSummary["mediaType"]): string {
  return mediaType === "tv" ? "TV Show" : "Movie";
}

export function MovieCard({ media, variant, rank, className = "" }: MovieCardProps) {
  const { mobile, desktop } = getPosterResponsiveUrls(media.posterPath);
  const href = getMediaHref(media.mediaType, media.id);
  const year = getYear(media.releaseDate);
  const typeLabel = getTypeLabel(media.mediaType);
  const widthClass = variant ? VARIANT_WIDTH[variant] : "w-full";

  return (
    <div
      className={`group media-card media-card-vertical relative h-full cursor-pointer overflow-hidden ${widthClass} ${className}`}
    >
      <Link href={href} aria-label={media.title}>
        <div className="relative aspect-[2/3] overflow-hidden rounded-[10px] border border-surface-3 bg-surface-1 transition-[border-color,box-shadow] duration-200">
          <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-[#05070a]/[0.92] via-[#05070a]/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          {mobile ? (
            <picture>
              {desktop ? <source media="(min-width: 768px)" srcSet={desktop} /> : null}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={mobile}
                alt={media.title}
                loading="lazy"
                decoding="async"
                className="aspect-[2/3] h-full w-full object-cover object-top transition-transform duration-[550ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
              />
            </picture>
          ) : (
            <div className="flex aspect-[2/3] h-full w-full items-center justify-center p-3 text-center text-[11px] font-medium text-text-mid">
              {media.title}
            </div>
          )}
          {rank ? (
            <div
              aria-hidden="true"
              className="absolute left-0 top-0 z-[5] flex flex-col items-center justify-center overflow-hidden bg-primary font-bold text-white shadow-[0_4px_10px_var(--accent-glow)]"
              style={{
                width: "30px",
                height: "38px",
                padding: "5px 2px 7px",
                clipPath: "polygon(0px 0px, 100% 0px, 100% 100%, 50% 85%, 0px 100%)",
              }}
            >
              <span className="text-[9px] uppercase leading-tight tracking-wide">Top</span>
              <span className="-mt-0.5 text-[11px] tabular-nums leading-none">
                {String(rank).padStart(2, "0")}
              </span>
            </div>
          ) : null}
        </div>

        <div className="mt-2.5 px-0.5">
          <h3 className="line-clamp-1 text-[13px] font-medium leading-snug text-text-hi transition-colors duration-200 group-hover:text-primary">
            {media.title}
          </h3>
          <div className="mt-1 flex items-center gap-1.5 truncate text-[11px] leading-none text-text-mid">
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1">
                <StarIcon className="fill-primary/80 text-primary/80" />
                <span className="tabular-nums">{media.voteAverage.toFixed(1)}</span>
              </span>
            </span>
            {year ? (
              <span className="inline-flex items-center gap-1.5">
                <span aria-hidden="true" className="text-white/20">
                  ·
                </span>
                <span className="tabular-nums">{year}</span>
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden="true" className="text-white/20">
                ·
              </span>
              <span>{typeLabel}</span>
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}