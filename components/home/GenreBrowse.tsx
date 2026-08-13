import { useEffect, useRef, useState } from "react";

import type { Genre, MediaSummary } from "@/lib/tmdb";

import { ContentRow } from "@/components/content/ContentRow";
import { MovieCard } from "@/components/movie/MovieCard";
import { SkeletonRow } from "@/components/skeleton/SkeletonRow";
import { Tabs, type TabOption } from "@/components/ui/Tabs";

const DEFAULT_GENRE_ID = 28;

interface GenreBrowseProps {
  genres: Genre[];
  initialItems: MediaSummary[];
}

export function GenreBrowse({ genres, initialItems }: GenreBrowseProps) {
  const [mediaTypeKey, setMediaTypeKey] = useState<"movies" | "series">("movies");
  const [genreId, setGenreId] = useState(DEFAULT_GENRE_ID);
  const [items, setItems] = useState(initialItems);
  const [isLoading, setIsLoading] = useState(false);

  const loadItems = (nextMediaType: "movies" | "series", nextGenreId: number) => {
    setIsLoading(true);

    const mediaType = nextMediaType === "series" ? "tv" : "movie";

    fetch(`/api/tmdb/browse?mediaType=${mediaType}&genreId=${nextGenreId}&page=1`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Browse request failed: ${response.status}`);
        }

        return response.json() as Promise<{ results: MediaSummary[] }>;
      })
      .then((data) => {
        setItems(data.results);
      })
      .catch(() => {
        setItems([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleMediaTypeChange = (key: string) => {
    const next = key === "series" ? "series" : "movies";

    setMediaTypeKey(next);
    loadItems(next, genreId);
  };

  const handleGenreChange = (id: number) => {
    setGenreId(id);
    loadItems(mediaTypeKey, id);
  };

  const options: TabOption[] = [
    { key: "movies", label: "Movies" },
    { key: "series", label: "Series" },
  ];

  return (
    <section className="py-6">
      <div className="mb-3 flex items-center justify-between gap-4 px-4 sm:px-6">
        <GenreDropdown genres={genres} selectedId={genreId} onChange={handleGenreChange} />
        <Tabs options={options} activeKey={mediaTypeKey} onChange={handleMediaTypeChange} />
      </div>

      {isLoading ? (
        <SkeletonRow count={10} />
      ) : (
        <ContentRow>
          {items.map((item) => (
            <MovieCard key={item.id} media={item} />
          ))}
        </ContentRow>
      )}
    </section>
  );
}

interface GenreDropdownProps {
  genres: Genre[];
  selectedId: number;
  onChange: (id: number) => void;
}

function GenreDropdown({ genres, selectedId, onChange }: GenreDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = genres.find((genre) => genre.id === selectedId);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className="flex h-9 items-center gap-2 rounded-full border border-border bg-secondary px-4 text-sm font-medium text-foreground transition-colors duration-150 hover:bg-muted"
      >
        <span className="text-muted-foreground">Select genre</span>
        <span className="text-foreground">{selected?.name}</span>
        <svg
          viewBox="0 0 24 24"
          className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-150 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {isOpen ? (
        <div
          role="listbox"
          aria-label="Genres"
          className="absolute left-0 top-full z-20 mt-2 max-h-72 w-56 overflow-y-auto rounded-lg border border-border bg-popover p-1.5 shadow-xl"
        >
          {genres.map((genre) => (
            <button
              key={genre.id}
              type="button"
              role="option"
              aria-selected={genre.id === selectedId}
              onClick={() => {
                onChange(genre.id);
                setIsOpen(false);
              }}
              className={`block w-full rounded-md px-3 py-2 text-left text-sm transition-colors duration-100 ${
                genre.id === selectedId
                  ? "bg-primary text-primary-foreground"
                  : "text-popover-foreground hover:bg-secondary"
              }`}
            >
              {genre.name}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}