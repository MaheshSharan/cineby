import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";

import type { HistoryEntry } from "@/lib/db/types";
import { clearAllHistory, listHistory, removeFromHistory } from "@/lib/api/history";
import { addToWatchlist } from "@/lib/api/watchlist";
import { getPlayHref } from "@/lib/utils/media";
import { getPosterResponsiveUrls } from "@/lib/tmdb/image";
import { useAuth } from "@/components/auth/AuthProvider";
import { BookmarkIcon, TrashIcon, XIcon } from "@/components/ui/icons";

const HistoryPage: NextPage = () => {
  const { user, isLoading, openAuthModal, showToast } = useAuth();
  const [items, setItems] = useState<HistoryEntry[]>([]);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    if (!user) {
      setItems([]);
      return;
    }

    let isCurrent = true;

    listHistory().then((result) => {
      if (isCurrent) {
        setItems(result);
      }
    });

    return () => {
      isCurrent = false;
    };
  }, [user]);

  const handleRemoveItem = async (entry: HistoryEntry) => {
    const success = await removeFromHistory(entry.id);
    if (success) {
      setItems((prev) => prev.filter((i) => i.id !== entry.id));
      showToast("Removed from history successfully");
    }
  };

  const handleClearAll = async () => {
    setIsClearing(true);
    try {
      const success = await clearAllHistory();
      if (success) {
        setItems([]);
        setShowClearConfirm(false);
        showToast("History cleared successfully");
      }
    } finally {
      setIsClearing(false);
    }
  };

  const handleAddToWatchlist = async (entry: HistoryEntry) => {
    if (!user) {
      openAuthModal("login");
      return;
    }

    const success = await addToWatchlist({
      mediaType: entry.mediaType,
      mediaId: entry.mediaId,
      title: entry.title,
      posterPath: entry.posterPath,
      backdropPath: entry.backdropPath,
    });

    if (success) {
      showToast("Added to watchlist");
    }
  };

  return (
    <>
      <Head>
        <title>History - Cineby</title>
        <meta name="description" content="Keep track of all the movies and TV shows you've watched." />
      </Head>

      <main className="mx-auto max-w-[1360px] min-h-[calc(100vh-88px)] md:min-h-[calc(100vh-90px)] px-4 pb-16 pt-28 md:px-8 md:pt-36">
        {isLoading ? (
          <div className="flex min-h-[50vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : !user ? (
          <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/popcorn.svg"
              alt=""
              aria-hidden="true"
              className="mb-4 h-36 w-36 select-none opacity-80 drop-shadow-2xl"
            />
            <h1 className="mb-1 text-xl font-semibold text-white md:text-2xl">No watch history found</h1>
            <p className="mb-6 max-w-sm text-sm text-gray-400">
              Sign in to keep track of all the movies and TV shows you&apos;ve watched.
            </p>
            <button
              type="button"
              onClick={() => openAuthModal("login")}
              className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-primary/20 transition-all duration-200 hover:bg-primary/90 hover:scale-105"
            >
              Sign in
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="flex min-h-[55vh] flex-col items-center justify-center text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/popcorn.svg"
              alt=""
              aria-hidden="true"
              className="mb-4 h-36 w-36 select-none drop-shadow-2xl"
            />
            <h1 className="mb-1 text-xl font-semibold text-white">No watch history found</h1>
            <p className="text-sm text-gray-400">
              Keep track of all the movies and TV shows you&apos;ve watched
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-xl font-bold text-white md:text-2xl">Watch history</h1>
                <p className="mt-1 text-xs text-text-mid md:text-sm">
                  Keep track of all the movies and TV shows you&apos;ve watched
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowClearConfirm(true)}
                className="inline-flex items-center gap-2 self-start rounded-lg border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-medium text-text-mid backdrop-blur-md transition-all duration-200 hover:border-red-500/40 hover:bg-red-500/15 hover:text-red-400 sm:self-auto"
              >
                <TrashIcon size={14} />
                <span>Clear all history</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 md:gap-3">
              {items.map((entry) => (
                <HistoryCard
                  key={entry.id}
                  entry={entry}
                  onRemove={handleRemoveItem}
                  onAddToWatchlist={handleAddToWatchlist}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {showClearConfirm ? (
        <>
          <div
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            onClick={() => setShowClearConfirm(false)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Clear all history"
            className="glass-card-dark fixed left-1/2 top-1/2 z-[200] w-[90%] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 p-6 shadow-2xl backdrop-blur-xl"
          >
            <h3 className="text-lg font-semibold text-white">Clear History</h3>
            <p className="mt-2 text-sm text-gray-400">
              Are you sure that want to clear all history?
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                disabled={isClearing}
                onClick={handleClearAll}
                className="flex-1 rounded-xl bg-red-600 py-2.5 px-4 text-sm font-medium text-white shadow-lg transition-colors hover:bg-red-700 disabled:opacity-60"
              >
                {isClearing ? "Clearing…" : "Clear all"}
              </button>
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="glass-card-subtle flex-1 rounded-xl border border-gray-400/20 py-2.5 px-4 text-sm font-medium text-gray-300 transition-colors hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
};

interface HistoryCardProps {
  entry: HistoryEntry;
  onRemove: (entry: HistoryEntry) => void;
  onAddToWatchlist: (entry: HistoryEntry) => void;
}

function HistoryCard({ entry, onRemove, onAddToWatchlist }: HistoryCardProps) {
  const poster = getPosterResponsiveUrls(entry.posterPath);
  const playHref = getPlayHref(entry.mediaType, entry.mediaId);

  const subtitle =
    entry.mediaType === "tv"
      ? entry.seasonNumber && entry.episodeNumber
        ? `S${entry.seasonNumber} E${entry.episodeNumber}`
        : "TV Show"
      : "Movie";

  return (
    <div className="group relative flex flex-col">
      <div className="absolute right-2 top-2 z-20 flex items-center gap-1 md:invisible md:opacity-0 md:group-hover:visible md:group-hover:opacity-100 transition-all duration-200">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onAddToWatchlist(entry);
          }}
          title="Add to watchlist"
          aria-label={`Add ${entry.title} to watchlist`}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white/70 backdrop-blur-md transition-colors duration-200 hover:text-primary"
        >
          <BookmarkIcon size={15} />
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove(entry);
          }}
          title="Remove from history"
          aria-label={`Remove ${entry.title} from history`}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white/70 backdrop-blur-md transition-colors duration-200 hover:text-red-400"
        >
          <XIcon size={16} />
        </button>
      </div>

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

          {entry.progress ? (
            <div className="absolute bottom-0 left-0 z-[6] h-[3px] w-full bg-[#05070a]/60">
              <div
                className="h-full bg-gradient-to-r from-primary to-[#ff5252] shadow-[0_0_10px_rgba(220,38,38,0.5)]"
                style={{ width: `${Math.min(100, Math.max(0, entry.progress))}%` }}
              />
            </div>
          ) : null}

          {entry.duration ? (
            <div className="absolute bottom-2 right-2 z-[6] flex items-center gap-1 rounded-md border border-white/10 bg-[#05070a]/75 px-2 py-1 text-[11px] font-medium text-[#eef1f6] backdrop-blur-md">
              <span>{entry.duration}</span>
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

export default HistoryPage;