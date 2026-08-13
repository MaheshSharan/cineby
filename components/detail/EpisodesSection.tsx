import * as Select from "@radix-ui/react-select";
import { useEffect, useMemo, useState } from "react";

import type { Episode, Season, SeasonEpisodes } from "@/lib/tmdb";
import { getSeasonEpisodes } from "@/lib/api/episodes";
import { getStillThumbUrl } from "@/lib/tmdb/image";
import { getEpisodeHref } from "@/lib/utils/media";

import { DownloadIcon } from "@/components/ui/icons";

interface EpisodesSectionProps {
  tvId: number;
  seasons: Season[];
  onReady?: () => void;
}

const CONTROL_SURFACE_STYLE = {
  background:
    "linear-gradient(rgba(255, 255, 255, 0.035) 0%, rgba(255, 255, 255, 0.01) 100%)",
  boxShadow:
    "rgba(255, 255, 255, 0.05) 0px 1px 0px inset, rgba(0, 0, 0, 0.55) 0px 6px 14px -6px",
} as const;

export function EpisodesSection({ tvId, seasons, onReady }: EpisodesSectionProps) {
  const defaultSeason =
    seasons.find((season) => season.seasonNumber > 0) ?? seasons[0];

  const [selectedSeasonNumber, setSelectedSeasonNumber] = useState<number>(
    defaultSeason?.seasonNumber ?? 0
  );
  const [episodes, setEpisodes] = useState<SeasonEpisodes | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [query, setQuery] = useState("");
  const [sortDescending, setSortDescending] = useState(false);
  const [expandedEpisodeId, setExpandedEpisodeId] = useState<number | null>(
    null
  );

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);

    let isCurrent = true;

    getSeasonEpisodes(tvId, selectedSeasonNumber)
      .then((data) => {
        if (isCurrent) {
          setEpisodes(data);
        }
      })
      .catch(() => {
        if (isCurrent) {
          setEpisodes(null);
          setHasError(true);
        }
      })
      .finally(() => {
        if (isCurrent) {
          setIsLoading(false);
        }
        onReady?.();
      });

    return () => {
      isCurrent = false;
    };
  }, [tvId, selectedSeasonNumber, onReady]);

  const visibleEpisodes = useMemo<Episode[]>(() => {
    if (!episodes) {
      return [];
    }

    const normalizedQuery = query.trim().toLowerCase();
    const filtered = normalizedQuery
      ? episodes.episodes.filter(
          (episode) =>
            episode.name.toLowerCase().includes(normalizedQuery) ||
            episode.overview.toLowerCase().includes(normalizedQuery)
        )
      : episodes.episodes;

    return [...filtered].sort((a, b) =>
      sortDescending
        ? b.episodeNumber - a.episodeNumber
        : a.episodeNumber - b.episodeNumber
    );
  }, [episodes, query, sortDescending]);

  const selectedSeason =
    seasons.find((season) => season.seasonNumber === selectedSeasonNumber) ??
    null;

  return (
    <section id="episodes-section" className="mt-16">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="heading-trail min-w-0 truncate text-xl font-semibold text-text-hi md:text-2xl">
          Episodes
        </h2>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <Select.Root
          value={String(selectedSeasonNumber)}
          onValueChange={(value) => setSelectedSeasonNumber(Number(value))}
        >
          <Select.Trigger
            className="flex h-9 min-w-[150px] items-center justify-between gap-2 rounded-[12px] border border-white/[0.07] px-3.5 text-[12.5px] font-medium text-text-hi transition-colors hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background data-[state=open]:border-primary/30"
            style={CONTROL_SURFACE_STYLE}
            aria-label="Select season"
          >
            <span className="line-clamp-1">
              {selectedSeason?.name ?? `Season ${selectedSeasonNumber}`}
            </span>
            <Select.Icon className="ml-1 flex items-center">
              <svg
                className="h-4 w-4 opacity-50"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </Select.Icon>
          </Select.Trigger>

          <Select.Portal>
            <Select.Content
              position="popper"
              sideOffset={4}
              className="relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border border-white/[0.07] bg-popover text-text-hi shadow-md"
            >
              <Select.Viewport className="p-1">
                {seasons
                  .filter(
                    (season) => season.seasonNumber !== selectedSeasonNumber
                  )
                  .map((season) => (
                    <Select.Item
                      key={season.id}
                      value={String(season.seasonNumber)}
                      className="relative mx-1 flex w-full cursor-default select-none items-center rounded-[8px] py-2 pl-3 pr-2 text-[12.5px] text-text-mid outline-none transition-colors data-[highlighted]:bg-white/[0.05] data-[highlighted]:text-text-hi"
                    >
                      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center" />
                      <span className="line-clamp-1">{season.name}</span>
                    </Select.Item>
                  ))}
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>

        <div className="relative min-w-[180px] max-w-xs flex-1">
          <svg
            viewBox="0 0 24 24"
            className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-mid"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search episode…"
            aria-label="Search episodes"
            className="h-9 w-full rounded-[12px] border border-white/[0.07] pl-9 pr-3 text-[12.5px] font-medium text-text-hi outline-none transition-colors placeholder:text-text-mid focus:border-primary/40"
            style={CONTROL_SURFACE_STYLE}
          />
        </div>

        <button
          type="button"
          title={sortDescending ? "Sort A-Z" : "Sort Z-A"}
          aria-label="Toggle episode sort order"
          onClick={() => setSortDescending((descending) => !descending)}
          className="flex h-9 w-9 items-center justify-center rounded-[12px] border border-white/[0.07] text-text-mid transition-colors hover:border-primary/30 hover:text-primary"
          style={CONTROL_SURFACE_STYLE}
        >
          <svg
            viewBox="0 0 24 24"
            className={`h-4 w-4 transition-transform duration-200 ${
              sortDescending ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m3 16 4 4 4-4" />
            <path d="M7 20V4" />
            <path d="M20 8h-5" />
            <path d="M15 10V6.5a2.5 2.5 0 0 1 5 0V10" />
            <path d="M15 14h5l-5 6h5" />
          </svg>
        </button>
      </div>

      {isLoading ? (
        <div className="flex max-h-[32rem] flex-col gap-2 overflow-hidden pr-1 lg:max-h-[40rem]">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-[72px] animate-pulse rounded-[14px] border border-white/[0.06] bg-white/[0.02] md:h-[104px]"
            />
          ))}
        </div>
      ) : hasError ? (
        <p className="text-[13px] text-text-mid">Unable to load episodes.</p>
      ) : visibleEpisodes.length === 0 ? (
        <p className="text-[13px] text-text-mid">No episodes found.</p>
      ) : (
        <div className="scrollbar-styles flex max-h-[32rem] flex-col gap-2 overflow-auto pr-1 lg:max-h-[40rem]">
          {visibleEpisodes.map((episode) => (
            <EpisodeCard
              key={episode.id}
              tvId={tvId}
              episode={episode}
              isExpanded={expandedEpisodeId === episode.id}
              onToggleExpand={() =>
                setExpandedEpisodeId((id) =>
                  id === episode.id ? null : episode.id
                )
              }
            />
          ))}
        </div>
      )}
    </section>
  );
}

interface EpisodeCardProps {
  tvId: number;
  episode: Episode;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

function EpisodeCard({
  tvId,
  episode,
  isExpanded,
  onToggleExpand,
}: EpisodeCardProps) {
  const still = getStillThumbUrl(episode.stillPath);
  const playHref = getEpisodeHref(
    tvId,
    episode.seasonNumber,
    episode.episodeNumber
  );

  return (
    <div className="group relative w-full rounded-[14px] border border-white/[0.06] bg-white/[0.02] transition-all duration-200 hover:border-primary/30 hover:bg-white/[0.04]">
      <div className="flex cursor-pointer items-center gap-3 p-2 md:cursor-default md:gap-4 md:p-3">
        <button
          type="button"
          onClick={onToggleExpand}
          className="flex min-w-0 flex-1 items-center gap-3 md:hidden"
          aria-expanded={isExpanded}
        >
          <div className="relative aspect-video w-28 flex-shrink-0 overflow-hidden rounded-[8px] border border-white/[0.05] bg-white/[0.04]">
            {still ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={still}
                alt=""
                title={episode.name}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            ) : null}
            <span className="absolute bottom-1.5 left-1.5 rounded border border-white/[0.06] bg-neo-bg/80 px-1.5 py-0.5 text-[10.5px] font-semibold tabular-nums text-text-hi backdrop-blur-sm">
              {episode.episodeNumber}
            </span>
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <h4 className="line-clamp-1 text-[13.5px] font-medium leading-snug text-text-hi">
              {episode.name}
            </h4>
            <span className="text-[11px] tabular-nums text-text-mid">
              {episode.runtime ? `${episode.runtime} min` : ""}
            </span>
          </div>
          <svg
            className={`h-4 w-4 flex-shrink-0 text-text-mid transition-transform duration-200 ${
              isExpanded ? "rotate-180" : ""
            }`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>

        <a
          href={playHref}
          className="hidden min-w-0 flex-1 items-center gap-4 md:flex"
        >
          <div className="relative aspect-video w-40 flex-shrink-0 overflow-hidden rounded-[10px] border border-white/[0.05] bg-white/[0.04]">
            {still ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={still}
                alt=""
                title={episode.name}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
              />
            ) : null}
            <span className="absolute bottom-1.5 left-1.5 rounded border border-white/[0.06] bg-neo-bg/80 px-1.5 py-0.5 text-[10.5px] font-semibold tabular-nums text-text-hi backdrop-blur-sm">
              {episode.episodeNumber}
            </span>
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1 py-1">
            <h4 className="line-clamp-1 text-[15px] font-medium leading-snug text-text-hi transition-colors duration-200 group-hover:text-primary">
              {episode.name}
            </h4>
            <span className="text-[11.5px] tabular-nums text-text-mid">
              {episode.runtime ? `${episode.runtime} min` : ""}
            </span>
            <p className="line-clamp-2 text-[13px] leading-relaxed text-text-mid">
              {episode.overview || "No overview available."}
            </p>
          </div>
        </a>

        <div className="hidden flex-shrink-0 items-center md:flex">
          <button
            type="button"
            aria-label={`Download ${episode.name}`}
            className="flex h-9 w-9 items-center justify-center rounded-full text-text-mid transition-colors duration-200 hover:bg-white/[0.05] hover:text-primary"
          >
            <DownloadIcon size={16} />
          </button>
        </div>
      </div>

      <div
        className={`overflow-hidden transition-all duration-300 ease-out md:hidden ${
          isExpanded ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-3 pb-3 pt-1">
          <h4 className="mb-2 text-[15px] font-medium leading-snug text-text-hi">
            <span className="tabular-nums">{episode.episodeNumber}.</span>{" "}
            {episode.name}
          </h4>
          <p className="scrollbar-styles mb-3 max-h-[140px] overflow-y-auto pr-1 text-[13px] leading-relaxed text-text-mid">
            {episode.overview || "No overview available."}
          </p>
          <div className="flex items-center gap-2">
            <a
              href={playHref}
              className="flex items-center gap-1.5 rounded-full bg-text-hi px-3.5 py-1.5 text-[12px] font-medium text-[#05070a] transition-all hover:bg-white hover:shadow-[0_0_16px_rgba(220,38,38,0.3)]"
            >
              <svg
                viewBox="0 0 24 24"
                width="13"
                height="13"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              Play
            </a>
            <button
              type="button"
              aria-label={`Download ${episode.name}`}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.06] text-text-mid transition-colors duration-200 hover:border-primary/40 hover:text-primary"
            >
              <DownloadIcon size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}