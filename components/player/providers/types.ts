import type { MediaSource, MediaType, SubtitleTrack } from "../types";

export interface StreamRequest {
  mediaType: MediaType;
  mediaId: number;
  seasonNumber?: number | null;
  episodeNumber?: number | null;
  signal?: AbortSignal;
}

export interface StreamResolutionResult {
  source: MediaSource | null;
  sources: MediaSource[];
  subtitles: SubtitleTrack[];
}
