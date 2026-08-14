import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";

import type { MediaSummary } from "@/lib/tmdb";
import {
  discoverMovies,
  getGenres,
  getTrending,
} from "@/lib/tmdb/server";

import { ContinueWatchingRow } from "@/components/home/ContinueWatchingRow";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { OnlyOnRow } from "@/components/home/OnlyOnRow";
import { TabbedContentRow } from "@/components/home/TabbedContentRow";
import { TopTenRow } from "@/components/home/TopTenRow";

const HERO_ITEMS = 12;
const TOP_TEN_ITEMS = 10;

interface HomePageProps {
  heroItems: MediaSummary[];
  topTenItems: MediaSummary[];
  onlyOnNetflix: MediaSummary[];
  trendingMovies: MediaSummary[];
  trendingSeries: MediaSummary[];
  genreNames: Record<number, string>;
}

const Home: NextPage<HomePageProps> = ({
  heroItems,
  topTenItems,
  onlyOnNetflix,
  trendingMovies,
  trendingSeries,
  genreNames,
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
        <ContinueWatchingRow />

        <TopTenRow items={topTenItems} />

        <OnlyOnRow initialItems={onlyOnNetflix} />

        <TabbedContentRow
          title="Trending Today"
          movies={trendingMovies}
          series={trendingSeries}
        />
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<HomePageProps> = async () => {
  const [
    hero,
    topTen,
    onlyOnNetflix,
    trendingMovies,
    trendingSeries,
    movieGenres,
    tvGenres,
  ] = await Promise.all([
    getTrending("all", "day"),
    getTrending("all", "week"),
    discoverMovies({ providerId: 8, watchRegion: "IN", page: 1 }),
    getTrending("movie", "day"),
    getTrending("tv", "day"),
    getGenres("movie"),
    getGenres("tv"),
  ]);

  const genreNames: Record<number, string> = {};
  for (const genre of movieGenres.genres) {
    genreNames[genre.id] = genre.name;
  }
  for (const genre of tvGenres.genres) {
    genreNames[genre.id] = genre.name;
  }

  return {
    props: {
      heroItems: hero.results.slice(0, HERO_ITEMS),
      topTenItems: topTen.results.slice(0, TOP_TEN_ITEMS),
      onlyOnNetflix: onlyOnNetflix.results,
      trendingMovies: trendingMovies.results,
      trendingSeries: trendingSeries.results,
      genreNames,
    },
  };
};

export default Home;