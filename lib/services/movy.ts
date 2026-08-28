/**
 * Centralized integration layer for Movy services (Ratings & Direct MP4 Trailers).
 * Can be globally or individually toggled via MOVY_CONFIG.
 */

export interface MovyRatings {
  imdb: number | null;
  rottenTomatoes: number | null;
  rottenTomatoesAudience: number | null;
}

export interface MovyTrailerStream {
  quality: string;
  url: string;
  mimeType: string;
}

export interface MovyTrailerResponse {
  id: string;
  trailer?: {
    id: string;
    name: string;
    runtime: number;
    thumbnail: string;
    streams: MovyTrailerStream[];
  };
}

export const MOVY_CONFIG = {
  /** Master switch to enable or disable all Movy integrations */
  enabled: true,
  /** Switch for IMDb and Rotten Tomatoes ratings */
  enableRatings: true,
  /** Switch for direct MP4 IMDb trailers */
  enableDirectTrailer: true,
  /** Endpoint for ratings API */
  ratingsEndpoint: "https://www.movy.bz/api/ratings",
  /** Endpoint for oldest trailer API */
  trailerEndpoint: "https://trailers.wecollege.net/getOldestTrailer",
} as const;

/**
 * Fetch ratings (IMDb, Rotten Tomatoes Critics & Audience) for a media item.
 */
export async function getMovyRatings(params: {
  id: number;
  title: string;
  year?: string | number | null;
  type: "movie" | "tv";
}): Promise<MovyRatings | null> {
  if (!MOVY_CONFIG.enabled || !MOVY_CONFIG.enableRatings) {
    return null;
  }

  const query = new URLSearchParams({
    id: params.id.toString(),
    title: params.title,
    type: params.type,
  });

  if (params.year) {
    query.set("year", params.year.toString());
  }

  try {
    const res = await fetch(`/api/ratings?${query.toString()}`);
    if (!res.ok) return null;

    const data: unknown = await res.json().catch(() => null);
    if (!data || typeof data !== "object") return null;

    const record = data as Record<string, unknown>;
    return {
      imdb: typeof record.imdb === "number" ? record.imdb : null,
      rottenTomatoes: typeof record.rottenTomatoes === "number" ? record.rottenTomatoes : null,
      rottenTomatoesAudience:
        typeof record.rottenTomatoesAudience === "number" ? record.rottenTomatoesAudience : null,
    };
  } catch {
    return null;
  }
}

/**
 * Fetch direct MP4 trailer streams for a media item using its IMDb ID.
 * Returns the highest quality MP4 stream URL available (e.g. 1080p -> 720p -> 480p).
 */
export async function getMovyTrailerUrl(imdbId?: string | null): Promise<string | null> {
  if (!MOVY_CONFIG.enabled || !MOVY_CONFIG.enableDirectTrailer || !imdbId) {
    return null;
  }

  try {
    const res = await fetch(`${MOVY_CONFIG.trailerEndpoint}?id=${encodeURIComponent(imdbId)}`);
    if (!res.ok) return null;

    const data = (await res.json()) as MovyTrailerResponse;
    const streams = data?.trailer?.streams ?? [];

    if (streams.length === 0) return null;

    // Filter to MP4 streams
    const mp4Streams = streams.filter(
      (s) => s.mimeType.toUpperCase() === "MP4" || s.url.includes(".mp4")
    );

    const candidates = mp4Streams.length > 0 ? mp4Streams : streams;

    // Preference: 1080p > 720p > 480p > SD > first available
    const preferredOrder = ["1080p", "720p", "480p", "SD"];
    for (const q of preferredOrder) {
      const match = candidates.find((s) => s.quality.toLowerCase() === q.toLowerCase());
      if (match?.url) return match.url;
    }

    return candidates[0]?.url ?? null;
  } catch {
    return null;
  }
}
