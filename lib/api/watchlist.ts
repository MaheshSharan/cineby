import type { MediaType } from "@/lib/tmdb";

export interface WatchlistItem {
  mediaType: MediaType;
  mediaId: number;
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
}

interface WatchlistCheckResponse {
  inWatchlist: boolean;
}

export async function checkWatchlist(
  mediaType: MediaType,
  mediaId: number
): Promise<boolean> {
  const response = await fetch(`/api/watchlist/${mediaType}/${mediaId}`);

  if (!response.ok) {
    return false;
  }

  const data = (await response.json()) as WatchlistCheckResponse;

  return typeof data.inWatchlist === "boolean" ? data.inWatchlist : false;
}

export async function addToWatchlist(
  item: WatchlistItem
): Promise<boolean> {
  const response = await fetch("/api/watchlist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item),
  });

  return response.ok;
}

export async function removeFromWatchlist(
  mediaType: MediaType,
  mediaId: number
): Promise<boolean> {
  const response = await fetch(`/api/watchlist/${mediaType}/${mediaId}`, {
    method: "DELETE",
  });

  return response.ok;
}