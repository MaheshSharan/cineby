import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";

import type { HistoryEntry } from "@/lib/db/types";
import { listHistory } from "@/lib/api/history";
import { getMediaHref } from "@/lib/utils/media";

import { useAuth } from "@/components/auth/AuthProvider";

const HistoryPage: NextPage = () => {
  const { user, isLoading, openAuthModal } = useAuth();
  const [items, setItems] = useState<HistoryEntry[]>([]);

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

  useEffect(() => {
    if (!isLoading && !user) {
      openAuthModal("login");
    }
  }, [isLoading, user, openAuthModal]);

  return (
    <>
      <Head>
        <title>History | Cineby</title>
        <meta name="description" content="Your watch history." />
      </Head>

      <div className="mx-auto max-w-[1360px] px-4 pb-16 pt-24 md:px-8 md:pt-32">
        {isLoading || !user ? (
          <div className="flex flex-col items-center justify-center gap-4 py-32 text-center">
            <h1 className="text-2xl font-semibold text-text-hi md:text-3xl">Watch History</h1>
            <p className="max-w-sm text-sm text-text-mid">
              Sign in to view your watch history.
            </p>
            <button
              type="button"
              onClick={() => openAuthModal("login")}
              className="mt-2 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90"
            >
              Sign In
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-32 text-center">
            <h1 className="text-2xl font-semibold text-text-hi md:text-3xl">Watch History</h1>
            <p className="text-sm text-text-mid">You haven&apos;t watched anything yet.</p>
            <Link
              href="/"
              className="mt-4 rounded-full border border-white/15 px-6 py-2.5 text-sm font-medium text-text-hi transition-colors hover:border-primary/40 hover:text-primary"
            >
              Browse titles
            </Link>
          </div>
        ) : (
          <>
            <h1 className="heading-trail mb-6 text-xl font-semibold text-text-hi md:text-2xl">
              Watch History
            </h1>
            <ul className="flex flex-col gap-2">
              {items.map((entry) => (
                <li key={entry.id}>
                  <Link
                    href={getMediaHref(entry.mediaType, entry.mediaId)}
                    className="group flex items-center gap-4 rounded-[14px] border border-white/[0.06] bg-white/[0.02] p-3 transition-all duration-200 hover:border-primary/30 hover:bg-white/[0.04]"
                  >
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <h3 className="line-clamp-1 text-[15px] font-medium leading-snug text-text-hi transition-colors duration-200 group-hover:text-primary">
                        {entry.title}
                      </h3>
                      <span className="text-[11.5px] tabular-nums text-text-mid">
                        {formatWatchedAt(entry.watchedAt)}
                        {entry.seasonNumber ? ` · S${entry.seasonNumber}` : null}
                        {entry.episodeNumber ? `E${entry.episodeNumber}` : null}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </>
  );
};

function formatWatchedAt(iso: string): string {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export default HistoryPage;