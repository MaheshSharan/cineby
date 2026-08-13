import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";

import type { Genre, MediaSummary } from "@/lib/tmdb";
import {
  discoverMovies,
  getGenres,
  getTopRatedMovies,
  getTopRatedTv,
  getTrending,
} from "@/lib/tmdb/server";

import { GenreBrowse } from "@/components/home/GenreBrowse";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { TabbedContentRow } from "@/components/home/TabbedContentRow";
import { TopTenRow } from "@/components/home/TopTenRow";

const HERO_ITEMS = 12;
const TOP_TEN_ITEMS = 10;

interface HomePageProps {
  heroItems: MediaSummary[];
  topTenItems: MediaSummary[];
  trendingMovies: MediaSummary[];
  trendingSeries: MediaSummary[];
  topRatedMovies: MediaSummary[];
  topRatedSeries: MediaSummary[];
  genreNames: Record<number, string>;
  genreOptions: Genre[];
  genreInitial: MediaSummary[];
}

const Home: NextPage<HomePageProps> = ({
  heroItems,
  topTenItems,
  trendingMovies,
  trendingSeries,
  topRatedMovies,
  topRatedSeries,
  genreNames,
  genreOptions,
  genreInitial,
}) => {
  return (
    <>
      <Head>
        <title>Cineby - Watch Free Movies & TV Shows Online</title>
        <meta
          name="description"
          content="Watch free movies and TV shows online."
        />
      </Head>

      <HeroCarousel items={heroItems} genreNames={genreNames} />

      <div className="mx-auto flex max-w-[1360px] flex-col gap-12 px-4 mt-10 md:mt-14 md:gap-16">
        <TopTenRow items={topTenItems} />

        <TabbedContentRow
          title="Trending Today"
          movies={trendingMovies}
          series={trendingSeries}
        />

        <TabbedContentRow
          title="Top rated"
          movies={topRatedMovies}
          series={topRatedSeries}
        />

        <GenreBrowse genres={genreOptions} initialItems={genreInitial} />
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<HomePageProps> = async () => {
  const [
    hero,
    topTen,
    trendingMovies,
    trendingSeries,
    topRatedMovies,
    topRatedSeries,
    movieGenres,
    genreInitial,
  ] = await Promise.all([
    getTrending("all", "day"),
    getTrending("all", "week"),
    getTrending("movie", "day"),
    getTrending("tv", "day"),
    getTopRatedMovies(),
    getTopRatedTv(),
    getGenres("movie"),
    discoverMovies({ genreId: 28, page: 1 }),
  ]);

  const genreNames: Record<number, string> = {};

  for (const genre of movieGenres.genres) {
    genreNames[genre.id] = genre.name;
  }

  return {
    props: {
      heroItems: hero.results.slice(0, HERO_ITEMS),
      topTenItems: topTen.results.slice(0, TOP_TEN_ITEMS),
      trendingMovies: trendingMovies.results,
      trendingSeries: trendingSeries.results,
      topRatedMovies: topRatedMovies.results,
      topRatedSeries: topRatedSeries.results,
      genreNames,
      genreOptions: movieGenres.genres,
      genreInitial: genreInitial.results,
    },
  };
};

export default Home;