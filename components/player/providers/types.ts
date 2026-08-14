import type { MediaSource, MediaType } from "../types";

export interface StreamRequest {
  mediaType: MediaType;
  mediaId: number;
  seasonNumber?: number | null;
  episodeNumber?: number | null;
}

export interface StreamProvider {
  id: string;
  name: string;
  resolve: (request: StreamRequest) => Promise<MediaSource | null>;
}
