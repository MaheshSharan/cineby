import type { MediaSummary, MediaType, Paginated } from "../types";
import { tmdbGet } from "./client";
import { getTmdbConfig } from "./config";
import { toMediaSummary, toPaginated } from "./transform";
import { validatePaginatedResponse } from "./validate";

export interface DiscoverOptions {
  genreId?: number;
  sortBy?: string;
  page?: number;
  year?: number;
}

export async function discoverMovies(options: DiscoverOptions = {}): Promise<Paginated<MediaSummary>> {
  return discover("/discover/movie", "movie", options);
}

export async function discoverTv(options: DiscoverOptions = {}): Promise<Paginated<MediaSummary>> {
  return discover("/discover/tv", "tv", options);
}

async function discover(
  path: string,
  mediaType: MediaType,
  options: DiscoverOptions
): Promise<Paginated<MediaSummary>> {
  const { defaultLanguage } = getTmdbConfig();

  const raw = await tmdbGet<unknown>({
    path,
    params: {
      language: defaultLanguage,
      sort_by: options.sortBy ?? "popularity.desc",
      page: options.page ?? 1,
      with_genres: options.genreId,
      year: options.year,
    },
  });

  const { results, totalPages, totalResults } = validatePaginatedResponse(raw);

  return toPaginated(results, options.page ?? 1, totalPages, totalResults, (item) =>
    toMediaSummary(item, mediaType)
  );
}