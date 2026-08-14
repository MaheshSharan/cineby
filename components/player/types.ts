export type MediaType = "movie" | "tv";

export type ServerKind = "default" | "test" | "bunny";

export type StreamFormat = "hls" | "dash" | "mp4" | "webm" | "mkv" | "unknown";

export type QualityLabel = "2160p" | "1080p" | "720p" | "480p";

export type PlaybackRate = 0.25 | 0.5 | 0.75 | 1 | 1.25 | 1.5 | 1.75 | 2;

export interface MediaSource {
  id: string;
  kind: ServerKind;
  name: string;
  url: string;
  format: StreamFormat;
  quality: QualityLabel | null;
  headers?: Record<string, string>;
}

export interface ServerOption {
  id: string;
  name: string;
  description?: string;
  kind: ServerKind;
}

export interface SubtitleTrack {
  id: string;
  lang: string;
  label: string;
  url: string | null;
}

export interface PlayerMedia {
  mediaType: MediaType;
  mediaId: number;
  title: string;
  posterPath?: string | null;
  backdropPath?: string | null;
  seasonNumber?: number | null;
  episodeNumber?: number | null;
  duration?: string | null;
  progress?: number | null;
  seasons?: PlayerSeason[];
}

export interface PlayerSeason {
  seasonNumber: number;
  name: string;
  episodeCount: number;
  overview: string;
}

export interface Episode {
  id: number;
  seasonNumber: number;
  episodeNumber: number;
  name: string;
  overview: string;
  stillPath: string | null;
  runtime: number | null;
  airDate: string | null;
  voteAverage: number;
}

export interface PlayerSettings {
  volume: number;
  muted: boolean;
  rate: PlaybackRate;
  quality: QualityLabel | null;
  serverId: string;
  subtitleLang: string | null;
  autoNext: boolean;
}
