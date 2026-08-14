import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";

import { getMovieDetails, getTvDetails } from "@/lib/tmdb/server";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { listHistory } from "@/lib/db/history";

import { PlayerShell, type PlayerMedia } from "@/components/player/PlayerShell";

interface WatchPageProps {
  title: string;
  subtitle?: string;
  media: PlayerMedia;
}

const WatchPage: NextPage<WatchPageProps> = ({ title, subtitle, media }) => {
  return (
    <>
      <Head>
        <title>{`Watch ${title} | Cineby`}</title>
      </Head>
      <PlayerShell title={title} subtitle={subtitle} media={media} />
    </>
  );
};

export const getServerSideProps: GetServerSideProps<WatchPageProps> = async (context) => {
  const params = context.params?.params ?? [];
  const mediaType = params[0];
  const id = params[1];

  if (!id || (mediaType !== "movie" && mediaType !== "tv")) {
    return { notFound: true };
  }

  try {
    if (mediaType === "tv") {
      const details = await getTvDetails(id);
      let season = parseOptionalNumber(params[2]);
      let episode = parseOptionalNumber(params[3]);

      if (!season || !episode) {
        const user = getCurrentUser(context.req);
        if (user) {
          const historyList = listHistory(user.id);
          const match = historyList.find(
            (item) => item.mediaType === "tv" && item.mediaId === details.id
          );
          if (match?.seasonNumber && match?.episodeNumber) {
            season = match.seasonNumber;
            episode = match.episodeNumber;
          }
        }

        season = season ?? 1;
        episode = episode ?? 1;
      }

      return {
        props: {
          title: details.title,
          subtitle: `S:${season} E:${episode}`,
          media: {
            mediaType,
            mediaId: details.id,
            posterPath: details.posterPath,
            backdropPath: details.backdropPath,
            seasonNumber: season,
            episodeNumber: episode,
          },
        },
      };
    }

    const details = await getMovieDetails(id);

    return {
      props: {
        title: details.title,
        subtitle: details.releaseDate ? details.releaseDate.slice(0, 4) : undefined,
        media: {
          mediaType,
          mediaId: details.id,
          posterPath: details.posterPath,
          backdropPath: details.backdropPath,
        },
      },
    };
  } catch {
    return { notFound: true };
  }
};

function parseOptionalNumber(value: string | undefined): number | null {
  const parsed = Number.parseInt(value ?? "", 10);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export default WatchPage;