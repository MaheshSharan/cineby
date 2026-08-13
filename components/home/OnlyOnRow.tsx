import { useCallback, useEffect, useRef, useState } from "react";

import type { MediaSummary } from "@/lib/tmdb";
import { ContentRow } from "@/components/content/ContentRow";
import { MovieCard } from "@/components/movie/MovieCard";

export interface StreamingProvider {
  id: number;
  name: string;
  shortName: string;
  bgColor: string;
  textColor: string;
  fontSize?: string;
}

export const STREAMING_PROVIDERS: StreamingProvider[] = [
  { id: 8, name: "Netflix", shortName: "N", bgColor: "#e50914", textColor: "#ffffff", fontSize: "11px" },
  { id: 119, name: "Prime Video", shortName: "P", bgColor: "#00a8e1", textColor: "#0a1929", fontSize: "11px" },
  { id: 384, name: "Max", shortName: "M", bgColor: "#0e0e0e", textColor: "#ffffff", fontSize: "11px" },
  { id: 337, name: "Disney+", shortName: "D+", bgColor: "#113ccf", textColor: "#ffffff", fontSize: "8px" },
  { id: 350, name: "Apple TV+", shortName: "tv", bgColor: "#000000", textColor: "#ffffff", fontSize: "8px" },
  { id: 531, name: "Paramount+", shortName: "P+", bgColor: "#0064ff", textColor: "#ffffff", fontSize: "8px" },
  { id: 15, name: "Hulu", shortName: "H", bgColor: "#1ce783", textColor: "#0a1a0f", fontSize: "11px" },
];

interface OnlyOnRowProps {
  initialItems: MediaSummary[];
}

export function OnlyOnRow({ initialItems }: OnlyOnRowProps) {
  const [selectedProvider, setSelectedProvider] = useState<StreamingProvider>(STREAMING_PROVIDERS[0]);
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<MediaSummary[]>(initialItems);
  const [isLoading, setIsLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectProvider = useCallback(async (provider: StreamingProvider) => {
    setSelectedProvider(provider);
    setIsOpen(false);

    if (provider.id === 8 && initialItems.length > 0) {
      setItems(initialItems);

      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`/api/discover/provider?providerId=${provider.id}`);
      if (res.ok) {
        const data = (await res.json()) as { results: MediaSummary[] };
        setItems(data.results);
      }
    } catch {
      // Keep existing items on failure
    } finally {
      setIsLoading(false);
    }
  }, [initialItems]);

  const customTitle = (
    <div className="flex items-baseline gap-2 flex-wrap" ref={containerRef}>
      <span>Only on</span>
      <div className="relative inline-block select-none align-baseline">
        <button
          type="button"
          aria-label="Select streaming provider"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((prev) => !prev)}
          className="group inline-flex items-baseline gap-1.5 text-inherit font-inherit cursor-pointer"
        >
          <span className="border-b-2 border-primary pb-0.5">{selectedProvider.name}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`lucide lucide-chevron-down flex-shrink-0 self-center -ml-0.5 transition-transform duration-200 text-primary ${
              isOpen ? "rotate-180" : ""
            }`}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>

        {isOpen ? (
          <div
            role="listbox"
            aria-label="Select streaming provider"
            className="absolute left-0 top-full mt-2 z-[9999] min-w-[14rem] rounded-2xl shadow-2xl glass-card-dark backdrop-blur-xl border border-white/10 flex flex-col"
          >
            <ul className="no-scrollbar py-1 overflow-y-auto max-h-60">
              {STREAMING_PROVIDERS.map((provider) => {
                const isSelected = provider.id === selectedProvider.id;

                return (
                  <li key={provider.id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => void handleSelectProvider(provider)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-left text-[14px] transition-colors ${
                        isSelected
                          ? "text-primary font-semibold bg-white/[0.04]"
                          : "text-text-hi hover:bg-white/[0.04]"
                      }`}
                    >
                      <span className="flex-shrink-0">
                        <span
                          aria-hidden="true"
                          className="inline-flex items-center justify-center rounded-full font-bold leading-none ring-1 ring-white/10"
                          style={{
                            width: "22px",
                            height: "22px",
                            backgroundColor: provider.bgColor,
                            color: provider.textColor,
                            fontSize: provider.fontSize ?? "11px",
                            letterSpacing: "-0.02em",
                          }}
                        >
                          {provider.shortName}
                        </span>
                      </span>
                      <span className="flex-1 truncate">{provider.name}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );

  const displayItems = Array.isArray(items) ? items : (Array.isArray(initialItems) ? initialItems : []);

  return (
    <ContentRow title={customTitle} className={isLoading ? "opacity-50 transition-opacity duration-200" : "transition-opacity duration-200"}>
      {displayItems.map((item) => (
        <MovieCard key={item.id} media={item} variant="backdrop" />
      ))}
    </ContentRow>
  );
}
