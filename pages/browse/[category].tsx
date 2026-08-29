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
        <title>{`${CATEGORY_TITLES[category] ?? "Browse"} | Cineby`}</title>
      </Head>

      <BrowseGrid mediaType={mediaType} genres={genres} initialItems={initialItems} />
    </>
  );
};

export const getServerSideProps: GetServerSideProps<BrowsePageProps> = async (context) => {
  const category = context.params?.category;

  if (category !== "movie" && category !== "tv") {
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