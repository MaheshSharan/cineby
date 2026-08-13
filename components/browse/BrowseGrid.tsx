import { useCallback, useEffect, useRef, useState } from "react";

import type { Genre, MediaSummary, Paginated } from "@/lib/tmdb";

import { MovieCard } from "@/components/movie/MovieCard";
import { SkeletonCardGrid } from "@/components/skeleton/SkeletonCard";

type MediaType = "movie" | "tv";
type SortKey = "popular" | "rating" | "recent";

interface Filters {
  sortKey: SortKey;
  genreId?: number;
}

interface BrowseGridProps {
  mediaType: MediaType;
  genres: Genre[];
  initialItems: MediaSummary[];
}

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "popular", label: "Most popular" },
  { key: "rating", label: "Most rating" },
  { key: "recent", label: "Most recent" },
];

export function BrowseGrid({ mediaType, genres, initialItems }: BrowseGridProps) {
  const [filters, setFilters] = useState<Filters>({ sortKey: "popular" });
  const [items, setItems] = useState(initialItems);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const requestInFlightRef = useRef(false);

  const fetchPage = useCallback(
    async (targetPage: number, nextFilters: Filters, append: boolean) => {
      if (requestInFlightRef.current) {
        return;
      }

      requestInFlightRef.current = true;
      setIsLoading(true);

      const params = new URLSearchParams();
      params.set("mediaType", mediaType);
      params.set("sortBy", toSortBy(nextFilters.sortKey, mediaType));
      params.set("page", String(targetPage));

      if (nextFilters.genreId) {
        params.set("genreId", String(nextFilters.genreId));
      }

      try {
        const response = await fetch(`/api/tmdb/browse?${params.toString()}`);

        if (!response.ok) {
          throw new Error(`Browse request failed: ${response.status}`);
        }

        const data = (await response.json()) as Paginated<MediaSummary>;

        setItems((current) => (append ? [...current, ...data.results] : data.results));
        setTotalPages(data.totalPages);
        setPage(targetPage);
      } catch {
        if (!append) {
          setItems([]);
        }
      } finally {
        requestInFlightRef.current = false;
        setIsLoading(false);
      }
    },
    [mediaType]
  );

  const applyFilters = useCallback(
    (nextFilters: Filters) => {
      setFilters(nextFilters);
      fetchPage(1, nextFilters, false);
    },
    [fetchPage]
  );

  const loadMore = useCallback(() => {
    setFilters((currentFilters) => {
      if (page >= totalPages) {
        return currentFilters;
      }

      fetchPage(page + 1, currentFilters, true);

      return currentFilters;
    });
  }, [fetchPage, page, totalPages]);

  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (!sentinel) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "800px" }
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <section className="mx-auto max-w-screen-2xl py-8">
      <div className="no-scrollbar mb-6 flex gap-2 overflow-x-auto px-4 sm:px-6">
        {SORT_OPTIONS.map((option) => (
          <TabChip
            key={option.key}
            label={option.label}
            isActive={filters.sortKey === option.key && filters.genreId === undefined}
            onClick={() => applyFilters({ sortKey: option.key })}
          />
        ))}

        {genres.map((genre) => (
          <TabChip
            key={genre.id}
            label={genre.name}
            isActive={filters.genreId === genre.id}
            onClick={() => applyFilters({ sortKey: "popular", genreId: genre.id })}
          />
        ))}
      </div>

      {items.length === 0 && !isLoading ? (
        <p className="px-4 text-sm text-muted-foreground sm:px-6">No results found.</p>
      ) : (
        <div className="grid grid-cols-3 gap-4 px-4 sm:grid-cols-4 sm:px-6 md:grid-cols-5 lg:grid-cols-6">
          {items.map((item) => (
            <MovieCard key={`${item.mediaType}-${item.id}`} media={item} variant="grid" />
          ))}
        </div>
      )}

      {isLoading ? <SkeletonCardGrid /> : null}

      <div ref={sentinelRef} aria-hidden="true" />
    </section>
  );
}

interface TabChipProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

function TabChip({ label, isActive, onClick }: TabChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-9 shrink-0 rounded-full border px-4 text-sm font-medium transition-colors duration-150 ${
        isActive
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}

function toSortBy(sortKey: SortKey, mediaType: MediaType): string {
  switch (sortKey) {
    case "rating":
      return "vote_average.desc";
    case "recent":
      return mediaType === "tv" ? "first_air_date.desc" : "release_date.desc";
    case "popular":
    default:
      return "popularity.desc";
  }
}