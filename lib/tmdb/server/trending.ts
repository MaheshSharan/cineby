import type { MediaSummary, MediaType, Paginated, TrendingTimeWindow } from "../types";
import { tmdbGet } from "./client";
import { getTmdbConfig } from "./config";
import { toMediaSummary, toPaginated } from "./transform";
import { validatePaginatedResponse } from "./validate";

export type TrendingMediaType = MediaType | "all";

export async function getTrending(
  mediaType: TrendingMediaType = "all",
  timeWindow: TrendingTimeWindow = "day",
  page = 1
): Promise<Paginated<MediaSummary>> {
  const { defaultLanguage } = getTmdbConfig();

  const raw = await tmdbGet<unknown>({
    path: `/trending/${mediaType}/${timeWindow}`,
    params: { language: defaultLanguage, page },
  });

  const { results, totalPages, totalResults } = validatePaginatedResponse(raw);

  return toPaginated(results, page, totalPages, totalResults, (item) =>
    toTrendingItem(item, mediaType)
  );
}

function toTrendingItem(item: Record<string, unknown>, mediaType: TrendingMediaType): MediaSummary {
  const resolvedMediaType: MediaType =
    mediaType === "all" ? (item.media_type === "tv" ? "tv" : "movie") : mediaType;

  return toMediaSummary(item, resolvedMediaType);
}