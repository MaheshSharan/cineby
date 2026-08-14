import Link from "next/link";
import { useEffect, useState } from "react";

import type { HistoryEntry } from "@/lib/db/types";
import { listHistory, removeFromHistory } from "@/lib/api/history";
import { getPlayHref } from "@/lib/utils/media";
import { getPosterResponsiveUrls } from "@/lib/tmdb/image";
import { useAuth } from "@/components/auth/AuthProvider";
import { ContentRow } from "@/components/content/ContentRow";
import { XIcon } from "@/components/ui/icons";

export function ContinueWatchingRow() {
  const { user } = useAuth();
  const [items, setItems] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    if (!user) {
      setItems([]);
      return;
    }

    let isCurrent = true;

    listHistory().then((data) => {
      if (isCurrent) {
        setItems(data);
      }
    });

    return () => {
      isCurrent = false;
    };
  }, [user]);

  const handleRemove = async (entry: HistoryEntry) => {
    const success = await removeFromHistory(entry.id);
    if (success) {
      setItems((prev) => prev.filter((i) => i.id !== entry.id));
    }
  };

  if (!user || items.length === 0) {
    return null;
  }

  return (
    <ContentRow title="Continue watching">
      {items.map((item) => (
        <ContinueWatchingCard
          key={item.id}
          entry={item}
          onRemove={handleRemove}
        />
      ))}
    </ContentRow>
  );
}

interface ContinueWatchingCardProps {
  entry: HistoryEntry;
  onRemove: (entry: HistoryEntry) => void;
}

function ContinueWatchingCard({ entry, onRemove }: ContinueWatchingCardProps) {
  const poster = getPosterResponsiveUrls(entry.posterPath);
  const playHref = getPlayHref(entry.mediaType, entry.mediaId);

  const subtitle =
    entry.mediaType === "tv"
      ? entry.seasonNumber && entry.episodeNumber
        ? `S${entry.seasonNumber} E${entry.episodeNumber}`
        : "TV Show"
      : "Movie";

  return (
    <div className="group relative w-[140px] xs:w-[150px] flex-shrink-0 md:w-[180px] lg:w-[200px]">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onRemove(entry);
        }}
        title="Remove from history"
        aria-label={`Remove ${entry.title} from history`}
        className="absolute right-2 top-2 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white/70 backdrop-blur-md transition-colors duration-200 hover:text-red-400 md:invisible md:opacity-0 md:group-hover:visible md:group-hover:opacity-100"
      >
        <XIcon size={14} />
      </button>

      <Link href={playHref} aria-label={entry.title} className="flex flex-col">
        <div className="relative aspect-[2/3] w-full overflow-hidden rounded-[10px] border border-white/10 bg-surface-1 transition-all duration-200">
          <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-[#05070a]/[0.92] via-[#05070a]/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          {poster.mobile ? (
            <picture>
              {poster.desktop ? (
                <source media="(min-width: 768px)" srcSet={poster.desktop} />
              ) : null}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={poster.mobile}
                alt={entry.title}
                loading="lazy"
                decoding="async"
                className="aspect-[2/3] h-full w-full object-cover object-top transition-transform duration-[550ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
              />
            </picture>
          ) : (
            <div className="flex aspect-[2/3] h-full w-full items-center justify-center p-3 text-center text-[11px] font-medium text-text-mid">
              {entry.title}
            </div>
          )}

          {entry.duration ? (
            <div className="absolute bottom-2 right-2 z-[2] rounded bg-black/75 px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-white backdrop-blur-sm">
              {entry.duration}
            </div>
          ) : null}
        </div>

        <div className="mt-2.5 px-0.5">
          <h3 className="line-clamp-1 text-[13px] font-medium leading-snug text-text-hi transition-colors duration-200 group-hover:text-primary">
            {entry.title}
          </h3>
          <div className="mt-1 flex items-center gap-1.5 truncate text-[11px] leading-none text-text-mid">
            <span>{subtitle}</span>
          </div>
        </div>
      </Link>
    </div>
  );
}
