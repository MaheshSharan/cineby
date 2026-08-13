import type { MediaSummary, Paginated } from "../types";
import { tmdbGet } from "./client";
import { getTmdbConfig } from "./config";
import { toMediaSummary, toPaginated } from "./transform";
import { validatePaginatedResponse, validateSearchMulti } from "./validate";

export async function searchMulti(query: string, page = 1): Promise<Paginated<MediaSummary>> {
  const { defaultLanguage } = getTmdbConfig();

  const raw = await tmdbGet<unknown>({
    path: "/search/multi",
    params: { query, page, language: defaultLanguage },
  });

  const { items, page: resultPage, totalPages, totalResults } = validateSearchMulti(raw);

  return {
    page: resultPage,
    results: items.map((item) => toMediaSummary(item.record, item.mediaType)),
    totalPages,
    totalResults,
  };
}

export async function searchMovies(query: string, page = 1): Promise<Paginated<MediaSummary>> {
  return searchCollection("/search/movie", query, page);
}

export async function searchTv(query: string, page = 1): Promise<Paginated<MediaSummary>> {
  return searchCollection("/search/tv", query, page);
}

async function searchCollection(
  path: string,
  query: string,
  page: number
): Promise<Paginated<MediaSummary>> {
  const { defaultLanguage } = getTmdbConfig();

  const raw = await tmdbGet<unknown>({
    path,
    params: { query, page, language: defaultLanguage },
  });

  const { results, totalPages, totalResults } = validatePaginatedResponse(raw);

  const mediaType = path === "/search/tv" ? "tv" : "movie";

  return toPaginated(results, page, totalPages, totalResults, (item) => toMediaSummary(item, mediaType));
}