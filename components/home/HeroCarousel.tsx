import Link from "next/link";
import { useEffect, useState } from "react";

import type { MediaSummary } from "@/lib/tmdb";
import { getBackdropResponsiveUrls } from "@/lib/tmdb/image";
import { getMediaHref, getPlayHref, getYear } from "@/lib/utils/media";

import { StarIcon } from "@/components/ui/icons";

const HERO_AUTOPLAY_MS = 6000;

interface HeroCarouselProps {
  items: MediaSummary[];
  genreNames: Record<number, string>;
}

function getGenreNames(item: MediaSummary, genreNames: Record<number, string>): string[] {
  return item.genreIds
    .map((id) => genreNames[id])
    .filter((name): name is string => Boolean(name));
}

export function HeroCarousel({ items, genreNames }: HeroCarouselProps) {
  const length = items.length;
  const [index, setIndex] = useState(0);
  const [animate, setAnimate] = useState(true);

  useEffect(() => {
    if (length <= 1) {
      return;
    }

    const interval = setInterval(() => {
      setIndex((current) => (current + 1) % (length * 2));
    }, HERO_AUTOPLAY_MS);

    return () => clearInterval(interval);
  }, [length]);

  useEffect(() => {
    if (index >= length) {
      setAnimate(false);
      setIndex(index - length);
    } else {
      setAnimate(true);
    }
  }, [index, length]);

  if (length === 0) {
    return null;
  }

  const track = [...items, ...items];

  return (
    <div className="relative h-[80vh] min-h-[420px] overflow-hidden bg-neo-bg md:h-[85vh]">
      <div
        className="flex h-full"
        style={{
          transform: `translateX(-${index * 100}%)`,
          transition: animate ? "transform 700ms ease-out" : "none",
        }}
      >
        {track.map((item, slideIndex) => (
          <HeroSlide
            key={`${item.id}-${slideIndex}`}
            item={item}
            genreNames={genreNames}
          />
        ))}
      </div>
    </div>
  );
}

interface HeroSlideProps {
  item: MediaSummary;
  genreNames: Record<number, string>;
}

function HeroSlide({ item, genreNames }: HeroSlideProps) {
  const { mobile, desktop } = getBackdropResponsiveUrls(item.backdropPath);
  const year = getYear(item.releaseDate);
  const genres = getGenreNames(item, genreNames);
  const playHref = getPlayHref(item.mediaType, item.id);
  const mediaHref = getMediaHref(item.mediaType, item.id);

  return (
    <div className="relative h-full w-full shrink-0 bg-neo-bg">
      <div className="absolute inset-0 h-full w-full overflow-hidden will-change-transform">
        {mobile ? (
          <picture>
            {desktop ? <source media="(min-width: 768px)" srcSet={desktop} /> : null}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={mobile}
              alt={item.title}
              fetchPriority="high"
              className="absolute inset-0 h-full w-full object-cover object-[center_28%]"
            />
          </picture>
        ) : null}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-[10%] -right-[10%] z-[1] h-[55%] w-1/2 bg-[radial-gradient(rgba(220,38,38,0.14)_0px,rgba(220,38,38,0.06)_30%,rgba(0,0,0,0)_60%)] blur-[40px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-0 right-0 top-0 z-[2] h-[180px] bg-gradient-to-b from-[#05070a]/75 to-transparent"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[2]"
          style={{
            background:
              "linear-gradient(rgba(5, 7, 10, 0) 40%, rgba(5, 7, 10, 0.92) 88%, rgb(5, 7, 10) 100%), linear-gradient(90deg, rgba(5, 7, 10, 0.78) 0px, rgba(5, 7, 10, 0.35) 42%, rgba(5, 7, 10, 0) 65%), linear-gradient(rgba(5, 7, 10, 0.6) 0px, rgba(5, 7, 10, 0) 35%)",
          }}
        />
      </div>

      <div className="absolute inset-0 z-[3] flex items-end pb-20">
        <div className="layout-container w-full">
          <div className="max-w-2xl">
            <h2 className="font-sans text-2xl font-black uppercase leading-[0.95] tracking-[-0.03em] text-text-hi drop-shadow-[0_8px_24px_rgba(0,0,0,0.55)] md:text-4xl xl:text-5xl">
              {item.title}
            </h2>

            <div className="mt-[18px] mb-[10px] inline-flex flex-wrap items-center gap-[10px_14px] text-[13px] leading-none text-text-hi">
              <span className="inline-flex items-center gap-1.5 font-medium tracking-[0.02em] text-accent-hi">
                <StarIcon className="fill-primary text-primary" size={12} />
                {item.voteAverage.toFixed(1)}
              </span>
              <span aria-hidden="true" className="inline-block h-[3px] w-[3px] rounded-full bg-[rgba(238,241,246,0.35)]" />
              {year ? <span className="tracking-[0.02em] text-[rgba(238,241,246,0.85)]">{year}</span> : null}
              {genres.map((genre) => (
                <span key={genre} className="inline-flex items-center gap-1.5 text-[rgba(238,241,246,0.85)]">
                  <span aria-hidden="true" className="inline-block h-[3px] w-[3px] rounded-full bg-[rgba(238,241,246,0.35)]" />
                  {genre}
                </span>
              ))}
            </div>

            <p className="line-clamp-3 max-w-[560px] text-[15px] leading-[1.55] tracking-[0.01em] text-[rgba(238,241,246,0.82)]">
              {item.overview}
            </p>

            <div className="mt-[22px] flex items-center gap-3">
              <Link href={playHref}>
                <button
                  type="button"
                  className="flex h-11 w-11 items-center justify-center rounded-full font-medium tracking-tight transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-neo-bg active:scale-[0.98] md:h-auto md:w-auto md:gap-3 md:rounded-full md:px-7 md:py-2.5 bg-text-hi hover:bg-white hover:shadow-glow"
                  style={{ color: "#05070a" }}
                >
                  <svg
                    className="h-5 w-5 text-[#05070a] md:h-[22px] md:w-[22px]"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <polygon points="5,3 19,12 5,21" />
                  </svg>
                  <span className="hidden md:inline">Play</span>
                </button>
              </Link>
              <Link href={mediaHref}>
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 rounded-full border border-text-hi/10 px-4 py-2 font-medium tracking-tight text-text-hi transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-neo-bg active:scale-[0.98] hover:border-primary/40 hover:shadow-glow md:gap-3 md:px-6 md:py-2.5"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-info text-text-hi"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4" />
                    <path d="M12 8h.01" />
                  </svg>
                  <span>See More</span>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
