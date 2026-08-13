import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";

import type { Genre, MediaSummary, MediaType } from "@/lib/tmdb";
import { discoverMovies, discoverTv, getGenres } from "@/lib/tmdb/server";

import { BrowseGrid } from "@/components/browse/BrowseGrid";

interface BrowsePageProps {
  category: string;
  mediaType: MediaType;
  genres: Genre[];
  initialItems: MediaSummary[];
}

const CATEGORY_TITLES: Record<string, string> = {
  movie: "Browse Movies",
  tv: "Browse TV Shows",
  anime: "Browse Anime",
};

const BrowsePage: NextPage<BrowsePageProps> = ({
  category,
  mediaType,
  genres,
  initialItems,
}) => {
  return (
    <>
      <Head>
        <title>{CATEGORY_TITLES[category] ?? "Browse"} | Cineby</title>
      </Head>

      <div className="mx-auto max-w-screen-2xl px-4 pt-8 sm:px-6">
        <h1 className="text-[32px] font-black uppercase leading-tight tracking-[0.05em]">
          {CATEGORY_TITLES[category] ?? "Browse"}
        </h1>
      </div>

      <BrowseGrid mediaType={mediaType} genres={genres} initialItems={initialItems} />
    </>
  );
};

export const getServerSideProps: GetServerSideProps<BrowsePageProps> = async (context) => {
  const category = context.params?.category;

  if (category !== "movie" && category !== "tv" && category !== "anime") {
    return { notFound: true };
  }

  const mediaType: MediaType = category === "movie" ? "movie" : "tv";

  try {
    const [genreList, initial] = await Promise.all([
      getGenres(mediaType),
      mediaType === "tv"
        ? discoverTv({ sortBy: "popularity.desc", page: 1 })
        : discoverMovies({ sortBy: "popularity.desc", page: 1 }),
    ]);

    return {
      props: {
        category,
        mediaType,
        genres: genreList.genres,
        initialItems: initial.results,
      },
    };
  } catch {
    return { notFound: true };
  }
};

export default BrowsePage;