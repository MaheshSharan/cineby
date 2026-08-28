import { useCallback, useRef, useState } from "react";
import type { Episode } from "../types";
import { formatRuntime } from "@/lib/utils/media";

interface SeasonOption {
  seasonNumber: number;
  name: string;
  episodeCount: number;
  overview: string;
}

interface EpisodesDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  seasons: SeasonOption[];
  episodes: Episode[];
  selectedSeason: number;
  onSeasonChange: (seasonNumber: number) => void;
  onEpisodeSelect: (episode: Episode) => void;
  activeEpisodeNumber?: number;
  activeSeasonNumber?: number;
  isLoading?: boolean;
  autoNext: boolean;
  onToggleAutoNext: () => void;
}

export function EpisodesDrawer({
  open,
  onClose,
  title,
  seasons,
  episodes,
  selectedSeason,
  onSeasonChange,
  onEpisodeSelect,
  activeEpisodeNumber,
  activeSeasonNumber,
  isLoading = false,
  autoNext,
  onToggleAutoNext,
}: EpisodesDrawerProps) {
  const [query, setQuery] = useState("");
  const hasScrolledRef = useRef(false);

  const activeEpisodeRef = useCallback((node: HTMLDivElement | null) => {
    if (node && !hasScrolledRef.current) {
      hasScrolledRef.current = true;
      requestAnimationFrame(() => {
        node.scrollIntoView({ block: "center", behavior: "smooth" });
      });
    }
  }, []);

  if (!open) {
    // Reset scroll tracking when drawer closes so it re-scrolls on next open
    hasScrolledRef.current = false;
    return null;
  }

  const filteredEpisodes = query.trim()
    ? episodes.filter((ep) =>
        ep.name.toLowerCase().includes(query.trim().toLowerCase()) ||
        ep.episodeNumber.toString().includes(query.trim())
      )
    : episodes;

  return (
    <div
      data-player-ui
      className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-2xl flex flex-col p-5 md:p-10 text-white overflow-hidden"
      role="dialog"
      aria-label="Episodes"
    >
      {/* MODAL HEADER */}
      <div className="flex items-center justify-between flex-shrink-0 border-b border-white/10 pb-5">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Episodes
          </h2>
          <p className="text-sm font-medium text-gray-400 mt-0.5">
            {title}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Auto Next Toggle */}
          <button
            type="button"
            onClick={onToggleAutoNext}
            className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/10 hover:bg-white/[0.12] transition-colors cursor-pointer"
          >
            <svg
              className="w-4 h-4 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs font-semibold text-gray-200">Auto next</span>
            <div
              className={`w-7 h-4 flex items-center rounded-full p-0.5 transition-colors ${
                autoNext ? "bg-white" : "bg-white/20"
              }`}
            >
              <div
                className={`bg-black w-3 h-3 rounded-full shadow-md transform transition-transform ${
                  autoNext ? "translate-x-3" : "translate-x-0"
                }`}
              />
            </div>
          </button>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* MODAL BODY (TWO COLUMNS) */}
      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6 mt-6 flex-1 min-h-0">
        {/* LEFT COLUMN: SEASONS */}
        <div className="flex flex-col gap-2 overflow-y-auto no-scrollbar pr-1">
          {seasons.map((season) => {
            const isActive = season.seasonNumber === selectedSeason;

            return (
              <button
                key={season.seasonNumber}
                type="button"
                onClick={() => onSeasonChange(season.seasonNumber)}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl border text-sm font-medium transition-all ${
                  isActive
                    ? "bg-white/10 border-white/20 text-white font-semibold shadow-lg"
                    : "bg-white/[0.03] border-white/5 text-gray-400 hover:text-white hover:bg-white/[0.08]"
                }`}
              >
                <span>{season.name || `Season ${season.seasonNumber}`}</span>
                <span className="text-xs text-gray-400 font-medium">
                  {season.episodeCount} Eps
                </span>
              </button>
            );
          })}
        </div>

        {/* RIGHT COLUMN: EPISODES */}
        <div className="flex flex-col gap-3.5 overflow-y-auto pr-2 no-scrollbar min-h-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-20 text-gray-400 text-sm">
              Loading episodes...
            </div>
          ) : filteredEpisodes.length === 0 ? (
            <div className="flex items-center justify-center py-20 text-gray-400 text-sm">
              No episodes found.
            </div>
          ) : (
            filteredEpisodes.map((episode) => {
              const isCurrentPlaying =
                selectedSeason === activeSeasonNumber &&
                episode.episodeNumber === activeEpisodeNumber;

              const runtimeStr = episode.runtime ? formatRuntime(episode.runtime) : "";

              return (
                <div
                  ref={isCurrentPlaying ? activeEpisodeRef : undefined}
                  key={episode.id}
                  onClick={() => onEpisodeSelect(episode)}
                  className={`flex flex-col sm:flex-row gap-4 p-4 rounded-2xl border transition-all cursor-pointer group text-left w-full ${
                    isCurrentPlaying
                      ? "border-white/30 bg-white/[0.08]"
                      : "border-white/10 bg-white/[0.03] hover:bg-white/[0.07]"
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="relative w-full sm:w-48 h-28 flex-shrink-0 rounded-xl overflow-hidden bg-white/5">
                    {episode.stillPath ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={`https://image.tmdb.org/t/p/w500${episode.stillPath}`}
                        alt={episode.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
                        No Image
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-base font-bold text-white group-hover:text-primary transition-colors truncate">
                        {episode.name}
                      </h3>
                      {isCurrentPlaying ? (
                        <span className="bg-white text-black text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-sm flex-shrink-0">
                          Now Playing
                        </span>
                      ) : null}
                    </div>

                    <p className="text-xs text-gray-400 font-medium mt-1">
                      S{episode.seasonNumber} E{episode.episodeNumber}
                      {runtimeStr ? ` · ${runtimeStr}` : ""}
                    </p>

                    {episode.overview ? (
                      <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed mt-2">
                        {episode.overview}
                      </p>
                    ) : null}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
