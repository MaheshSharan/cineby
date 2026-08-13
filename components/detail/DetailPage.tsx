import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";

import type { MovieDetails, TvDetails } from "@/lib/tmdb";
import { getHeroBackdropUrl, getLogoUrl } from "@/lib/tmdb/image";
import {
  addToWatchlist,
  checkWatchlist,
  removeFromWatchlist,
} from "@/lib/api/watchlist";
import { formatRuntime, getMediaHref, getPlayHref, getYear } from "@/lib/utils/media";

import { useAuth } from "@/components/auth/AuthProvider";
import { CastRow } from "@/components/detail/CastRow";
import { EpisodesSection } from "@/components/detail/EpisodesSection";
import { RecommendationsRow } from "@/components/detail/RecommendationsRow";
import { PlayerShell } from "@/components/player/PlayerShell";
import { PageLoader } from "@/components/ui/PageLoader";
import {
  ChevronLeftIcon,
  ListOrderedIcon,
  SparklesIcon,
  StarIcon,
} from "@/components/ui/icons";

type DetailData = MovieDetails | TvDetails;

interface DetailPageProps {
  details: DetailData;
  isPlaying: boolean;
}

const TRAILER_DELAY_MS = 5000;
const GRADIENT_TOP_BOTTOM =
  "linear-gradient(180deg, rgba(5, 7, 10, 0.55) 0%, rgba(5, 7, 10, 0) 25%, rgba(5, 7, 10, 0) 65%, rgb(5, 7, 10) 100%)";
const TRAILER_GRADIENT_TOP_BOTTOM =
  "linear-gradient(180deg, rgba(5, 7, 10, 0.4) 0%, rgba(5, 7, 10, 0) 25%, rgba(5, 7, 10, 0) 60%, rgb(5, 7, 10) 100%)";
const GRADIENT_LEFT_RIGHT =
  "linear-gradient(90deg, rgba(5, 7, 10, 0.82) 0%, rgba(5, 7, 10, 0.45) 45%, rgba(5, 7, 10, 0) 70%)";
const TRAILER_GRADIENT_LEFT_RIGHT =
  "linear-gradient(90deg, rgba(5, 7, 10, 0.78) 0%, rgba(5, 7, 10, 0.35) 50%, rgba(5, 7, 10, 0) 75%)";

export function DetailPage({ details, isPlaying }: DetailPageProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [isMuted, setIsMuted] = useState(true);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [isWatchlistLoading, setIsWatchlistLoading] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);
  const [showOverview, setShowOverview] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [trailerReady, setTrailerReady] = useState(false);
  const [isPageReady, setIsPageReady] = useState(false);

  const trailer = findTrailer(details.videos);
  const heroBackdrop = getHeroBackdropUrl(details.backdropPath);
  const isTv = details.mediaType === "tv";

  useEffect(() => {
    if (isTv) {
      return;
    }

    const id = window.requestAnimationFrame(() => setIsPageReady(true));

    return () => window.cancelAnimationFrame(id);
  }, [isTv]);

  useEffect(() => {
    const timer = window.setTimeout(() => setHasEntered(true), 150);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!trailer) {
      return;
    }

    const timer = window.setTimeout(() => setShowTrailer(true), TRAILER_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [trailer]);

  useEffect(() => {
    if (!user) {
      setInWatchlist(false);
      return;
    }

    let isCurrent = true;

    checkWatchlist(details.mediaType, details.id)
      .then((result) => {
        if (isCurrent) {
          setInWatchlist(result);
        }
      })
      .catch(() => {
        // Watchlist status is best-effort; default to "not in watchlist" on failure.
        if (isCurrent) {
          setInWatchlist(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [details.id, details.mediaType, user]);

  const handleWatchlist = async () => {
    if (!user) {
      await router.push(`/login?next=${encodeURIComponent(router.asPath)}`);
      return;
    }

    setIsWatchlistLoading(true);

    try {
      const success = inWatchlist
        ? await removeFromWatchlist(details.mediaType, details.id)
        : await addToWatchlist({
            mediaType: details.mediaType,
            mediaId: details.id,
            title: details.title,
            posterPath: details.posterPath,
            backdropPath: details.backdropPath,
          });

      if (success) {
        setInWatchlist(!inWatchlist);
      }
    } catch {
      // Watchlist toggle failed — keep current state; user can retry.
    } finally {
      setIsWatchlistLoading(false);
    }
  };

  const handleEpisodeReady = useCallback(() => {
    setIsPageReady(true);
  }, []);

  if (isPlaying) {
    return (
      <PlayerShell
        title={details.title}
        subtitle={
          details.releaseDate ? getYear(details.releaseDate) || undefined : undefined
        }
        media={{ mediaType: details.mediaType, mediaId: details.id }}
        onBack={() => router.push(getMediaHref(details.mediaType, details.id))}
      />
    );
  }

  return (
    <div className="relative w-full bg-neo-bg text-white">
      {!isPageReady ? <PageLoader /> : null}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-50 px-6 py-5 md:px-8 md:py-6">
        <Link
          href="/"
          aria-label="Go back"
          className="pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.07] text-text-hi backdrop-blur-xl transition-all duration-200 hover:border-primary/40 hover:text-accent-hi hover:scale-[1.04]"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </Link>
      </div>

      <div className="relative w-full overflow-hidden" style={{ height: "80vh" }}>
        {heroBackdrop ? (
          <div
            className="absolute inset-0 h-full w-full bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${heroBackdrop})` }}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{ background: GRADIENT_LEFT_RIGHT }}
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{ background: GRADIENT_TOP_BOTTOM }}
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-10 -right-20 h-[45%] w-[55%]"
              style={{
                background:
                  "radial-gradient(rgba(220, 38, 38, 0.16) 0%, rgba(220, 38, 38, 0.06) 30%, rgba(0, 0, 0, 0) 60%)",
                filter: "blur(40px)",
              }}
            />
          </div>
        ) : null}

        {trailer && showTrailer ? (
          <div
            className="absolute inset-0 w-full overflow-hidden transition-opacity duration-300 ease-in-out"
            style={{ opacity: trailerReady ? 1 : 0 }}
          >
            {/* eslint-disable-next-line react/iframe-missing-sandbox */}
            <iframe
              key={isMuted ? "muted" : "unmuted"}
              src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&mute=${
                isMuted ? 1 : 0
              }&controls=0&showinfo=0&iv_load_policy=3&modestbranding=1&playsinline=1&enablejsapi=1&disablekb=1&fs=0&rel=0&origin=${
                typeof window !== "undefined" ? window.location.origin : ""
              }`}
              title="Background Trailer"
              className="h-full w-full"
              style={{
                transform: "scale(1.52)",
                transformOrigin: "center center",
                pointerEvents: "none",
              }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
              onLoad={() => setTrailerReady(true)}
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{ background: TRAILER_GRADIENT_LEFT_RIGHT }}
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{ background: TRAILER_GRADIENT_TOP_BOTTOM }}
            />
          </div>
        ) : null}

        {trailer ? (
          <button
            type="button"
            onClick={() => setIsMuted((muted) => !muted)}
            aria-label={isMuted ? "Unmute" : "Mute"}
            className="absolute right-6 top-6 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-white/[0.08] text-text-hi backdrop-blur-xl transition-all duration-200 hover:scale-[1.04] hover:border-primary/40 hover:text-accent-hi md:right-8 md:top-8"
            style={{
              background:
                "linear-gradient(rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.016) 100%)",
              boxShadow:
                "rgba(255,255,255,0.06) 0px 1px 0px inset, rgba(0,0,0,0.6) 0px 8px 18px -8px",
            }}
          >
            {isMuted ? <MutedIcon /> : <VolumeIcon />}
          </button>
        ) : null}

        <div className="relative z-10 flex h-full flex-col justify-end px-6 pb-10 md:px-12 lg:px-20 xl:px-24">
          <div
          className="w-full max-w-2xl text-left"
          onMouseEnter={() => setShowOverview(true)}
          onMouseLeave={() => setShowOverview(false)}
        >
            <div
              className={`origin-left transition-all duration-500 ease-out ${
                hasEntered ? "mb-5 scale-100" : "mb-2 scale-[0.8]"
              }`}
            >
              {details.logoPath ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={getLogoUrl(details.logoPath) ?? undefined}
                  alt={details.title}
                  className="h-auto max-h-[72px] max-w-[240px] object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.55)] md:max-h-[96px] md:max-w-[340px]"
                />
              ) : (
                <h1 className="font-sans text-3xl font-black leading-[0.95] tracking-[-0.03em] text-text-hi md:text-5xl">
                  {details.title}
                </h1>
              )}
            </div>

            <div
              className={`mb-4 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 overflow-hidden text-[13px] text-white/85 transition-all duration-500 ease-out ${
                hasEntered ? "max-h-[64px] opacity-100" : "max-h-0 opacity-0"
              }`}
              style={{ textShadow: "rgba(0,0,0,0.65) 0px 1px 4px" }}
            >
              {details.voteAverage > 0 ? (
                <span className="inline-flex items-center gap-1.5 text-accent-hi">
                  <StarIcon size={13} className="fill-primary text-primary" />
                  <span className="tabular-nums font-medium">
                    {details.voteAverage.toFixed(0)}
                  </span>
                </span>
              ) : null}
              {details.releaseDate ? (
                <DetailMetaItem value={getYear(details.releaseDate)} />
              ) : null}
              {"runtime" in details && details.runtime ? (
                <DetailMetaItem value={formatRuntime(details.runtime)} isNumeric />
              ) : null}
              {details.genres.map((genre) => (
                <DetailMetaItem key={genre.id} value={genre.name} />
              ))}
            </div>

            {details.overview ? (
              <p
                className={`max-w-xl overflow-hidden text-[14px] leading-relaxed text-white/85 transition-all duration-500 ease-out md:text-[15px] ${
                  showOverview
                    ? "mb-7 max-h-[140px] opacity-100 line-clamp-3"
                    : "mb-0 max-h-0 opacity-0"
                }`}
                style={{ textShadow: "rgba(0,0,0,0.65) 0px 1px 4px" }}
              >
                {details.overview}
              </p>
            ) : null}

            <div className="mb-4 flex flex-wrap items-center gap-2 md:gap-3">
              <Link
                href={getPlayHref(details.mediaType, details.id)}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-text-hi text-[#05070a] transition-all duration-200 hover:bg-white hover:shadow-glow active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-neo-bg md:h-auto md:w-auto md:gap-3 md:px-7 md:py-2.5"
              >
                <svg
                  className="h-5 w-5 fill-current md:h-[22px] md:w-[22px]"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <polygon points="5,3 19,12 5,21" />
                </svg>
                <span className="hidden md:inline">Play</span>
              </Link>

              <button
                type="button"
                aria-label={inWatchlist ? "Remove from watchlist" : "Add to watchlist"}
                onClick={handleWatchlist}
                disabled={isWatchlistLoading}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/10 shadow-lg transition-all duration-200 hover:scale-105 hover:bg-white/20 focus:outline-none disabled:opacity-60 md:h-12 md:w-12"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-[18px] w-[18px]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>

              {isTv ? (
                <a
                  href="#episodes-section"
                  className="flex h-10 items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 text-[12px] font-medium text-white backdrop-blur-xl transition-all duration-200 hover:bg-white/20 md:px-4 md:text-[13px]"
                >
                  <ListOrderedIcon size={16} />
                  <span className="truncate">Episodes</span>
                </a>
              ) : null}

              <button
                type="button"
                className="flex h-10 items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 text-[12px] font-medium text-white backdrop-blur-xl transition-all duration-200 hover:bg-white/20 md:px-4 md:text-[13px]"
              >
                <SparklesIcon size={16} />
                <span className="truncate">Similars</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="z-[1] w-full px-8 pb-4 md:px-16 lg:px-24 lg:pb-20">
        {isTv && "seasons" in details ? (
          <EpisodesSection
            tvId={details.id}
            seasons={details.seasons}
            onReady={handleEpisodeReady}
          />
        ) : null}
        <div className="mt-14">
          <CastRow cast={details.cast} />
        </div>
        <div className="mt-14">
          <RecommendationsRow
            title="You may like"
            items={
              details.similar.length > 0 ? details.similar : details.recommendations
            }
          />
        </div>
      </div>
    </div>
  );
}

interface DetailMetaItemProps {
  value: string;
  isNumeric?: boolean;
}

function DetailMetaItem({ value, isNumeric = false }: DetailMetaItemProps) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span aria-hidden="true" className="select-none text-white/35">
        ·
      </span>
      <span className={isNumeric ? "tabular-nums" : undefined}>{value}</span>
    </span>
  );
}

function findTrailer(
  videos: MovieDetails["videos"]
): MovieDetails["videos"][number] | undefined {
  const youtubeVideos = videos.filter((video) =>
    video.site.toLowerCase() === "youtube"
  );

  return (
    youtubeVideos.find((video) => video.type === "Trailer") ??
    youtubeVideos.find((video) => video.type === "Teaser") ??
    youtubeVideos[0]
  );
}

function MutedIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" />
      <line x1="22" x2="16" y1="9" y2="15" />
      <line x1="16" x2="22" y1="9" y2="15" />
    </svg>
  );
}

function VolumeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}