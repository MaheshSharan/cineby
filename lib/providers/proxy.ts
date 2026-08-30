import { createProxyDescriptor } from "./signedProxy";
import type { StreamResponse } from "./types";

export function buildStreamProxyUrl(
  targetUrl: string,
  headers?: Record<string, string>
): string {
  if (!targetUrl) {
    return targetUrl;
  }

  const proxyBase =
    process.env.STREAM_PROXY_URL?.trim() ||
    process.env.NEXT_PUBLIC_STREAM_PROXY_URL?.trim() ||
    "/api/stream/proxy";

  const cleanBase = proxyBase.replace(/\/+$/, "");

  // Prevent double-proxying or proxying local blob/data schemes
  if (
    targetUrl.startsWith(cleanBase) ||
    targetUrl.startsWith("blob:") ||
    targetUrl.startsWith("data:")
  ) {
    return targetUrl;
  }

  const params = new URLSearchParams({ token: createProxyDescriptor(targetUrl, headers) });

  if (cleanBase.includes("?")) {
    return `${cleanBase}&${params.toString()}`;
  }

  if (cleanBase.startsWith("/")) {
    return `${cleanBase}?${params.toString()}`;
  }

  return `${cleanBase}/?${params.toString()}`;
}

export function isStreamProxyConfigured(): boolean {
  return true;
}

// Descriptors are minted at serve time, never at cache time. Cached resolution results
// keep raw upstream URLs so a cache hit never hands out descriptors that already spent
// part of their lifetime in Redis.
export function applyStreamProxy(response: StreamResponse): StreamResponse {
  return {
    sources: response.sources.map((source) => ({
      ...source,
      url: source.direct ? source.url : buildStreamProxyUrl(source.url, source.headers),
    })),
    subtitles: response.subtitles.map((subtitle) => ({
      ...subtitle,
      url: buildStreamProxyUrl(subtitle.url, subtitle.headers),
    })),
  };
}
