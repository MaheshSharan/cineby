import type {
  EpisodeExternalIds,
  ImageSet,
  MediaSummary,
  Paginated,
  SeasonEpisodes,
  TvDetails,
} from "../types";
import { tmdbGet } from "./client";
import { getTmdbConfig } from "./config";
import {
  toEpisodeExternalIds,
  toImageSet,
  toMediaSummary,
  toPaginated,
  toSeasonEpisodes,
  toTvDetails,
} from "./transform";
import {
  validateEpisodeExternalIds,
  validateImageSet,
  validatePaginatedResponse,
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

export async function getPopularTv(page = 1): Promise<Paginated<MediaSummary>> {
  const { defaultLanguage } = getTmdbConfig();

  const raw = await tmdbGet<unknown>({
    path: "/tv/popular",
    params: { language: defaultLanguage, page },
  });

  const { results, totalPages, totalResults } = validatePaginatedResponse(raw);

  return toPaginated(results, page, totalPages, totalResults, (item) => toMediaSummary(item, "tv"));
}

export async function getTopRatedTv(page = 1): Promise<Paginated<MediaSummary>> {
  const { defaultLanguage } = getTmdbConfig();

  const raw = await tmdbGet<unknown>({
    path: "/tv/top_rated",
    params: { language: defaultLanguage, page },
  });

  const { results, totalPages, totalResults } = validatePaginatedResponse(raw);

  return toPaginated(results, page, totalPages, totalResults, (item) => toMediaSummary(item, "tv"));
}

export async function getTvImages(id: string | number): Promise<ImageSet> {
  const { defaultLanguage } = getTmdbConfig();

  const raw = await tmdbGet<unknown>({
    path: `/tv/${id}/images`,
    params: { include_image_language: `${defaultLanguage},${defaultLanguage},null` },
  });

  return toImageSet(validateImageSet(raw));
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

export async function getEpisodeExternalIds(
  id: string | number,
  seasonNumber: string | number,
  episodeNumber: string | number
): Promise<EpisodeExternalIds> {
  const raw = await tmdbGet<unknown>({
    path: `/tv/${id}/season/${seasonNumber}/episode/${episodeNumber}`,
    params: { append_to_response: "external_ids" },
  });

  return toEpisodeExternalIds(validateEpisodeExternalIds(raw));
}