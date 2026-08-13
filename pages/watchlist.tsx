import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";

import type { WatchlistItem } from "@/lib/db/types";
import { listWatchlist } from "@/lib/api/watchlist";
import { getMediaHref } from "@/lib/utils/media";
import { getPosterResponsiveUrls } from "@/lib/tmdb/image";

import { useAuth } from "@/components/auth/AuthProvider";

const WatchlistPage: NextPage = () => {
  const { user, isLoading, openAuthModal } = useAuth();
  const [items, setItems] = useState<WatchlistItem[]>([]);

  useEffect(() => {
    if (!user) {
      setItems([]);
      return;
    }

    let isCurrent = true;

    listWatchlist().then((result) => {
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
        <title>Watchlist | Cineby</title>
        <meta name="description" content="Your saved movies and TV shows." />
      </Head>

      <div className="mx-auto max-w-[1360px] px-4 pb-16 pt-24 md:px-8 md:pt-32">
        {isLoading || (!user) ? (
          <div className="flex flex-col items-center justify-center gap-4 py-32 text-center">
            <h1 className="text-2xl font-semibold text-text-hi md:text-3xl">My Watchlist</h1>
            <p className="max-w-sm text-sm text-text-mid">
              Sign in to view and manage your saved movies and TV shows.
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
            <h1 className="text-2xl font-semibold text-text-hi md:text-3xl">My Watchlist</h1>
            <p className="text-sm text-text-mid">Your watchlist is empty.</p>
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
              My Watchlist
            </h1>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {items.map((item) => (
                <WatchlistCard key={`${item.mediaType}-${item.mediaId}`} item={item} />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
};

interface WatchlistCardProps {
  item: WatchlistItem;
}

function WatchlistCard({ item }: WatchlistCardProps) {
  const poster = getPosterResponsiveUrls(item.posterPath);
  const href = getMediaHref(item.mediaType, item.mediaId);

  return (
    <Link href={href} aria-label={item.title} className="group">
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-[10px] border border-white/10 bg-surface-1">
        {poster.mobile ? (
          <picture>
            {poster.desktop ? (
              <source media="(min-width: 768px)" srcSet={poster.desktop} />
            ) : null}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={poster.mobile}
              alt={item.title}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover object-top transition-transform duration-[550ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
            />
          </picture>
        ) : (
          <div className="flex h-full w-full items-center justify-center p-3 text-center text-[11px] font-medium text-text-mid">
            {item.title}
          </div>
        )}
      </div>
      <div className="mt-2 px-0.5">
        <h3 className="line-clamp-1 text-[13px] font-medium leading-snug text-text-hi transition-colors duration-200 group-hover:text-primary">
          {item.title}
        </h3>
      </div>
    </Link>
  );
}

export default WatchlistPage;