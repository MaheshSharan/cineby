import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";

import { getMovieDetails, getTvDetails } from "@/lib/tmdb/server";
import type { TvDetails } from "@/lib/tmdb";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { listHistory } from "@/lib/db/history";
import { formatRuntime, getEpisodeHref, getYear } from "@/lib/utils/media";
import { generateResolveToken } from "@/lib/security/resolveToken";
import { logInfo, logError } from "@/lib/logger";

import { PlayerShell } from "@/components/player/PlayerShell";
import type { PlayerMedia, PlayerSeason } from "@/components/player/types";

interface WatchPageProps {
  title: string;
  subtitle?: string;
  media: PlayerMedia;
  resolveToken: string;
}

const WatchPage: NextPage<WatchPageProps> = ({ title, subtitle, media, resolveToken }) => {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>{`Watch ${title} | Cineby`}</title>
      </Head>
      <PlayerShell
        title={title}
        subtitle={subtitle}
        media={media}
        resolveToken={resolveToken}
        onNavigateEpisode={(season, episode) =>
          router.push(getEpisodeHref(media.mediaId, season, episode))
        }
      />
    </>
  );
};

export const getServerSideProps: GetServerSideProps<WatchPageProps> = async (context) => {
  const params = context.params?.params ?? [];
  const mediaType = params[0];
  const id = params[1];

  logInfo("Watch:SSR", `Player page request: ${mediaType}/${id}`);

  if (!id || (mediaType !== "movie" && mediaType !== "tv")) {
    logError("Watch:SSR", `Invalid params: mediaType=${mediaType}, id=${id}`);
    return { notFound: true };
  }

  const user = getCurrentUser(context.req);
  const ip = (context.req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim()
    ?? context.req.socket.remoteAddress
    ?? "0.0.0.0";
  const ipPrefix = ip.split(".").slice(0, 3).join(".");
  const sessionId = user?.id?.toString() ?? "anon";

  logInfo("Watch:SSR", `Session: ${sessionId}, IP: ${ipPrefix}.xxx`);

  try {
    if (mediaType === "tv") {
      const details = await getTvDetails(id);
      let season = parseOptionalNumber(params[2]);
      let episode = parseOptionalNumber(params[3]);

      if (!season || !episode) {
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

      const duration = details.episodeRunTime?.[0]
        ? formatRuntime(details.episodeRunTime[0])
        : undefined;

      const resolveToken = generateResolveToken(sessionId, ipPrefix, details.id);

      logInfo("Watch:SSR", `Generated TV token for ${details.title} S${season}E${episode}, tmdbId=${details.id}`);

      return {
        props: {
          title: details.title,
          subtitle: `S${season} E${episode}`,
          media: {
            mediaType,
            mediaId: details.id,
            title: details.title,
            posterPath: details.posterPath,
            backdropPath: details.backdropPath,
            seasonNumber: season,
            episodeNumber: episode,
            duration,
            runtime: details.episodeRunTime?.[0] ?? null,
            releaseYear: getYear(details.releaseDate),
            seasons: toPlayerSeasons(details.seasons),
          },
          resolveToken,
        },
      };
    }

    const details = await getMovieDetails(id);
    const duration = details.runtime ? formatRuntime(details.runtime) : undefined;
    const releaseYear = getYear(details.releaseDate);

    const resolveToken = generateResolveToken(sessionId, ipPrefix, details.id);

    logInfo("Watch:SSR", `Generated movie token for ${details.title}, tmdbId=${details.id}`);

    return {
      props: {
        title: details.title,
        subtitle: releaseYear || undefined,
        media: {
          mediaType,
          mediaId: details.id,
          title: details.title,
          posterPath: details.posterPath,
          backdropPath: details.backdropPath,
          duration,
          runtime: details.runtime ?? null,
          releaseYear,
        },
        resolveToken,
      },
    };
  } catch (error) {
    logError("Watch:SSR", error);
    return { notFound: true };
  }
};

function parseOptionalNumber(value: string | undefined): number | null {
  const parsed = Number.parseInt(value ?? "", 10);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function toPlayerSeasons(seasons: TvDetails["seasons"]): PlayerSeason[] {
  return seasons
    .filter((season) => season.seasonNumber > 0 && season.episodeCount > 0)
    .map((season) => ({
      seasonNumber: season.seasonNumber,
      name: season.name,
      episodeCount: season.episodeCount,
      overview: season.overview,
    }))
    .sort((a, b) => a.seasonNumber - b.seasonNumber);
}

export default WatchPage;