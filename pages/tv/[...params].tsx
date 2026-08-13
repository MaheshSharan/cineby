import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";

import type { TvDetails } from "@/lib/tmdb";
import { getTvDetails } from "@/lib/tmdb/server";

import { DetailPage } from "@/components/detail/DetailPage";

interface TvPageProps {
  details: TvDetails;
  isPlaying: boolean;
}

const TvPage: NextPage<TvPageProps> = ({ details, isPlaying }) => {
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

export const getServerSideProps: GetServerSideProps<TvPageProps> = async (context) => {
  const params = context.params?.params;
  const id = params?.[0];

  if (!id) {
    return { notFound: true };
  }

  try {
    const details = await getTvDetails(id);

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

export default TvPage;