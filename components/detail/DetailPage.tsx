import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";

import type { MovieDetails, TvDetails } from "@/lib/tmdb";
import { getBackdropUrl, getPosterUrl } from "@/lib/tmdb/image";
import {
  formatRuntime,
  getMediaHref,
  getPlayHref,
  getYear,
} from "@/lib/utils/media";

import { useAuth } from "@/components/auth/AuthProvider";
import { CastRow } from "@/components/detail/CastRow";
import { EpisodesSection } from "@/components/detail/EpisodesSection";
import { RecommendationsRow } from "@/components/detail/RecommendationsRow";
import { PlayerShell } from "@/components/player/PlayerShell";
import { RatingBadge } from "@/components/ui/RatingBadge";

type DetailData = MovieDetails | TvDetails;

interface DetailPageProps {
  details: DetailData;
  isPlaying: boolean;
}

export function DetailPage({ details, isPlaying }: DetailPageProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [isMuted, setIsMuted] = useState(true);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [isWatchlistLoading, setIsWatchlistLoading] = useState(false);
  const [showSimilar, setShowSimilar] = useState(false);
  const similarRef = useRef<HTMLDivElement>(null);

  const mediaType = details.mediaType;
  const trailer = findTrailer(details.videos);
  const backdropUrl = getBackdropUrl(details.backdropPath, "original");
  const posterUrl = getPosterUrl(details.posterPath, "w500");
  const year = getYear(details.releaseDate);
  const runtime =
    "runtime" in details ? details.runtime : details.episodeRunTime[0] ?? null;
  const runtimeLabel = formatRuntime(runtime);

  useEffect(() => {
    if (!user) {
      setInWatchlist(false);
      return;
    }

    let isMounted = true;

    fetch(`/api/watchlist/${mediaType}/${details.id}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { inWatchlist?: boolean } | null) => {
        if (isMounted && data && typeof data.inWatchlist === "boolean") {
          setInWatchlist(data.inWatchlist);
        }
      })
      .catch(() => {
        if (isMounted) {
          setInWatchlist(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [user, mediaType, details.id]);

  const toggleWatchlist = async () => {
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(router.asPath)}`);
      return;
    }

    setIsWatchlistLoading(true);

    try {
      if (inWatchlist) {
        const response = await fetch(`/api/watchlist/${mediaType}/${details.id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          setInWatchlist(false);
        }
      } else {
        const response = await fetch("/api/watchlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mediaType,
            mediaId: details.id,
            title: details.title,
            posterPath: details.posterPath,
            backdropPath: details.backdropPath,
          }),
        });

        if (response.ok) {
          setInWatchlist(true);
        }
      }
    } finally {
      setIsWatchlistLoading(false);
    }
  };

  const closePlayer = () => {
    router.push(getMediaHref(mediaType, details.id));
  };

  if (isPlaying) {
    return (
      <PlayerShell
        title={details.title}
        subtitle={year || undefined}
        media={{ mediaType, mediaId: details.id }}
        onBack={closePlayer}
      />
    );
  }

  const scrollToSimilar = () => {
    similarRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div>
      <div className="relative w-full overflow-hidden bg-background">
        <div className="relative aspect-video w-full sm:h-[520px]">
          {trailer ? (
            // eslint-disable-next-line react/iframe-missing-sandbox
            <iframe
              key={isMuted ? "muted" : "unmuted"}
              src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&showinfo=0&iv_load_policy=3&modestbranding=1&playsinline=1&disablekb=1&fs=0&rel=0`}
              title={`${details.title} trailer`}
              className="h-full w-full"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          ) : backdropUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={backdropUrl} alt="" className="h-full w-full object-cover" />
          ) : null}

          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(rgba(5,7,10,0) 40%, rgba(5,7,10,0.92) 88%, rgb(5,7,10) 100%), linear-gradient(90deg, rgba(5,7,10,0.78) 0, rgba(5,7,10,0.35) 42%, rgba(5,7,10,0) 65%)",
            }}
          />

          {trailer ? (
            <button
              type="button"
              onClick={() => setIsMuted((muted) => !muted)}
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur transition-colors duration-150 hover:bg-primary"
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <MutedIcon className="h-4 w-4" /> : <VolumeIcon className="h-4 w-4" />}
            </button>
          ) : null}
        </div>
      </div>

      <div className="mx-auto max-w-screen-2xl">
        <div className="flex flex-col gap-6 px-4 pt-4 sm:flex-row sm:items-start sm:px-6 sm:pt-8">
          <div className="shrink-0">
            <div className="w-40 overflow-hidden rounded-[10px] bg-secondary sm:w-56">
              <div className="aspect-[2/3]">
                {posterUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={posterUrl} alt={details.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center p-3 text-center text-xs font-medium text-muted-foreground">
                    {details.title}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="text-[32px] font-black uppercase leading-tight tracking-[0.05em] sm:text-[40px]">
              {details.title}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[13px] text-foreground/80">
              {details.voteAverage > 0 && <RatingBadge score={details.voteAverage} />}
              {year && <span>{year}</span>}
              {runtimeLabel && <span>{runtimeLabel}</span>}
              {details.certification && (
                <span className="rounded border border-border px-1.5 py-0.5 text-[11px] font-medium">
                  {details.certification}
                </span>
              )}
            </div>

            {details.genres.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {details.genres.map((genre) => (
                  <span
                    key={genre.id}
                    className="rounded-full border border-white/20 px-3 py-1 text-[11px] font-medium text-foreground/90"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            ) : null}

            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {details.overview || "No overview available."}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href={getPlayHref(mediaType, details.id)}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-7 text-sm font-medium text-primary-foreground transition-colors duration-150 hover:bg-primary/80"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Play
              </Link>

              <button
                type="button"
                aria-label={inWatchlist ? "Remove from watchlist" : "Add to watchlist"}
                onClick={toggleWatchlist}
                disabled={isWatchlistLoading}
                className={`flex h-11 w-11 items-center justify-center rounded-full border transition-colors duration-150 disabled:opacity-60 ${
                  inWatchlist
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <HeartIcon className="h-5 w-5" filled={inWatchlist} />
              </button>

              <button
                type="button"
                aria-label="Download"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors duration-150 hover:bg-secondary hover:text-foreground"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                </svg>
              </button>

              {mediaType === "tv" ? (
                <button
                  type="button"
                  onClick={() => setShowSimilar(false)}
                  className="inline-flex h-11 items-center rounded-full border border-border px-6 text-sm font-medium text-foreground transition-colors duration-150 hover:bg-secondary"
                >
                  Episodes
                </button>
              ) : null}

              <button
                type="button"
                onClick={() => {
                  setShowSimilar(true);
                  window.setTimeout(scrollToSimilar, 50);
                }}
                className="inline-flex h-11 items-center rounded-full border border-border px-6 text-sm font-medium text-foreground transition-colors duration-150 hover:bg-secondary"
              >
                Similars
              </button>
            </div>
          </div>
        </div>

        <div ref={similarRef} className="scroll-mt-16">
          {"seasons" in details && !showSimilar ? (
            <EpisodesSection tvId={details.id} seasons={details.seasons} />
          ) : null}

          {mediaType === "movie" ? <CastRow cast={details.cast} /> : null}

          {mediaType === "movie" ? (
            <RecommendationsRow title="You may like" items={details.recommendations} />
          ) : null}

          {showSimilar ? (
            <RecommendationsRow
              title={mediaType === "tv" ? "You may like" : "Similars"}
              items={details.similar}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

function findTrailer(videos: MovieDetails["videos"]): (MovieDetails["videos"])[number] | undefined {
  const youtubeVideos = videos.filter((video) => video.site.toLowerCase() === "youtube");

  return (
    youtubeVideos.find((video) => video.type === "Trailer") ??
    youtubeVideos.find((video) => video.type === "Teaser") ??
    youtubeVideos[0]
  );
}

function MutedIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 5 6 9H2v6h4l5 4V5z" />
      <line x1="22" x2="16" y1="9" y2="15" />
      <line x1="16" x2="22" y1="9" y2="15" />
    </svg>
  );
}

function VolumeIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 5 6 9H2v6h4l5 4V5z" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}

function HeartIcon({ className, filled }: { className: string; filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}