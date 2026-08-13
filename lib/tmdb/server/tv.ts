import type {
  SeasonEpisodes,
  TvDetails,
} from "../types";
import { tmdbGet } from "./client";
import { getTmdbConfig } from "./config";
import {
  toSeasonEpisodes,
  toTvDetails,
} from "./transform";
import {
  validateSeasonEpisodes,
  validateTvDetails,
} from "./validate";

const TV_DETAILS_APPEND =
  "credits,external_ids,videos,recommendations,translations,similar,content_ratings,images";

export async function getTvDetails(id: string | number): Promise<TvDetails> {
  const { defaultLanguage } = getTmdbConfig();

  const raw = await tmdbGet<unknown>({
    path: `/tv/${id}`,
    params: {
      language: defaultLanguage,
      append_to_response: TV_DETAILS_APPEND,
      include_video_language: "en,null",
    },
  });

  return toTvDetails(validateTvDetails(raw));
}

export async function getSeasonEpisodes(
  id: string | number,
  seasonNumber: string | number
): Promise<SeasonEpisodes> {
  const { defaultLanguage } = getTmdbConfig();

  const raw = await tmdbGet<unknown>({
    path: `/tv/${id}/season/${seasonNumber}`,
    params: { language: defaultLanguage },
  });

  return toSeasonEpisodes(validateSeasonEpisodes(raw));
}