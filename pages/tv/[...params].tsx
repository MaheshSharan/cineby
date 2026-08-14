import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";

import type { TvDetails } from "@/lib/tmdb";
import { getTvDetails } from "@/lib/tmdb/server";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { listHistory } from "@/lib/db/history";

import { DetailPage } from "@/components/detail/DetailPage";

interface TvPageProps {
  details: TvDetails;
  isPlaying: boolean;
  seasonNumber?: number | null;
  episodeNumber?: number | null;
}

const TvPage: NextPage<TvPageProps> = ({ details, isPlaying, seasonNumber, episodeNumber }) => {
  return (
    <>
      <Head>
        <title>{`${details.title} | Cineby`}</title>
        <meta name="description" content={details.overview} />
      </Head>
      <DetailPage
        details={details}
        isPlaying={isPlaying}
        seasonNumber={seasonNumber}
        episodeNumber={episodeNumber}
      />
    </>
  );
};

export const getServerSideProps: GetServerSideProps<TvPageProps> = async (context) => {
  const params = context.params?.params;
  const id = params?.[0];
  const parsedSeason = params?.[1] ? Number.parseInt(params[1], 10) : null;
  const parsedEpisode = params?.[2] ? Number.parseInt(params[2], 10) : null;
  const isPlaying = context.query.play === "true";

  if (!id) {
    return { notFound: true };
  }

  try {
    const details = await getTvDetails(id);

    let seasonNumber = Number.isInteger(parsedSeason) && (parsedSeason as number) > 0 ? parsedSeason : null;
    let episodeNumber = Number.isInteger(parsedEpisode) && (parsedEpisode as number) > 0 ? parsedEpisode : null;

    // If playing but no explicit season/episode in the URL, check user's history
    if (isPlaying && (!seasonNumber || !episodeNumber)) {
      const user = getCurrentUser(context.req);
      if (user) {
        const historyList = listHistory(user.id);
        const match = historyList.find(
          (item) => item.mediaType === "tv" && item.mediaId === details.id
        );
        if (match?.seasonNumber && match?.episodeNumber) {
          seasonNumber = match.seasonNumber;
          episodeNumber = match.episodeNumber;
        }
      }

      // Default fallback if no history exists for this TV show
      seasonNumber = seasonNumber ?? 1;
      episodeNumber = episodeNumber ?? 1;
    }

    return {
      props: {
        details,
        isPlaying,
        seasonNumber,
        episodeNumber,
      },
    };
  } catch {
    return { notFound: true };
  }
};

export default TvPage;