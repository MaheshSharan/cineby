import type { MediaType } from "@/lib/tmdb";
import type { WatchlistItem } from "@/lib/db/types";

export interface WatchlistInput {
  mediaType: MediaType;
  mediaId: number;
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
}

interface WatchlistCheckResponse {
  inWatchlist: boolean;
}

interface WatchlistListResponse {
  items: WatchlistItem[];
}

export async function listWatchlist(): Promise<WatchlistItem[]> {
  const response = await fetch("/api/watchlist");

  if (!response.ok) {
    return [];
  }

  const data = (await response.json()) as WatchlistListResponse;

  return Array.isArray(data.items) ? data.items : [];
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
  item: WatchlistInput
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

export async function clearAllWatchlist(): Promise<boolean> {
  const response = await fetch("/api/watchlist", {
    method: "DELETE",
  });

  return response.ok;
}