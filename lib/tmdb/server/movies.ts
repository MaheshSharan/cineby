import type { ImageSet, MediaSummary, MovieDetails, Paginated } from "../types";
import { tmdbGet } from "./client";
import { getTmdbConfig } from "./config";
import { toImageSet, toMediaSummary, toMovieDetails, toPaginated } from "./transform";
import {
  validateImageSet,
  validateMovieDetails,
  validatePaginatedResponse,
} from "./validate";

const MOVIE_DETAILS_APPEND =
  "credits,external_ids,videos,recommendations,translations,similar,release_dates,images";

export async function getMovieDetails(id: string | number): Promise<MovieDetails> {
  const { defaultLanguage } = getTmdbConfig();

  const raw = await tmdbGet<unknown>({
    path: `/movie/${id}`,
    params: {
      language: defaultLanguage,
      append_to_response: MOVIE_DETAILS_APPEND,
      include_video_language: "en,null",
    },
  });

  return toMovieDetails(validateMovieDetails(raw));
}

export async function getPopularMovies(page = 1): Promise<Paginated<MediaSummary>> {
  const { defaultLanguage } = getTmdbConfig();

  const raw = await tmdbGet<unknown>({
    path: "/movie/popular",
    params: { language: defaultLanguage, page },
  });

  const { results, totalPages, totalResults } = validatePaginatedResponse(raw);

  return toPaginated(results, page, totalPages, totalResults, (item) => toMediaSummary(item, "movie"));
}

export async function getTopRatedMovies(page = 1): Promise<Paginated<MediaSummary>> {
  const { defaultLanguage } = getTmdbConfig();

  const raw = await tmdbGet<unknown>({
    path: "/movie/top_rated",
    params: { language: defaultLanguage, page },
  });

  const { results, totalPages, totalResults } = validatePaginatedResponse(raw);

  return toPaginated(results, page, totalPages, totalResults, (item) => toMediaSummary(item, "movie"));
}

export async function getMovieImages(id: string | number): Promise<ImageSet> {
  const { defaultLanguage } = getTmdbConfig();

  const raw = await tmdbGet<unknown>({
    path: `/movie/${id}/images`,
    params: { include_image_language: `${defaultLanguage},${defaultLanguage},null` },
  });

  return toImageSet(validateImageSet(raw));
}