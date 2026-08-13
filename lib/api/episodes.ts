import type { SeasonEpisodes } from "@/lib/tmdb";

export class EpisodeApiError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
    this.name = "EpisodeApiError";
  }
}

export async function getSeasonEpisodes(
  tvId: number,
  seasonNumber: number
): Promise<SeasonEpisodes> {
  const response = await fetch(
    `/api/tmdb/tv/${tvId}/season/${seasonNumber}`
  );

  if (!response.ok) {
    throw new EpisodeApiError(
      `Season request failed: ${response.status}`,
      response.status
    );
  }

  return (await response.json()) as SeasonEpisodes;
}