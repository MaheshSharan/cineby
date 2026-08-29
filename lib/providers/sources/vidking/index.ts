import type {
  Provider,
  Quality,
  StreamRequest,
  StreamResponse,
  StreamSource,
  SubtitleTrack,
} from "../../types";
import { decryptVidkingPayload } from "./cipher";
import { logError } from "@/lib/logger";

const PROVIDER_ID = "vidking";
const PROVIDER_NAME = "Vidking";
const API_BASE = "https://api.speedracelight.com";
const DB_BASE = "https://db.speedracelight.com/3";

const SERVERS = [
  { id: "yoru", name: "Vidking - Yoru", endpoint: "cdn/sources-with-title" },
  { id: "cypher", name: "Vidking - Cypher", endpoint: "downloader2/sources-with-title" },
  { id: "breach", name: "Vidking - Breach", endpoint: "m4uhd/sources-with-title" },
  { id: "neon", name: "Vidking - Neon", endpoint: "vsrc/sources-with-title" },
] as const;

interface TmdbMeta {
  title: string;
  year: string;
  imdbId: string;
}

interface DecryptedSourceItem {
  quality?: string;
  url?: string;
  type?: string;
}

interface DecryptedSubtitleItem {
  lang?: string;
  language?: string;
  url?: string;
}

interface DecryptedPayload {
  sources?: DecryptedSourceItem[];
  subtitles?: DecryptedSubtitleItem[];
}

function parseQuality(q?: string): Quality {
  switch (q?.toLowerCase()) {
    case "2160p":
    case "4k":
      return "2160p";
    case "1080p":
      return "1080p";
    case "720p":
      return "720p";
    case "480p":
      return "480p";
    default:
      return "unknown";
  }
}

async function fetchMetadata(
  type: "movie" | "tv",
  tmdbId: number,
  signal?: AbortSignal
): Promise<TmdbMeta> {
  try {
    const res = await fetch(
      `${DB_BASE}/${type}/${tmdbId}?append_to_response=external_ids`,
      { signal }
    );
    if (res.ok) {
      const data: unknown = await res.json();
      if (data && typeof data === "object") {
        const obj = data as Record<string, unknown>;
        const title =
          type === "movie"
            ? String(obj.title || obj.original_title || "")
            : String(obj.name || obj.original_name || "");

        const dateStr = String(
          (type === "movie" ? obj.release_date : obj.first_air_date) || ""
        );
        const year = dateStr ? String(new Date(dateStr).getFullYear()) : "";

        const externalIds = obj.external_ids as Record<string, unknown> | undefined;
        const imdbId = String(externalIds?.imdb_id || "");

        return { title, year, imdbId };
      }
    }
  } catch {
    // Ignore and fallback
  }

  return { title: "", year: "", imdbId: "" };
}

async function fetchSeed(tmdbId: number, signal?: AbortSignal): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE}/seed?mediaId=${tmdbId}`, { signal });
    if (res.ok) {
      const data: unknown = await res.json();
      if (data && typeof data === "object" && "seed" in data) {
        return String((data as { seed: string }).seed);
      }
    }
  } catch (err) {
    logError("Provider:vidking", err);
  }
  return null;
}

async function scrapeServer(
  server: (typeof SERVERS)[number],
  req: StreamRequest,
  meta: TmdbMeta,
  seed: string
): Promise<{ sources: StreamSource[]; subtitles: SubtitleTrack[] }> {
  const { tmdbId, type, season, episode, signal } = req;
  const url = new URL(`${API_BASE}/${server.endpoint}`);

  url.searchParams.set("title", meta.title);
  url.searchParams.set("mediaType", type);
  url.searchParams.set("year", meta.year);
  url.searchParams.set("episodeId", String(episode ?? 1));
  url.searchParams.set("seasonId", String(season ?? 1));
  url.searchParams.set("tmdbId", String(tmdbId));
  url.searchParams.set("imdbId", meta.imdbId);
  url.searchParams.set("enc", "2");
  url.searchParams.set("seed", seed);
  url.searchParams.set("_t", String(Date.now()));

  try {
    const res = await fetch(url.toString(), {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
      signal,
    });

    if (!res.ok) {
      return { sources: [], subtitles: [] };
    }

    const ciphertext = await res.text();
    const payload = decryptVidkingPayload<DecryptedPayload>(ciphertext, seed, tmdbId);

    const sources: StreamSource[] = (payload.sources ?? [])
      .filter((s) => Boolean(s.url))
      .map((s) => ({
        url: s.url as string,
        type: s.type === "mp4" ? "mp4" : s.type === "dash" ? "dash" : "hls",
        quality: parseQuality(s.quality),
        headers: {
          Referer: "https://www.vidking.net/",
          Origin: "https://www.vidking.net",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        },
        provider: {
          id: `${PROVIDER_ID}-${server.id}`,
          name: server.name,
        },
        audioTracks: [{ language: "en", label: "English" }],
      }));

    const subtitles: SubtitleTrack[] = (payload.subtitles ?? [])
      .filter((sub) => Boolean(sub.url))
      .map((sub, idx) => ({
        id: `vidking-${sub.lang || sub.language || idx}`,
        lang: sub.lang || sub.language || "en",
        label: sub.lang || sub.language || `Subtitle ${idx + 1}`,
        url: sub.url as string,
        format: sub.url?.endsWith(".srt") ? "srt" : "vtt",
        headers: {
          Referer: "https://www.vidking.net/",
          Origin: "https://www.vidking.net",
        },
      }));

    return { sources, subtitles };
  } catch (error) {
    if (!signal?.aborted) {
      logError(`Provider:vidking:${server.id}`, error);
    }
    return { sources: [], subtitles: [] };
  }
}

interface VideasySubItem {
  id?: string;
  url?: string;
  display?: string;
  language?: string;
  flagUrl?: string;
  format?: string;
  isHearingImpaired?: boolean;
}

async function fetchVideasySubtitles(
  imdbId: string,
  type: "movie" | "tv",
  season?: number | null,
  episode?: number | null,
  signal?: AbortSignal
): Promise<SubtitleTrack[]> {
  if (!imdbId) return [];

  try {
    const url = new URL("https://subs.videasy.to/search");
    url.searchParams.set("id", imdbId);
    if (type === "tv") {
      url.searchParams.set("season", String(season ?? 1));
      url.searchParams.set("episode", String(episode ?? 1));
    }

    const res = await fetch(url.toString(), {
      headers: {
        Referer: "https://www.vidking.net/",
        Origin: "https://www.vidking.net",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
      },
      signal,
    });

    if (!res.ok) return [];

    const data = (await res.json()) as VideasySubItem[];
    if (!Array.isArray(data)) return [];

    return data
      .filter((sub) => Boolean(sub.url))
      .map((sub, idx) => {
        const lang = sub.language || "en";
        const label = sub.display || (lang === "en" ? "English" : lang.toUpperCase());
        const isSrt = sub.format?.toLowerCase() === "srt" || sub.url?.endsWith(".srt");

        return {
          id: `videasy-${sub.id || idx}`,
          lang,
          label: sub.isHearingImpaired ? `${label} (CC)` : label,
          flagUrl: sub.flagUrl,
          url: sub.url as string,
          format: isSrt ? "srt" : "vtt",
          headers: {
            Referer: "https://www.vidking.net/",
            Origin: "https://www.vidking.net",
          },
        };
      });
  } catch (error) {
    if (!signal?.aborted) {
      logError("Provider:vidking:subtitles", error);
    }
    return [];
  }
}

async function scrape(req: StreamRequest): Promise<StreamResponse> {
  if (req.signal?.aborted) {
    return { sources: [], subtitles: [] };
  }

  const { tmdbId, type, season, episode, signal } = req;

  // 1. Fetch metadata and seed concurrently
  const [meta, seed] = await Promise.all([
    fetchMetadata(type, tmdbId, signal),
    fetchSeed(tmdbId, signal),
  ]);

  if (!seed) {
    return { sources: [], subtitles: [] };
  }

  // 2. Fetch Videasy subtitles in background/parallel while stream servers race
  const subtitlesPromise = meta.imdbId
    ? fetchVideasySubtitles(meta.imdbId, type, season, episode, signal)
    : Promise.resolve<SubtitleTrack[]>([]);

  const requestedServerId = req.serverId?.startsWith(`${PROVIDER_ID}-`)
    ? req.serverId.slice(PROVIDER_ID.length + 1)
    : null;
  const servers = requestedServerId
    ? SERVERS.filter((server) => server.id === requestedServerId)
    : SERVERS;

  if (servers.length === 0) {
    return { sources: [], subtitles: [] };
  }

  if (!requestedServerId) {
    // Playback should begin as soon as one server resolves.
    try {
      const fastestResult = await Promise.any(
        servers.map(async (server) => {
          const result = await scrapeServer(server, req, meta, seed);
          if (result.sources.length === 0) {
            throw new Error(`${server.id} returned no playable sources`);
          }
          return result;
        })
      );

      const externalSubs = await subtitlesPromise.catch(() => []);
      const mergedSubs = [...fastestResult.subtitles];
      const seen = new Set(mergedSubs.map((s) => s.url));

      for (const sub of externalSubs) {
        if (!seen.has(sub.url)) {
          seen.add(sub.url);
          mergedSubs.push(sub);
        }
      }

      return {
        sources: fastestResult.sources,
        subtitles: mergedSubs,
      };
    } catch {
      return { sources: [], subtitles: [] };
    }
  }

  const results = await Promise.allSettled(
    servers.map((server) => scrapeServer(server, req, meta, seed))
  );

  const allSources: StreamSource[] = [];
  const allSubtitles: SubtitleTrack[] = [];
  const seenSubtitles = new Set<string>();

  for (const r of results) {
    if (r.status === "fulfilled") {
      allSources.push(...r.value.sources);
      for (const sub of r.value.subtitles) {
        if (!seenSubtitles.has(sub.url)) {
          seenSubtitles.add(sub.url);
          allSubtitles.push(sub);
        }
      }
    }
  }

  const externalSubs = await subtitlesPromise.catch(() => []);
  for (const sub of externalSubs) {
    if (!seenSubtitles.has(sub.url)) {
      seenSubtitles.add(sub.url);
      allSubtitles.push(sub);
    }
  }

  return {
    sources: allSources,
    subtitles: allSubtitles,
  };
}

export const vidkingProvider: Provider = {
  id: PROVIDER_ID,
  name: PROVIDER_NAME,
  priority: 10,
  fetch: scrape,
};
