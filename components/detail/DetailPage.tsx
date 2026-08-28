import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";

import type { MovieDetails, TvDetails } from "@/lib/tmdb";
import { getHeroBackdropUrl, getLogoUrl } from "@/lib/tmdb/image";
import { listHistory } from "@/lib/api/history";
import {
  addToWatchlist,
  checkWatchlist,
  removeFromWatchlist,
} from "@/lib/api/watchlist";
import { getEpisodeHref, getMediaHref, getPlayHref, getYear, formatRuntime } from "@/lib/utils/media";
import { getMovyRatings, getMovyTrailerUrl, type MovyRatings } from "@/lib/services/movy";

import { useAuth } from "@/components/auth/AuthProvider";
import { CastRow } from "@/components/detail/CastRow";
import { EpisodesSection } from "@/components/detail/EpisodesSection";
import { RecommendationsRow } from "@/components/detail/RecommendationsRow";
import { PlayerShell } from "@/components/player/PlayerShell";
import type { PlayerSeason } from "@/components/player/types";
import { PageLoader } from "@/components/ui/PageLoader";
import {
  CheckIcon,
  ChevronLeftIcon,
  ListOrderedIcon,
  PlusIcon,
  SparklesIcon,
} from "@/components/ui/icons";

type DetailData = MovieDetails | TvDetails;

interface DetailPageProps {
  details: DetailData;
  isPlaying: boolean;
  seasonNumber?: number | null;
  episodeNumber?: number | null;
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

export function DetailPage({
  details,
  isPlaying,
  seasonNumber,
  episodeNumber,
}: DetailPageProps) {
  const router = useRouter();
  const { user, openAuthModal, showToast } = useAuth();
  const [isMuted, setIsMuted] = useState(true);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [isWatchlistLoading, setIsWatchlistLoading] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);
  const [showOverview, setShowOverview] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [trailerReady, setTrailerReady] = useState(false);
  const [isPageReady, setIsPageReady] = useState(false);
  const [historyEpisode, setHistoryEpisode] = useState<{ season: number; episode: number } | null>(null);
  const [ratings, setRatings] = useState<MovyRatings | null>(null);
  const [directTrailerUrl, setDirectTrailerUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const heroBackdrop = getHeroBackdropUrl(details.backdropPath);
  const isTv = details.mediaType === "tv";

  useEffect(() => {
    if (!isTv || (seasonNumber && episodeNumber) || !user) {
      return;
    }

    let isCurrent = true;

    listHistory()
      .then((historyList) => {
        if (!isCurrent) return;
        const match = historyList.find(
          (item) => item.mediaType === "tv" && item.mediaId === details.id
        );
        if (match?.seasonNumber && match?.episodeNumber) {
          setHistoryEpisode({ season: match.seasonNumber, episode: match.episodeNumber });
        }
      })
      .catch(() => {});

    return () => {
      isCurrent = false;
    };
  }, [details.id, episodeNumber, isTv, seasonNumber, user]);

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
    let isCurrent = true;

    getMovyRatings({
      id: details.id,
      title: details.title,
      year: details.releaseDate ? getYear(details.releaseDate) : null,
      type: details.mediaType,
    }).then((data) => {
      if (isCurrent && data) {
        setRatings(data);
      }
    });

    return () => {
      isCurrent = false;
    };
  }, [details.id, details.title, details.releaseDate, details.mediaType]);

  useEffect(() => {
    let isCurrent = true;

    getMovyTrailerUrl(details.imdbId).then((url) => {
      if (isCurrent && url) {
        setDirectTrailerUrl(url);
      }
    });

    return () => {
      isCurrent = false;
    };
  }, [details.imdbId]);

  useEffect(() => {
    if (!directTrailerUrl) {
      return;
    }

    const timer = window.setTimeout(() => setShowTrailer(true), TRAILER_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [directTrailerUrl]);

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
      openAuthModal("login");
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
        const nextState = !inWatchlist;
        setInWatchlist(nextState);
        showToast(nextState ? "Added to watchlist" : "Removed from watchlist");
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
    const effectiveSeason = isTv ? seasonNumber ?? historyEpisode?.season ?? 1 : null;
    const effectiveEpisode = isTv ? episodeNumber ?? historyEpisode?.episode ?? 1 : null;
    const episodeDuration = isTv && "episodeRunTime" in details && details.episodeRunTime?.[0]
      ? formatRuntime(details.episodeRunTime[0])
      : undefined;
    const movieDuration = !isTv && "runtime" in details && details.runtime
      ? formatRuntime(details.runtime)
      : undefined;
    const duration = episodeDuration ?? movieDuration ?? undefined;
    const releaseYear = details.releaseDate ? getYear(details.releaseDate) : undefined;
    const playerSubtitle = isTv
      ? `S${effectiveSeason} E${effectiveEpisode}`
      : releaseYear || undefined;

    return (
      <PlayerShell
        title={details.title}
        subtitle={playerSubtitle}
        media={{
          mediaType: details.mediaType,
          mediaId: details.id,
          title: details.title,
          posterPath: details.posterPath,
          backdropPath: details.backdropPath,
          seasonNumber: effectiveSeason,
          episodeNumber: effectiveEpisode,
          duration,
          runtime: isTv
            ? ("episodeRunTime" in details ? details.episodeRunTime?.[0] ?? null : null)
            : ("runtime" in details ? details.runtime ?? null : null),
          releaseYear,
          seasons: isTv && "seasons" in details ? toPlayerSeasons(details.seasons) : undefined,
        }}
        onBack={() => router.push(getMediaHref(details.mediaType, details.id))}
        onNavigateEpisode={(season, episode) =>
          router.push(getEpisodeHref(details.id, season, episode))
        }
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

      <div className="relative min-h-[60vh] w-full md:min-h-[75vh] lg:min-h-[85vh]">
        <div className="absolute inset-0 overflow-hidden">
          {heroBackdrop ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={heroBackdrop}
              alt=""
              aria-hidden="true"
              className="h-full w-full object-cover object-center"
            />
          ) : (
            <div className="h-full w-full bg-surface-1" />
          )}
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

          {directTrailerUrl && showTrailer ? (
            <div
              className="absolute inset-0 w-full overflow-hidden transition-opacity duration-700 ease-in-out"
              style={{ opacity: trailerReady ? 1 : 0 }}
            >
              <video
                ref={videoRef}
                src={directTrailerUrl}
                autoPlay
                muted={isMuted}
                playsInline
                preload="auto"
                onCanPlay={() => setTrailerReady(true)}
                onEnded={() => {
                  setShowTrailer(false);
                  setTrailerReady(false);
                }}
                className="h-full w-full object-cover object-center pointer-events-none"
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
        </div>

        {directTrailerUrl && showTrailer && trailerReady ? (
          <button
            type="button"
            onClick={() => {
              setIsMuted((prev) => {
                const next = !prev;
                if (videoRef.current) {
                  videoRef.current.muted = next;
                }
                return next;
              });
            }}
            aria-label={isMuted ? "Unmute trailer" : "Mute trailer"}
            className="absolute bottom-6 right-6 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-md transition-all duration-200 hover:scale-110 hover:bg-black/70 md:bottom-8 md:right-8 cursor-pointer"
          >
            {isMuted ? (
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
                aria-hidden="true"
              >
                <path d="M11 5L6 9H2v6h4l5 4V5z" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </svg>
            ) : (
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
                aria-hidden="true"
              >
                <path d="M11 5L6 9H2v6h4l5 4V5z" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
            )}
          </button>
        ) : null}

        <div className="relative z-10 flex min-h-[60vh] flex-col justify-end px-8 pb-12 pt-28 md:min-h-[75vh] md:px-16 md:pb-16 lg:min-h-[85vh] lg:px-24">
          <div
            className="w-full max-w-2xl text-left"
            onMouseEnter={() => setShowOverview(true)}
            onMouseLeave={() => setShowOverview(false)}
          >
            {details.logoPath ? (
              <div className="mb-4 max-w-[280px] sm:max-w-[340px] md:max-w-[420px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getLogoUrl(details.logoPath) ?? undefined}
                  alt={details.title}
                  className="max-h-24 w-auto object-contain object-left md:max-h-32"
                />
              </div>
            ) : (
              <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
                {details.title}
              </h1>
            )}

            <div
              className={`mb-4 overflow-hidden transition-all duration-500 ease-out ${
                hasEntered ? "max-h-[120px] opacity-100" : "max-h-0 opacity-0"
              }`}
              style={{ textShadow: "rgba(0,0,0,0.65) 0px 1px 4px" }}
            >
              {/* Attributes (Year • Runtime • Genres) */}
              <div className="flex flex-wrap items-center text-[15px] font-medium text-white/90">
                {details.releaseDate ? (
                  <span className="tabular-nums">{getYear(details.releaseDate)}</span>
                ) : null}
                {"runtime" in details && details.runtime ? (
                  <span className="inline-flex items-center">
                    <span className="mx-2 select-none text-white/55" aria-hidden="true">
                      •
                    </span>
                    <span className="tabular-nums">{formatRuntime(details.runtime)}</span>
                  </span>
                ) : null}
                {details.genres.map((genre) => (
                  <span key={genre.id} className="inline-flex items-center">
                    <span className="mx-2 select-none text-white/55" aria-hidden="true">
                      •
                    </span>
                    <span>{genre.name}</span>
                  </span>
                ))}
              </div>

              {/* Ratings Badges (TMDB, IMDb, Rotten Tomatoes Critics & Audience) */}
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[14px] font-semibold text-white/90">
                {details.voteAverage > 0 ? (
                  <span
                    className="inline-flex items-center gap-2 cursor-help"
                    title="TMDB · Rated by users"
                  >
                    <span className="inline-flex items-center justify-center h-[18px] px-1.5 rounded-[3px] bg-[#01b4e4] text-[#0d253f] text-[9px] font-black tracking-tight leading-none [text-shadow:none]">
                      TMDB
                    </span>
                    <span className="tabular-nums leading-none">
                      {details.voteAverage.toFixed(1)}
                    </span>
                  </span>
                ) : null}

                {ratings?.imdb ? (
                  <span
                    className="inline-flex items-center gap-2 cursor-help"
                    title="IMDb · Rated by users"
                  >
                    <span className="inline-flex items-center justify-center h-[18px] px-1.5 rounded-[3px] bg-[#f5c518] text-[#0d0d0d] text-[9px] font-black tracking-tight leading-none [text-shadow:none]">
                      IMDb
                    </span>
                    <span className="tabular-nums leading-none">
                      {ratings.imdb.toFixed(1)}
                    </span>
                  </span>
                ) : null}

                {ratings?.rottenTomatoes ? (
                  <span
                    className="inline-flex items-center gap-1.5 cursor-help"
                    title="Rotten Tomatoes · Rated by critics"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="block h-5 w-5 shrink-0"
                      aria-hidden="true"
                    >
                      <path fill="#fa320a" d="M12 7.2c4.6 0 8.2 3.4 8.2 7.4S16.6 22 12 22 3.8 18.6 3.8 14.6 7.4 7.2 12 7.2Z" />
                      <path fill="#1f8a2e" d="M12.1 3c.2 1.6-.6 2.8-1.8 3.4 1.6.1 3.1-.8 4-2.3.4 1.6-.2 3.1-1.4 4.1 1.3-.2 2.4-1 3.1-2.2-.2 1.5-1.2 2.7-2.6 3.2.2-2.2-1.4-4.1-3.6-4.6.8.1 1.4-.4 1.6-1.2.1-.2.4-.5.7-.4Z" />
                    </svg>
                    <span className="tabular-nums leading-none">{ratings.rottenTomatoes}%</span>
                  </span>
                ) : null}

                {ratings?.rottenTomatoesAudience ? (
                  <span
                    className="inline-flex items-center gap-1.5 cursor-help"
                    title="Rotten Tomatoes · Rated by users"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="block h-5 w-5 shrink-0"
                      aria-hidden="true"
                    >
                      <path fill="#f3c14a" d="M8.2 6.2c.4-1.3 1.8-1.8 2.7-1.1.3-1.2 1.7-1.7 2.6-.8.5-1 1.9-1.1 2.6-.1.8-.6 2 .1 2.1 1.2.9.2 1.4 1.4.9 2.1H6.8c-.6-.8 0-2.1 1.4-2.3Z" />
                      <path fill="#f2a11a" d="M9.4 5.4c.2.8.8 1.3 1.5 1.4-.4-1-.2-1.8.4-2.3-.9.1-1.6.4-1.9.9Z" />
                      <path fill="#e23b32" d="M6.4 10.2h11.2l-1.1 10.2c-.1.8-.8 1.4-1.6 1.4H9.1c-.8 0-1.5-.6-1.6-1.4L6.4 10.2Z" />
                      <path fill="#fff" d="M9.2 10.2h1.7l-.7 11.6H9.1c-.3 0-.6-.1-.8-.3l.9-11.3Zm4 0h1.7l.8 11.6h-1.8L13.2 10.2Z" />
                    </svg>
                    <span className="tabular-nums leading-none">{ratings.rottenTomatoesAudience}%</span>
                  </span>
                ) : null}
              </div>
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
                href={
                  isTv
                    ? getEpisodeHref(
                        details.id,
                        seasonNumber ?? historyEpisode?.season ?? 1,
                        episodeNumber ?? historyEpisode?.episode ?? 1
                      )
                    : getPlayHref(details.mediaType, details.id)
                }
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
                aria-pressed={inWatchlist}
                onClick={handleWatchlist}
                disabled={isWatchlistLoading}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white shadow-lg transition-all duration-200 hover:scale-105 hover:bg-white/20 active:scale-95 focus:outline-none disabled:opacity-60 md:h-12 md:w-12"
              >
                {inWatchlist ? (
                  <CheckIcon size={20} className="stroke-[2.5]" />
                ) : (
                  <PlusIcon size={20} className="stroke-[2]" />
                )}
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

              <a
                href="#recommendations-section"
                className="flex h-10 items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 text-[12px] font-medium text-white backdrop-blur-xl transition-all duration-200 hover:bg-white/20 md:px-4 md:text-[13px]"
              >
                <SparklesIcon size={16} />
                <span className="truncate">Similars</span>
              </a>
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
        <div id="recommendations-section" className="mt-14 scroll-mt-24">
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

function toPlayerSeasons(seasons: TvDetails["seasons"]): PlayerSeason[] {
  return seasons
    .filter((season) => season.seasonNumber > 0 && season.episodeCount > 0)
    .map((season) => ({
      seasonNumber: season.seasonNumber,
      name: season.name,
      episodeCount: season.episodeCount,
      overview: season.overview,
    }))
    .sort((a, b) => a.seasonNumber - b.seasonNumber);
}