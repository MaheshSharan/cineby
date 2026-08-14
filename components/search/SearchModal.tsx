import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import type { MediaSummary, MediaType } from "@/lib/tmdb";
import { getPosterResponsiveUrls } from "@/lib/tmdb/image";
import { getEpisodeHref, getMediaHref, getPlayHref, getYear } from "@/lib/utils/media";

import { ChevronDownIcon, SearchIcon, StarIcon, XIcon } from "@/components/ui/icons";

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
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [results, setResults] = useState<MediaSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const filterDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      setHasSearched(false);
      setExpandedId(null);
      setIsFilterDropdownOpen(false);
      return;
    }

    inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (isFilterDropdownOpen) {
          setIsFilterDropdownOpen(false);
        } else {
          onClose();
        }
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterDropdownRef.current &&
        !filterDropdownRef.current.contains(event.target as Node)
      ) {
        setIsFilterDropdownOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, onClose, isFilterDropdownOpen]);

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (!open || !trimmedQuery) {
      setResults([]);
      setHasSearched(false);
      setIsLoading(false);
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

  const selectedFilterLabel =
    FILTER_OPTIONS.find((option) => option.key === filter)?.label ?? "Movies & TV Shows";

  const toggleExpanded = (itemKey: string) => {
    setExpandedId((current) => (current === itemKey ? null : itemKey));
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center px-4 pt-16 sm:pt-24"
      role="dialog"
      aria-modal="true"
      aria-label="Search"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative z-10 flex w-full max-w-[440px] flex-col gap-2 transition-all duration-300">
        <div className="flex w-full items-end justify-between pl-2">
          <span className="text-xl font-semibold text-white">Search</span>

          <div className="flex items-center gap-1">
            <div ref={filterDropdownRef} className="relative">
              <button
                type="button"
                aria-haspopup="listbox"
                aria-expanded={isFilterDropdownOpen}
                onClick={() => setIsFilterDropdownOpen((prev) => !prev)}
                className="glass-card-dark flex h-9 w-44 items-center justify-between rounded-lg border border-white/10 px-3 pl-4 text-[13px] text-gray-300 backdrop-blur-xl transition-colors hover:bg-white/10"
              >
                <span className="truncate">{selectedFilterLabel}</span>
                <ChevronDownIcon
                  size={16}
                  className={`ml-1 flex-shrink-0 opacity-50 transition-transform duration-200 ${
                    isFilterDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isFilterDropdownOpen ? (
                <div
                  role="listbox"
                  aria-label="Filter options"
                  className="glass-card-dark absolute right-0 top-full z-20 mt-1 w-44 overflow-hidden rounded-lg border border-white/10 bg-[#05070a]/90 shadow-xl backdrop-blur-xl"
                >
                  {FILTER_OPTIONS.map((option) => (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => {
                        setFilter(option.key);
                        setIsFilterDropdownOpen(false);
                      }}
                      className={`flex w-full items-center px-4 py-2 text-left text-[13px] transition-colors duration-150 ${
                        filter === option.key
                          ? "bg-white/10 font-medium text-white"
                          : "text-gray-300 hover:bg-white/[0.06] hover:text-white"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <button
              type="button"
              aria-label="Close search"
              onClick={onClose}
              className="glass-card-dark flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 backdrop-blur-xl transition-colors hover:bg-white/10"
            >
              <XIcon size={18} className="text-gray-400 transition-colors hover:text-white" />
            </button>
          </div>
        </div>

        <div className="glass-card-dark relative h-12 w-full overflow-hidden rounded-xl border border-white/10 backdrop-blur-xl">
          <SearchIcon
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Type here to search..."
            aria-label="Search movies and TV shows"
            className="h-full w-full bg-transparent pl-12 pr-10 text-base text-gray-100 placeholder:text-gray-400 tracking-wide outline-none"
          />
          {query ? (
            <button
              type="button"
              aria-label="Clear search query"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition-colors hover:text-gray-200"
            >
              <XIcon size={16} />
            </button>
          ) : null}
        </div>

        {query.trim() ? (
          <div className="glass-card-dark overflow-hidden rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl">
            <div
              className="max-h-[50vh] overflow-y-auto overflow-x-hidden pt-2 scrollbar-hidden"
              style={{ scrollbarWidth: "none" }}
            >
              {isLoading ? (
                <div className="flex items-center justify-center py-10 text-sm text-gray-400">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : hasSearched && filteredResults.length === 0 ? (
                <div className="py-8 text-center text-sm text-gray-400">
                  No results found for &quot;{query.trim()}&quot;
                </div>
              ) : (
                <div className="flex flex-col gap-0.5 px-2 pb-2">
                  {filteredResults.map((item) => {
                    const itemKey = `${item.mediaType}-${item.id}`;
                    const isExpanded = expandedId === itemKey;

                    return (
                      <SearchResultItem
                        key={itemKey}
                        item={item}
                        isExpanded={isExpanded}
                        onToggle={() => toggleExpanded(itemKey)}
                        onSelect={onClose}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

interface SearchResultItemProps {
  item: MediaSummary;
  isExpanded: boolean;
  onToggle: () => void;
  onSelect: () => void;
}

function SearchResultItem({ item, isExpanded, onToggle, onSelect }: SearchResultItemProps) {
  const { mobile } = getPosterResponsiveUrls(item.posterPath);
  const year = getYear(item.releaseDate);
  const typeLabel = item.mediaType === "tv" ? "TV Show" : "Movie";
  const playHref =
    item.mediaType === "tv"
      ? getEpisodeHref(item.id, 1, 1)
      : getPlayHref(item.mediaType, item.id);
  const mediaHref = getMediaHref(item.mediaType, item.id);

  return (
    <div className="rounded-lg transition-colors duration-150 hover:bg-white/[0.03]">
      <div
        onClick={onToggle}
        className="flex cursor-pointer items-center gap-3 px-3 py-2.5"
      >
        <div className="h-16 w-11 flex-shrink-0 overflow-hidden rounded-[5px] bg-white/5">
          {mobile ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={mobile}
              alt={item.title}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center p-1 text-center text-[10px] text-gray-400">
              {item.title}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h4 className="line-clamp-1 text-[14px] font-medium text-white">{item.title}</h4>
          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[12px] text-gray-500">
            <span>{typeLabel}</span>
            {year ? (
              <>
                <span className="text-white/15">|</span>
                <span>{year}</span>
              </>
            ) : null}
            <span className="text-white/15">|</span>
            <span className="flex items-center gap-0.5">
              <StarIcon size={12} className="fill-yellow-500 text-yellow-500" />
              <span>{item.voteAverage.toFixed(1)}</span>
            </span>
          </div>
        </div>

        <ChevronDownIcon
          size={16}
          className={`flex-shrink-0 text-gray-600 transition-transform duration-200 ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </div>

      {isExpanded ? (
        <div className="overflow-hidden px-3 pb-3 pt-0.5 transition-all duration-300 ease-out">
          {item.overview ? (
            <p className="mb-3 line-clamp-3 text-[12px] leading-relaxed text-gray-400">
              {item.overview}
            </p>
          ) : null}
          <div className="flex items-center gap-2">
            <Link
              href={playHref}
              onClick={onSelect}
              className="flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-[12px] font-medium text-black transition-colors hover:bg-white/90"
            >
              <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <polygon points="5,3 19,12 5,21" />
              </svg>
              Play
            </Link>
            <Link
              href={mediaHref}
              onClick={onSelect}
              className="flex items-center gap-1.5 rounded-full bg-white/[0.08] px-3.5 py-1.5 text-[12px] font-medium text-gray-300 transition-colors hover:bg-white/[0.12]"
            >
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4M12 8h.01" />
              </svg>
              See more
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}