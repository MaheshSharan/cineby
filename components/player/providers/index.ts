import type { Quality, StreamResponse } from "@/lib/providers/types";
import type { MediaSource, QualityLabel, SubtitleTrack } from "../types";
import type { StreamRequest, StreamResolutionResult } from "./types";
import { TEST_PROVIDER } from "./test";

function toQualityLabel(quality?: Quality | string): QualityLabel | null {
  switch (quality) {
    case "2160p":
    case "1080p":
    case "720p":
    case "480p":
      return quality;
    default:
      return null;
  }
}

export async function resolveStream(
  serverId: string,
  request: StreamRequest
): Promise<StreamResolutionResult> {
  const params = new URLSearchParams({
    tmdbId: request.mediaId.toString(),
    type: request.mediaType,
  });

  if (request.seasonNumber) {
    params.set("season", request.seasonNumber.toString());
  }
  if (request.episodeNumber) {
    params.set("episode", request.episodeNumber.toString());
  }
  if (serverId && serverId !== "default") {
    params.set("server", serverId);
  }

  try {
    const res = await fetch(`/api/stream/resolve?${params.toString()}`, {
      signal: request.signal,
    });

    if (res.ok) {
      const data: unknown = await res.json().catch(() => null);
      if (data && typeof data === "object" && "sources" in data) {
        const payload = data as StreamResponse;

        const mappedSources: MediaSource[] = (payload.sources ?? []).map((src) => ({
          id: src.provider.id,
          kind: src.provider.id === "test" ? "test" : "default",
          name: src.provider.name,
          url: src.url,
          format: src.type === "unknown" ? "hls" : src.type,
          quality: toQualityLabel(src.quality),
          headers: src.headers,
        }));

        const mappedSubtitles: SubtitleTrack[] = (payload.subtitles ?? []).map((sub, idx) => ({
          id: sub.id || `sub-${idx}-${sub.lang || sub.label}`,
          lang: sub.lang || sub.label.toLowerCase().slice(0, 2),
          label: sub.label,
          url: sub.url,
        }));

        const selectedSource = mappedSources[0] ?? null;

        return {
          source: selectedSource,
          sources: mappedSources,
          subtitles: mappedSubtitles,
        };
      }
    }
  } catch {
    // Network or client abort
  }

  // Fallback to local test provider if API is unavailable
  const fallbackSource = await TEST_PROVIDER.resolve(request);
  return {
    source: fallbackSource,
    sources: fallbackSource ? [fallbackSource] : [],
    subtitles: [],
  };
}
