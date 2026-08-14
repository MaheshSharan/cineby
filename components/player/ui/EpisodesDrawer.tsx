import { useState } from "react";

import type { Episode } from "../types";

interface SeasonOption {
  seasonNumber: number;
  name: string;
  episodeCount: number;
  overview: string;
}

interface EpisodesDrawerProps {
  open: boolean;
  onClose: () => void;
  seasons: SeasonOption[];
  episodes: Episode[];
  selectedSeason: number;
  onSeasonChange: (seasonNumber: number) => void;
  onEpisodeSelect: (episode: Episode) => void;
  activeEpisodeId?: number;
  isLoading?: boolean;
  autoNext: boolean;
  onToggleAutoNext: () => void;
}

export function EpisodesDrawer({
  open,
  onClose,
  seasons,
  episodes,
  selectedSeason,
  onSeasonChange,
  onEpisodeSelect,
  activeEpisodeId,
  isLoading = false,
  autoNext,
  onToggleAutoNext,
}: EpisodesDrawerProps) {
  const [query, setQuery] = useState("");
  const [seasonDropdownOpen, setSeasonDropdownOpen] = useState(false);

  const selectedSeasonInfo = seasons.find(
    (season) => season.seasonNumber === selectedSeason
  );

  const filteredEpisodes = query.trim()
    ? episodes.filter((episode) =>
        episode.name.toLowerCase().includes(query.trim().toLowerCase())
      )
    : episodes;

  return (
    <div
      data-player-ui
      className={`absolute top-1/2 right-0 md:right-4 h-[calc(100vh-100px)] mlandscape:inset-y-0 mlandscape:!top-0 mlandscape:!h-full md:h-[calc(100vh-120px)] max-h-[800px] mlandscape:!max-h-none w-full max-w-[100vw] mlandscape:w-[280px] md:w-[460px] md:max-w-[95vw] z-[110] flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] -translate-y-1/2 mlandscape:!translate-y-0 ${
        open ? "translate-x-0" : "translate-x-[120%]"
      } ${open ? "pointer-events-auto" : "pointer-events-none"}`}
      role="dialog"
      aria-label="Episodes"
    >
      <div className="flex-1 w-full h-full flex flex-col pt-2 bg-transparent overflow-visible">
        {/* Drawer header */}
        <div className="flex-shrink-0 px-3 md:px-5 pt-4 pb-3 relative z-[100]">
          <div className="flex items-center justify-end gap-2">
            {/* Season selector */}
            <div className="relative flex-shrink-0">
              <button
                type="button"
                onClick={() => setSeasonDropdownOpen((open) => !open)}
                aria-haspopup="listbox"
                aria-expanded={seasonDropdownOpen}
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-primary/15 text-primary text-[13px] font-bold whitespace-nowrap transition-colors hover:bg-primary/25 cursor-pointer"
              >
                {selectedSeasonInfo?.name ?? `Season ${selectedSeason}`}
                <svg
                  className={`w-3 h-3 transition-transform duration-200 ${
                    seasonDropdownOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {seasonDropdownOpen ? (
                <div
                  role="listbox"
                  aria-label="Select season"
                  className="absolute left-0 top-full mt-2 z-[9999] min-w-[12rem] rounded-xl shadow-2xl player-surface backdrop-blur-xl border border-white/10 p-1.5 flex flex-col max-h-60 overflow-y-auto no-scrollbar"
                >
                  {seasons.map((season) => {
                    const isActive = season.seasonNumber === selectedSeason;
                    return (
                      <button
                        key={season.seasonNumber}
                        type="button"
                        role="option"
                        aria-selected={isActive}
                        onClick={() => {
                          setSeasonDropdownOpen(false);
                          onSeasonChange(season.seasonNumber);
                        }}
                        className={`w-full px-3 py-2 text-left text-[13px] rounded-lg transition-colors ${
                          isActive
                            ? "text-primary font-semibold bg-white/[0.04]"
                            : "text-text-hi hover:bg-white/[0.04]"
                        }`}
                      >
                        {season.name}
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>

            {/* Search + auto-next */}
            <div className="flex items-center gap-1 flex-shrink-0 player-surface rounded-full p-1">
              <div className="flex items-center h-7 pl-2.5 pr-1.5 rounded-full bg-black/30">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-search w-3.5 h-3.5 text-gray-400 flex-shrink-0"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
                <input
                  type="text"
                  placeholder="Search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="bg-transparent border-none outline-none text-[16px] md:text-[13px] text-white placeholder-gray-500 w-16 md:w-28 ml-1.5 min-w-0"
                />
              </div>
              <span className="w-px h-5 bg-white/10 flex-shrink-0" />
              <div
                className="flex items-center gap-1.5 pl-1 pr-1.5"
                title="Auto next"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-skip-forward w-4 h-4 transition-colors flex-shrink-0 text-gray-400"
                  aria-hidden="true"
                >
                  <polygon points="5 4 15 12 5 20 5 4" />
                  <line x1="19" x2="19" y1="5" y2="19" />
                </svg>
                <button
                  role="switch"
                  aria-checked={autoNext}
                  aria-label="Auto next"
                  onClick={onToggleAutoNext}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 flex-shrink-0 ${
                    autoNext ? "bg-primary" : "bg-white/25"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
                      autoNext ? "translate-x-[18px]" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>

            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="flex-shrink-0 w-9 h-9 rounded-lg player-tile border text-gray-300 hover:text-white transition-colors flex items-center justify-center"
            >
              <svg
                width="28"
                height="28"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M6.75827 17.2426L12.0009 12M17.2435 6.75736L12.0009 12M12.0009 12L6.75827 6.75736M12.0009 12L17.2435 17.2426"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Episode list */}
        <div className="flex-1 overflow-hidden px-2 md:px-8 pb-4 pt-1 h-full relative w-full">
          <div
            className="px-2 overflow-y-auto overflow-x-hidden touch-pan-y h-full relative scroll-smooth flex flex-col items-center episode-scroll-hidden"
            style={{
              paddingBottom: "280px",
              maskImage: "linear-gradient(transparent 0%, black 12%, black 85%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(transparent 0%, black 12%, black 85%, transparent 100%)",
            }}
          >
            {selectedSeasonInfo ? (
              <div className="h-[220px] w-full max-w-[300px] flex flex-col justify-end items-center text-center pb-6 shrink-0 z-[100] relative pointer-events-none px-2">
                <h3 className="text-xl font-bold text-white leading-tight drop-shadow-xl">
                  {selectedSeasonInfo.name}
                </h3>
                <div className="mt-1.5 flex items-center justify-center gap-2 drop-shadow-md">
                  <span className="h-1 w-1 rounded-full bg-primary flex-shrink-0" />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400">
                    {selectedSeasonInfo.episodeCount} Episodes
                  </span>
                </div>
                <p className="mt-2.5 text-xs text-gray-300 line-clamp-3 drop-shadow-lg leading-relaxed">
                  {selectedSeasonInfo.overview}
                </p>
              </div>
            ) : null}

            <div className="flex flex-col items-center w-full -space-y-16 mlandscape:-space-y-12 relative md:pl-4">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center gap-3 py-16">
                  <svg
                    className="h-8 w-8 animate-spin text-primary"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span className="text-xs text-gray-400">Loading episodes…</span>
                </div>
              ) : filteredEpisodes.length === 0 ? (
                <p className="py-12 text-center text-xs text-gray-400">
                  No episodes found.
                </p>
              ) : (
                filteredEpisodes.map((episode, index) => {
                  const isActive = activeEpisodeId === episode.id;
                  return (
                    <button
                      key={episode.id}
                      type="button"
                      onClick={() => onEpisodeSelect(episode)}
                      className="w-full group outline-none focus:outline-none origin-center relative block cursor-pointer transition-all duration-200"
                      style={{ zIndex: isActive ? 100 : 100 - index }}
                    >
                      <div className="flex flex-col relative mx-auto w-full max-w-[300px]">
                        <div className="relative w-full aspect-[16/9]">
                          <div className="absolute inset-0 rounded-2xl overflow-hidden bg-gray-900">
                            {episode.stillPath ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={`https://image.tmdb.org/t/p/w300${episode.stillPath}`}
                                alt={episode.name}
                                loading="lazy"
                                className="w-full h-full object-cover"
                              />
                            ) : null}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />
                            <div className="absolute bottom-2 left-0 w-full px-4 py-1.5 z-10 pointer-events-none flex flex-col justify-end">
                              <h4 className="font-bold leading-tight line-clamp-2 drop-shadow-md text-[15px] text-white">
                                {isActive ? (
                                  <span className="inline-block px-1.5 py-0.5 mr-1.5 bg-primary text-white text-[9px] font-bold rounded uppercase tracking-wider mb-0.5 align-middle">
                                    Watching
                                  </span>
                                ) : null}
                                {episode.episodeNumber}. {episode.name}
                              </h4>
                              <p className="font-medium mt-0.5 drop-shadow-md text-[13px] text-white/80 line-clamp-1">
                                {episode.overview}
                              </p>
                            </div>
                          </div>
                          <div
                            className={`absolute inset-0 rounded-2xl pointer-events-none transition-all duration-300 ease-out z-30 ${
                              isActive ? "border-[2.5px] border-white/90" : "border-[1px] border-transparent"
                            }`}
                          />
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
