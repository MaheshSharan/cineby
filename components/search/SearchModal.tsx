import { useEffect, useRef, useState } from "react";

import type { MediaSummary, MediaType } from "@/lib/tmdb";

import { MovieCard } from "@/components/movie/MovieCard";
import { SkeletonCardGrid } from "@/components/skeleton/SkeletonCard";

type SearchFilter = "all" | MediaType;

const FILTER_OPTIONS: { key: SearchFilter; label: string }[] = [
  { key: "all", label: "Movies & TV Shows" },
  { key: "movie", label: "Movies" },
  { key: "tv", label: "TV Shows" },
];

const DEBOUNCE_MS = 350;

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

export function SearchModal({ open, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<SearchFilter>("all");
  const [results, setResults] = useState<MediaSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      setHasSearched(false);
      return;
    }

    inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (!open || !trimmedQuery) {
      setResults([]);
      return;
    }

    setIsLoading(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      fetch(`/api/tmdb/search?q=${encodeURIComponent(trimmedQuery)}`, {
        signal: controller.signal,
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Search request failed: ${response.status}`);
          }

          return response.json() as Promise<{ results: MediaSummary[] }>;
        })
        .then((data) => {
          setResults(data.results);
          setHasSearched(true);
        })
        .catch((error: unknown) => {
          if (error instanceof Error && error.name === "AbortError") {
            return;
          }

          setResults([]);
          setHasSearched(true);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [query, open]);

  if (!open) {
    return null;
  }

  const filteredResults =
    filter === "all" ? results : results.filter((item) => item.mediaType === filter);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 pt-16 backdrop-blur-sm sm:pt-24"
      role="dialog"
      aria-modal="true"
      aria-label="Search"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-2xl rounded-lg border border-border bg-popover p-4 shadow-2xl">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold uppercase tracking-[0.05em]">Search</h2>
          <div className="relative">
            <button
              type="button"
              aria-haspopup="listbox"
              aria-expanded="false"
              onClick={() => setFilter(cycleFilter(filter))}
              className="rounded-full border border-border px-3 py-1 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
            >
              {FILTER_OPTIONS.find((option) => option.key === filter)?.label}
            </button>
          </div>
          <button
            type="button"
            aria-label="Close search"
            onClick={onClose}
            className="ml-auto flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="relative mt-4">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Type here to search..."
            aria-label="Search movies and TV shows"
            className="h-11 w-full rounded-full border border-input bg-background pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        <div className="mt-4">
          {isLoading ? (
            <SkeletonCardGrid />
          ) : !query.trim() ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Search for movies and TV shows.
            </p>
          ) : hasSearched && filteredResults.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No results found for &quot;{query.trim()}&quot;.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-4 sm:grid-cols-4">
              {filteredResults.map((item) => (
                <MovieCard key={`${item.mediaType}-${item.id}`} media={item} variant="grid" />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function cycleFilter(current: SearchFilter): SearchFilter {
  const index = FILTER_OPTIONS.findIndex((option) => option.key === current);

  return FILTER_OPTIONS[(index + 1) % FILTER_OPTIONS.length].key;
}

function SearchIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}