import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";

import type { MovieDetails } from "@/lib/tmdb";
import { getMovieDetails } from "@/lib/tmdb/server";

import { DetailPage } from "@/components/detail/DetailPage";

interface MoviePageProps {
  details: MovieDetails;
  isPlaying: boolean;
}

const MoviePage: NextPage<MoviePageProps> = ({ details, isPlaying }) => {
  return (
    <>
      <Head>
        <title>{`${details.title} | Cineby`}</title>
        <meta name="description" content={details.overview} />
      </Head>
      <DetailPage details={details} isPlaying={isPlaying} />
    </>
  );
};

export const getServerSideProps: GetServerSideProps<MoviePageProps> = async (context) => {
  const id = context.params?.params?.[0];

  if (!id) {
    return { notFound: true };
  }

  try {
    const details = await getMovieDetails(id);

    return {
      props: {
        details,
        isPlaying: context.query.play === "true",
      },
    };
  } catch {
    return { notFound: true };
  }
};

export default MoviePage;