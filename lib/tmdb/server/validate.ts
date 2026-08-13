import type { MediaType } from "../types";

export class InvalidTmdbResponseError extends Error {
  constructor(message: string) {
    super(`Invalid TMDB response: ${message}`);
    this.name = "InvalidTmdbResponseError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function hasMediaTitle(value: Record<string, unknown>): boolean {
  return (
    typeof value.title === "string" || typeof value.name === "string"
  );
}

export interface PaginatedResponse {
  results: Record<string, unknown>[];
  page: number;
  totalPages: number;
  totalResults: number;
}

export function validatePaginatedResponse(value: unknown): PaginatedResponse {
  if (!isRecord(value) || !Array.isArray(value.results)) {
    throw new InvalidTmdbResponseError("expected an object with a results array");
  }

  const invalidItem = (value.results as unknown[]).find(
    (item) => !isRecord(item) || typeof item.id !== "number" || !hasMediaTitle(item)
  );

  if (invalidItem !== undefined) {
    throw new InvalidTmdbResponseError("result item missing id or title");
  }

  return {
    results: value.results as Record<string, unknown>[],
    page: typeof value.page === "number" ? value.page : 1,
    totalPages: typeof value.total_pages === "number" ? value.total_pages : 1,
    totalResults: typeof value.total_results === "number" ? value.total_results : 0,
  };
}

export function validateMovieDetails(value: unknown): Record<string, unknown> {
  if (
    !isRecord(value) ||
    typeof value.id !== "number" ||
    typeof value.title !== "string"
  ) {
    throw new InvalidTmdbResponseError("movie details missing id or title");
  }

  return value;
}

export function validateTvDetails(value: unknown): Record<string, unknown> {
  if (
    !isRecord(value) ||
    typeof value.id !== "number" ||
    typeof value.name !== "string"
  ) {
    throw new InvalidTmdbResponseError("tv details missing id or name");
  }

  return value;
}

export function validateGenreList(value: unknown): Record<string, unknown>[] {
  if (!isRecord(value) || !Array.isArray(value.genres)) {
    throw new InvalidTmdbResponseError("expected an object with a genres array");
  }

  const invalidGenre = (value.genres as unknown[]).find(
    (genre) => !isRecord(genre) || typeof genre.id !== "number" || typeof genre.name !== "string"
  );

  if (invalidGenre !== undefined) {
    throw new InvalidTmdbResponseError("genre missing id or name");
  }

  return value.genres as Record<string, unknown>[];
}


export function validateSeasonEpisodes(value: unknown): Record<string, unknown> {
  if (!isRecord(value) || typeof value.id !== "number" || !Array.isArray(value.episodes)) {
    throw new InvalidTmdbResponseError("season episodes missing id or episodes array");
  }

  return value;
}

export interface SearchMultiItem {
  id: number;
  mediaType: MediaType;
  record: Record<string, unknown>;
}

export interface SearchMultiResult {
  page: number;
  totalPages: number;
  totalResults: number;
  items: SearchMultiItem[];
}

export function validateSearchMulti(value: unknown): SearchMultiResult {
  if (!isRecord(value) || !Array.isArray(value.results)) {
    throw new InvalidTmdbResponseError("expected an object with a results array");
  }

  const items: SearchMultiItem[] = [];

  for (const item of value.results as unknown[]) {
    if (!isRecord(item) || typeof item.id !== "number" || typeof item.media_type !== "string") {
      throw new InvalidTmdbResponseError("search result missing id or media_type");
    }

    if (item.media_type === "tv" || item.media_type === "movie") {
      items.push({ id: item.id, mediaType: item.media_type, record: item });
    }
  }

  return {
    page: typeof value.page === "number" ? value.page : 1,
    totalPages: typeof value.total_pages === "number" ? value.total_pages : 0,
    totalResults: typeof value.total_results === "number" ? value.total_results : 0,
    items,
  };
}