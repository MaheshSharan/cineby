import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import type { Season, SeasonEpisodes } from "@/lib/tmdb";
import { getEpisodeHref } from "@/lib/utils/media";

interface EpisodesSectionProps {
  tvId: number;
  seasons: Season[];
}

export function EpisodesSection({ tvId, seasons }: EpisodesSectionProps) {
  const defaultSeason =
    seasons.find((season) => season.seasonNumber > 0) ?? seasons[0];

  const [selectedSeasonNumber, setSelectedSeasonNumber] = useState<number>(
    defaultSeason?.seasonNumber ?? 0
  );
  const [episodes, setEpisodes] = useState<SeasonEpisodes | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [sortDescending, setSortDescending] = useState(false);

  useEffect(() => {
    setIsLoading(true);

    fetch(`/api/tmdb/tv/${tvId}/season/${selectedSeasonNumber}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Season request failed: ${response.status}`);
        }

        return response.json() as Promise<SeasonEpisodes>;
      })
      .then(setEpisodes)
      .catch(() => {
        setEpisodes(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [tvId, selectedSeasonNumber]);

  const visibleEpisodes = useMemo(() => {
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

  return (
    <section className="py-6">
      <h2 className="mb-4 px-4 text-[24px] font-semibold uppercase leading-none tracking-[0.05em] sm:px-6">
        Episodes
      </h2>

      <div className="mb-4 flex flex-wrap items-center gap-3 px-4 sm:px-6">
        <select
          value={selectedSeasonNumber}
          onChange={(event) => setSelectedSeasonNumber(Number(event.target.value))}
          aria-label="Select season"
          className="h-9 rounded-full border border-input bg-secondary px-4 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
        >
          {seasons.map((season) => (
            <option key={season.id} value={season.seasonNumber}>
              {season.name}
            </option>
          ))}
        </select>

        <div className="relative min-w-0 flex-1">
          <svg
            viewBox="0 0 24 24"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
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
            className="h-9 w-full max-w-sm rounded-full border border-input bg-background pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        <button
          type="button"
          aria-label="Toggle episode sort order"
          onClick={() => setSortDescending((descending) => !descending)}
          className="flex h-9 items-center gap-2 rounded-full border border-border px-4 text-xs font-medium text-muted-foreground transition-colors duration-150 hover:bg-secondary hover:text-foreground"
        >
          {sortDescending ? "Z-A" : "A-Z"}
          <svg
            viewBox="0 0 24 24"
            className={`h-3.5 w-3.5 transition-transform duration-150 ${sortDescending ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 5v14m0 0 6-6m-6 6-6-6" />
          </svg>
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-2 px-4 sm:px-6">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-16 animate-pulse rounded-lg bg-secondary" />
          ))}
        </div>
      ) : visibleEpisodes.length === 0 ? (
        <p className="px-4 text-sm text-muted-foreground sm:px-6">
          No episodes found.
        </p>
      ) : (
        <ul className="space-y-2 px-4 sm:px-6">
          {visibleEpisodes.map((episode) => (
            <li key={episode.id}>
              <div className="group flex items-center gap-4 rounded-lg p-3 transition-colors duration-150 hover:bg-secondary">
                <Link
                  href={getEpisodeHref(tvId, episode.seasonNumber, episode.episodeNumber)}
                  className="flex min-w-0 flex-1 items-center gap-4"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border text-sm font-semibold">
                    {episode.episodeNumber}
                  </span>
                  <div className="min-w-0">
                    <h4 className="truncate text-[15px] font-medium group-hover:text-primary">
                      {episode.name}
                    </h4>
                    <p className="mt-0.5 line-clamp-2 text-[13px] text-muted-foreground">
                      {episode.overview || "No overview available."}
                    </p>
                  </div>
                </Link>

                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    {episode.runtime ? `${episode.runtime} min` : ""}
                  </span>
                  <button
                    type="button"
                    aria-label={`Download ${episode.name}`}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-4 w-4"
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
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}