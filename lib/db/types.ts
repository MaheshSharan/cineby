export interface User {
  id: number;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  createdAt: string;
}

export interface WatchlistItem {
  id: number;
  mediaType: "movie" | "tv";
  mediaId: number;
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  addedAt: string;
}

export interface HistoryEntry {
  id: number;
  mediaType: "movie" | "tv";
  mediaId: number;
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  seasonNumber: number | null;
  episodeNumber: number | null;
  duration: string | null;
  progress: number | null;
  watchedAt: string;
}