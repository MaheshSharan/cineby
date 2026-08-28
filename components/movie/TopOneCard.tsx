import Link from "next/link";
import { useEffect, useState } from "react";

import type { MediaSummary } from "@/lib/tmdb";
import { getBackdropResponsiveUrls, getLogoUrl } from "@/lib/tmdb/image";
import { getMediaHref, getMediaTypeLabel, getYear } from "@/lib/utils/media";
import { StarIcon } from "@/components/ui/icons";

interface TopOneCardProps {
  media: MediaSummary;
  className?: string;
}

export function TopOneCard({ media, className = "" }: TopOneCardProps) {
  const [logoPath, setLogoPath] = useState<string | null>(null);
  const backdrop = getBackdropResponsiveUrls(media.backdropPath || media.posterPath);
  const href = getMediaHref(media.mediaType, media.id);
  const year = getYear(media.releaseDate);
  const typeLabel = getMediaTypeLabel(media.mediaType);
  const logoUrl = getLogoUrl(logoPath);

  useEffect(() => {
    if (logoPath) return;

    let isCurrent = true;
    fetch(`/api/tmdb/${media.mediaType}/${media.id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isCurrent && data?.logoPath) {
          setLogoPath(data.logoPath);
        }
      })
      .catch(() => {});

    return () => {
      isCurrent = false;
    };
  }, [media.id, media.mediaType, logoPath]);

  return (
    <div className={`group w-[280px] xs:w-[340px] md:w-[480px] lg:w-[616px] flex-shrink-0 ${className}`}>
      <div className="w-full">
        <div className="relative h-[220px] xs:h-[240px] md:h-[270px] lg:h-[300px] w-full overflow-hidden rounded-[10px] border border-white/10 bg-[#0b0f14]">
          {/* Backdrop Image */}
          {backdrop.mobile ? (
            <picture>
              {backdrop.desktop ? <source media="(min-width: 768px)" srcSet={backdrop.desktop} /> : null}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={backdrop.desktop || backdrop.mobile}
                alt=""
                aria-hidden="true"
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover object-center transition-transform duration-[550ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
              />
            </picture>
          ) : (
            <div className="h-full w-full bg-surface-1" />
          )}

          {/* Left / Bottom Gradient Wash */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(5, 7, 10, 0.94) 0%, rgba(5, 7, 10, 0.78) 32%, rgba(5, 7, 10, 0.3) 62%, rgba(5, 7, 10, 0.05) 100%), linear-gradient(180deg, rgba(0,0,0,0) 60%, rgba(5,7,10,0.55) 100%)",
            }}
          />

          {/* Rank Badge */}
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
            <span className="-mt-0.5 text-[11px] tabular-nums leading-none">01</span>
          </div>

          {/* Wide Body Info Overlay */}
          <Link
            href={href}
            className="absolute inset-0 z-10 flex flex-col justify-end p-4 md:p-6 max-w-[85%] sm:max-w-[75%] md:max-w-[65%]"
          >
            {logoUrl ? (
              <div className="mb-2 max-w-[180px] xs:max-w-[220px] md:max-w-[280px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logoUrl}
                  alt={media.title}
                  className="max-h-12 xs:max-h-14 md:max-h-16 w-auto object-contain object-left drop-shadow-[0_4px_14px_rgba(0,0,0,0.7)]"
                />
              </div>
            ) : (
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-white line-clamp-1 group-hover:text-primary transition-colors">
                {media.title}
              </h3>
            )}

            {year || typeLabel ? (
              <span className="text-[11px] md:text-xs font-medium text-white/60 mt-1">
                {[year, typeLabel].filter(Boolean).join(" · ")}
              </span>
            ) : null}

            {media.overview ? (
              <p className="text-[11px] md:text-[12.5px] leading-relaxed text-white/75 line-clamp-2 md:line-clamp-3 mt-1.5">
                {media.overview}
              </p>
            ) : null}
          </Link>
        </div>

        {/* Bottom Label below card */}
        <Link href={href} className="block mt-2.5 px-0.5">
          <h3 className="text-[13px] font-medium leading-snug text-text-hi line-clamp-1 transition-colors duration-200 group-hover:text-primary">
            {media.title}
          </h3>
          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-text-mid leading-none truncate">
            {media.voteAverage > 0 ? (
              <span className="inline-flex items-center gap-1">
                <StarIcon size={10} className="fill-primary text-primary" />
                <span className="tabular-nums">{media.voteAverage.toFixed(1)}</span>
              </span>
            ) : null}
            {year ? (
              <>
                <span className="text-white/20" aria-hidden="true">·</span>
                <span className="tabular-nums">{year}</span>
              </>
            ) : null}
            {typeLabel ? (
              <>
                <span className="text-white/20" aria-hidden="true">·</span>
                <span>{typeLabel}</span>
              </>
            ) : null}
          </div>
        </Link>
      </div>
    </div>
  );
}
