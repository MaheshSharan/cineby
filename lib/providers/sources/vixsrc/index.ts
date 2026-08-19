import type { Provider, StreamRequest, StreamResponse } from "../../types";
import { buildStreamProxyUrl } from "../../proxy";
import { logError } from "@/lib/logger";

const PROVIDER_ID = "vixsrc";
const PROVIDER_NAME = "Vixsrc";
const BASE_URL = "https://vixsrc.to";

const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

async function fetchApiEmbed(req: StreamRequest): Promise<string | null> {
  const { tmdbId, type, season, episode, signal } = req;

  const apiPath =
    type === "tv"
      ? `/api/tv/${tmdbId}/${season ?? 1}/${episode ?? 1}`
      : `/api/movie/${tmdbId}`;

  const refererUrl =
    type === "tv"
      ? `${BASE_URL}/tv/${tmdbId}/${season ?? 1}/${episode ?? 1}`
      : `${BASE_URL}/movie/${tmdbId}`;

  const targetUrl = `${BASE_URL}${apiPath}`;
  const requestUrl = buildStreamProxyUrl(targetUrl, {
    Referer: refererUrl,
    Origin: BASE_URL,
  });

  const res = await fetch(requestUrl, {
    headers: {
      "User-Agent": BROWSER_UA,
      Accept: "application/json, text/plain, */*",
      Referer: refererUrl,
      Origin: BASE_URL,
      "Sec-Fetch-Site": "same-origin",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Dest": "empty",
      "Accept-Language": "en-US,en;q=0.9",
    },
    signal,
  });

  if (!res.ok) {
    logError("Provider:vixsrc", `Vixsrc API returned HTTP ${res.status} (${res.statusText}) for ${apiPath}`);
    return null;
  }

  const data: unknown = await res.json().catch(() => null);
  if (!data || typeof data !== "object" || !("src" in data)) {
    logError("Provider:vixsrc", `Invalid JSON or missing 'src' in Vixsrc API response for ${apiPath}`);
    return null;
  }

  const src = (data as { src?: string }).src;
  return src ? `${BASE_URL}${src}` : null;
}

async function fetchEmbedPlaylist(embedUrl: string, signal?: AbortSignal): Promise<string | null> {
  const requestUrl = buildStreamProxyUrl(embedUrl, {
    Referer: BASE_URL,
  });

  const res = await fetch(requestUrl, {
    headers: {
      "User-Agent": BROWSER_UA,
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      Referer: BASE_URL,
      "Sec-Fetch-Dest": "iframe",
      "Sec-Fetch-Mode": "navigate",
    },
    signal,
  });

  if (!res.ok) {
    logError("Provider:vixsrc", `Embed page returned HTTP ${res.status} (${res.statusText})`);
    return null;
  }

  const html = await res.text();

  // Match masterPlaylist definition from embed page script
  const playlistMatch =
    html.match(/window\.masterPlaylist\s*=\s*(\{[\s\S]*?\})\s*;/) ||
    html.match(/window\["masterPlaylist"\]\s*=\s*(\{[\s\S]*?\})\s*;/) ||
    html.match(/masterPlaylist\s*=\s*(\{[\s\S]*?\})\s*;/);

  if (!playlistMatch) {
    logError("Provider:vixsrc", `masterPlaylist script regex not matched in embed HTML (length: ${html.length})`);
    return null;
  }

  const block = playlistMatch[1];
  const urlM = block.match(/url:\s*['"]([^'"]+)['"]/);
  const tokenM = block.match(/['"]?token['"]?\s*:\s*['"]([^'"]+)['"]/);
  const expiresM = block.match(/['"]?expires['"]?\s*:\s*['"]([^'"]+)['"]/);

  if (!urlM || !tokenM || !expiresM) {
    return null;
  }

  const rawUrl = urlM[1];
  const token = tokenM[1];
  const expires = expiresM[1];

  const separator = rawUrl.includes("?") ? "&" : "?";
  return `${rawUrl}${separator}token=${token}&expires=${expires}&h=1&lang=en`;
}

async function scrape(req: StreamRequest): Promise<StreamResponse> {
  if (req.signal?.aborted) {
    return { sources: [], subtitles: [] };
  }

  try {
    const embedUrl = await fetchApiEmbed(req);
    if (!embedUrl) {
      return { sources: [], subtitles: [] };
    }

    const playlistUrl = await fetchEmbedPlaylist(embedUrl, req.signal);
    if (!playlistUrl) {
      return { sources: [], subtitles: [] };
    }

    return {
      sources: [
        {
          url: playlistUrl,
          headers: {
            Referer: BASE_URL,
            Origin: BASE_URL,
            "User-Agent": BROWSER_UA,
          },
          type: "hls",
          quality: "unknown",
          audioTracks: [{ language: "en", label: "English" }],
          provider: { id: PROVIDER_ID, name: PROVIDER_NAME },
        },
      ],
      subtitles: [],
    };
  } catch (error) {
    if (req.signal?.aborted || (error instanceof Error && error.name === "AbortError")) {
      return { sources: [], subtitles: [] };
    }
    logError(`Provider:${PROVIDER_ID}`, error);
    return { sources: [], subtitles: [] };
  }
}

export const vixsrcProvider: Provider = {
  id: PROVIDER_ID,
  name: PROVIDER_NAME,
  priority: 20,
  fetch: scrape,
};
