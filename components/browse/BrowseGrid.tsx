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
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const sentinelRef = useRef<HTMLDivElement>(null);
  const requestInFlightRef = useRef(false);
  const moreDropdownRef = useRef<HTMLDivElement>(null);

  // Reset state when mediaType or initialItems change (e.g. client-side routing between /browse/movie & /browse/tv)
  useEffect(() => {
    setFilters({ sortKey: "popular" });
    setItems(initialItems);
    setPage(1);
    setTotalPages(1);
  }, [mediaType, initialItems]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (moreDropdownRef.current && !moreDropdownRef.current.contains(event.target as Node)) {
        setIsMoreOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
      setIsMoreOpen(false);
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
      { rootMargin: "400px" }
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [loadMore]);

  // Main visible tabs & remaining overflow genres
  const visibleGenres = genres.slice(0, 12);
  const overflowGenres = genres.slice(12);

  return (
    <section className="mx-auto max-w-[1360px] px-4 pt-24 pb-12 md:pt-28">
      {/* Category & Genre Navigation Bar */}
      <div className={`no-scrollbar mb-8 flex items-center gap-6 border-b border-white/10 pb-3 ${isMoreOpen ? "overflow-visible" : "overflow-x-auto"}`}>
        {SORT_OPTIONS.map((option) => (
          <TabOptionBtn
            key={option.key}
            label={option.label}
            isActive={filters.sortKey === option.key && filters.genreId === undefined}
            onClick={() => applyFilters({ sortKey: option.key })}
          />
        ))}

        {visibleGenres.map((genre) => (
          <TabOptionBtn
            key={genre.id}
            label={genre.name}
            isActive={filters.genreId === genre.id}
            onClick={() => applyFilters({ sortKey: "popular", genreId: genre.id })}
          />
        ))}

        {overflowGenres.length > 0 ? (
          <div className="relative shrink-0" ref={moreDropdownRef}>
            <button
              type="button"
              aria-label="More genres"
              onClick={() => setIsMoreOpen((prev) => !prev)}
              className="relative pb-1 text-sm font-medium text-gray-400 hover:text-gray-200 transition-colors duration-200"
            >
              ···
            </button>

            {isMoreOpen ? (
              <div className="absolute right-0 top-full mt-2 z-[9999] min-w-[12rem] rounded-xl shadow-2xl glass-card-dark backdrop-blur-xl border border-white/10 p-1.5 flex flex-col max-h-60 overflow-y-auto no-scrollbar">
                {overflowGenres.map((genre) => (
                  <button
                    key={genre.id}
                    type="button"
                    onClick={() => applyFilters({ sortKey: "popular", genreId: genre.id })}
                    className={`w-full px-3 py-2 text-left text-[13px] rounded-lg transition-colors ${
                      filters.genreId === genre.id ? "text-primary font-semibold bg-white/[0.04]" : "text-text-hi hover:bg-white/[0.04]"
                    }`}
                  >
                    {genre.name}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      {/* Grid of Movie/TV Cards */}
      {items.length === 0 && !isLoading ? (
        <p className="py-12 text-center text-sm text-text-mid">No results found.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
          {items.map((item) => (
            <MovieCard key={`${item.mediaType}-${item.id}`} media={item} variant="backdrop" className="w-full" />
          ))}
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading ? <SkeletonCardGrid /> : null}

      <div ref={sentinelRef} aria-hidden="true" className="h-10" />
    </section>
  );
}

interface TabOptionBtnProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

function TabOptionBtn({ label, isActive, onClick }: TabOptionBtnProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative shrink-0 pb-1 text-sm font-medium transition-colors duration-200 ${
        isActive ? "text-white" : "text-gray-400 hover:text-gray-200"
      }`}
    >
      {label}
      <span
        className={`absolute inset-x-0 -bottom-[13px] h-0.5 rounded-full bg-primary transition-all duration-200 ${
          isActive ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
        }`}
      />
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