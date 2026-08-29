export type MediaType = "movie" | "tv";

export type StreamFormat = "hls" | "dash" | "mp4" | "webm" | "mkv" | "unknown";

export type Quality = "2160p" | "1440p" | "1080p" | "720p" | "480p" | "360p" | "unknown";

export interface StreamRequest {
  tmdbId: number;
  type: MediaType;
  season?: number | null;
  episode?: number | null;
  serverId?: string;
  signal?: AbortSignal;
}

export interface AudioTrack {
  language: string;
  label: string;
}

export interface StreamSource {
  url: string;
  type: StreamFormat;
  quality: Quality;
  headers?: Record<string, string>;
  audioTracks?: AudioTrack[];
  direct?: boolean;
  provider: {
    id: string;
    name: string;
  };
}

export interface SubtitleTrack {
  id?: string;
  url: string;
  label: string;
  lang?: string;
  flagUrl?: string;
  format: "vtt" | "srt" | "ass" | "ssa";
  headers?: Record<string, string>;
}

export interface StreamResponse {
  sources: StreamSource[];
  subtitles: SubtitleTrack[];
}

export interface Provider {
  id: string;
  name: string;
  priority: number;
  fetch: (request: StreamRequest) => Promise<StreamResponse>;
}
