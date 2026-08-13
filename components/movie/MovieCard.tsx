import Link from "next/link";

import type { MediaSummary } from "@/lib/tmdb";
import { getBackdropResponsiveUrls, getPosterResponsiveUrls } from "@/lib/tmdb/image";
import { getMediaHref, getYear } from "@/lib/utils/media";

import { StarIcon } from "@/components/ui/icons";

export type CardVariant = "poster" | "backdrop" | "grid";

const VARIANT_WIDTH: Record<CardVariant, string> = {
  poster: "w-[140px] xs:w-[150px] md:w-[180px] lg:w-[200px] flex-shrink-0",
  backdrop: "w-[240px] xs:w-[260px] md:w-[280px] lg:w-[320px] flex-shrink-0",
  grid: "w-full",
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

export function MovieCard({ media, variant = "poster", rank, className = "" }: MovieCardProps) {
  const poster = getPosterResponsiveUrls(media.posterPath);
  const backdrop = getBackdropResponsiveUrls(media.backdropPath || media.posterPath);
  const href = getMediaHref(media.mediaType, media.id);
  const year = getYear(media.releaseDate);
  const typeLabel = getTypeLabel(media.mediaType);
  const widthClass = VARIANT_WIDTH[variant];

  const isBackdrop = variant === "backdrop";

  return (
    <div className={`group ${widthClass} ${className}`}>
      <div className="media-card media-card-vertical w-full">
        <Link href={href} aria-label={media.title}>
          <div
            className={`relative w-full overflow-hidden rounded-[10px] border border-white/10 bg-surface-1 transition-all duration-200 ${
              isBackdrop ? "aspect-[16/9]" : "aspect-[2/3]"
            }`}
          >
            <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-[#05070a]/[0.92] via-[#05070a]/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            {isBackdrop ? (
              backdrop.mobile ? (
                <picture>
                  {backdrop.desktop ? (
                    <source media="(min-width: 768px)" srcSet={backdrop.desktop} />
                  ) : null}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={backdrop.mobile}
                    alt={media.title}
                    loading="lazy"
                    decoding="async"
                    className="aspect-[16/9] h-full w-full object-cover object-center transition-transform duration-[550ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
                  />
                </picture>
              ) : (
                <div className="flex aspect-[16/9] h-full w-full items-center justify-center p-3 text-center text-[11px] font-medium text-text-mid">
                  {media.title}
                </div>
              )
            ) : poster.mobile ? (
              <picture>
                {poster.desktop ? <source media="(min-width: 768px)" srcSet={poster.desktop} /> : null}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={poster.mobile}
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
                  <StarIcon size={10} className="fill-primary/80 text-primary/80" />
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
    </div>
  );
}