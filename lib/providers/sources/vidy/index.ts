import type {
  Provider,
  Quality,
  StreamRequest,
  StreamResponse,
  StreamSource,
  SubtitleTrack,
} from "../../types";
import { decryptVidyPayload } from "./cipher";
import { VIDY_SERVERS, type VidyServerConfig } from "./servers";
import { logError } from "@/lib/logger";
import { getCachedSeed, cacheSeed } from "@/lib/stream/seedCache";

const PROVIDER_ID = "vidy";
const PROVIDER_NAME = "Vidy";
const API_BASE = "https://api.wecollege.net";
const DB_BASE = "https://db.wecollege.net/3";
const SUBTITLES_BASE = "https://subtitles.vidy.st";

interface TmdbMeta {
  title: string;
  year: string;
  imdbId: string;
  titleGerman?: string;
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
  display?: string;
}

interface DecryptedPayload {
  sources?: DecryptedSourceItem[];
  subtitles?: DecryptedSubtitleItem[];
  playlist?: string;
  thumbnail?: string;
}

interface VidySubItem {
  id?: string;
  display?: string;
  language?: string;
  flagUrl?: string;
  format?: string;
  isHearingImpaired?: boolean;
  url?: string;
}

function parseQuality(q?: string): Quality {
  if (!q) return "unknown";
  const lower = q.toLowerCase();
  if (lower.includes("2160") || lower.includes("4k")) return "2160p";
  if (lower.includes("1440") || lower.includes("2k")) return "1440p";
  if (lower.includes("1080") || lower.includes("fhd") || lower.includes("full hd")) return "1080p";
  if (lower.includes("720") || lower.includes("hd")) return "720p";
  if (lower.includes("480") || lower.includes("sd")) return "480p";
  if (lower.includes("360")) return "360p";
  return "unknown";
}

async function fetchMetadata(
  type: "movie" | "tv",
  tmdbId: number,
  signal?: AbortSignal
): Promise<TmdbMeta> {
  try {
    const res = await fetch(
      `${DB_BASE}/${type}/${tmdbId}?append_to_response=credits,external_ids,translations,images&language=en`,
      {
        headers: {
          Referer: "https://www.vidy.st/",
          Origin: "https://www.vidy.st",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36",
        },
        signal,
      }
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

        let titleGerman: string | undefined;
        const translations = obj.translations as { translations?: Array<{ iso_639_1?: string; data?: { title?: string; name?: string } }> } | undefined;
        const germanTranslation = translations?.translations?.find((t) => t.iso_639_1 === "de");
        if (germanTranslation?.data) {
          titleGerman = germanTranslation.data.title || germanTranslation.data.name;
        }

        return { title, year, imdbId, titleGerman };
      }
    }
  } catch {
    // Ignore and fallback
  }

  return { title: "", year: "", imdbId: "" };
}

async function fetchSeed(tmdbId: number, signal?: AbortSignal): Promise<string | null> {
  const cached = await getCachedSeed(tmdbId);
  if (cached) {
    return cached;
  }

  try {
    const res = await fetch(`${API_BASE}/seed?mediaId=${tmdbId}`, {
      headers: {
        Referer: "https://www.vidy.st/",
        Origin: "https://www.vidy.st",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36",
      },
      signal,
    });

    if (res.ok) {
      const data: unknown = await res.json();
      if (data && typeof data === "object" && "seed" in data) {
        const seed = String((data as { seed: string }).seed);
        await cacheSeed(tmdbId, seed);
        return seed;
      }
    }
  } catch (err) {
    logError("Provider:vidy:seed", err);
  }
  return null;
}

async function fetchVidySubtitles(
  imdbId: string,
  type: "movie" | "tv",
  season?: number | null,
  episode?: number | null,
  signal?: AbortSignal
): Promise<SubtitleTrack[]> {
  if (!imdbId) return [];

  try {
    const url = new URL(`${SUBTITLES_BASE}/search`);
    url.searchParams.set("id", imdbId);
    if (type === "tv") {
      url.searchParams.set("season", String(season ?? 1));
      url.searchParams.set("episode", String(episode ?? 1));
    }

    const res = await fetch(url.toString(), {
      headers: {
        Referer: "https://www.vidy.st/",
        Origin: "https://www.vidy.st",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36",
      },
      signal,
    });

    if (!res.ok) return [];

    const data = (await res.json()) as VidySubItem[];
    if (!Array.isArray(data)) return [];

    return data
      .filter((sub) => Boolean(sub.url))
      .map((sub, idx) => {
        const lang = sub.language || "en";
        const label = sub.display || (lang === "en" ? "English" : lang.toUpperCase());
        const isSrt = sub.format?.toLowerCase() === "srt" || sub.url?.endsWith(".srt");

        return {
          id: `vidy-sub-${sub.id || idx}`,
          lang,
          label: sub.isHearingImpaired ? `${label} (CC)` : label,
          flagUrl: sub.flagUrl,
          url: sub.url as string,
          format: isSrt ? "srt" : "vtt",
          headers: {
            Referer: "https://www.vidy.st/",
            Origin: "https://www.vidy.st",
          },
        };
      });
  } catch (error) {
    if (!signal?.aborted) {
      logError("Provider:vidy:subtitles", error);
    }
    return [];
  }
}

async function scrapeServer(
  server: VidyServerConfig,
  req: StreamRequest,
  meta: TmdbMeta,
  seed: string
): Promise<{ sources: StreamSource[]; subtitles: SubtitleTrack[] }> {
  const { tmdbId, type, season, episode, signal } = req;
  const url = new URL(`${API_BASE}/${server.endpoint}`);

  const searchTitle =
    server.useGermanAltTitle && meta.titleGerman ? meta.titleGerman : meta.title;

  url.searchParams.set("title", searchTitle);
  url.searchParams.set("mediaType", type);
  url.searchParams.set("year", meta.year);
  url.searchParams.set("episodeId", String(episode ?? 1));
  url.searchParams.set("seasonId", String(season ?? 1));
  url.searchParams.set("tmdbId", String(tmdbId));
  url.searchParams.set("imdbId", meta.imdbId);
  url.searchParams.set("enc", "2");
  url.searchParams.set("seed", seed);
  url.searchParams.set("_t", String(Date.now()));

  if (server.languageParam) {
    url.searchParams.set("language", server.languageParam);
  }

  try {
    const res = await fetch(url.toString(), {
      headers: {
        Referer: "https://www.vidy.st/",
        Origin: "https://www.vidy.st",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36",
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
    if (!ciphertext || ciphertext.startsWith("{") || ciphertext.startsWith("<")) {
      return { sources: [], subtitles: [] };
    }
    const payload = decryptVidyPayload<DecryptedPayload>(ciphertext, seed, tmdbId);

    const sources: StreamSource[] = [];

    // Master Playlist (ABR adaptive stream)
    if (payload.playlist) {
      sources.push({
        url: payload.playlist,
        type: "hls",
        quality: "1080p",
        headers: {
          Referer: "https://www.vidy.st/",
          Origin: "https://www.vidy.st",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36",
        },
        provider: {
          id: `${PROVIDER_ID}-${server.id}`,
          name: server.name,
        },
        audioTracks: [{ language: server.audioLanguage, label: server.audioLabel }],
      });
    }

    // Individual variant sources
    const rawSources = payload.sources ?? [];
    for (const s of rawSources) {
      if (!s.url) continue;

      const audioLang =
        (typeof (s as Record<string, unknown>).audioLanguage === "string" && (s as Record<string, unknown>).audioLanguage as string) ||
        (typeof (s as Record<string, unknown>).language === "string" && (s as Record<string, unknown>).language as string) ||
        (typeof (s as Record<string, unknown>).audio === "string" && (s as Record<string, unknown>).audio as string) ||
        server.audioLanguage;

      const audioLabel =
        (typeof (s as Record<string, unknown>).audioLabel === "string" && (s as Record<string, unknown>).audioLabel as string) ||
        (typeof (s as Record<string, unknown>).label === "string" && (s as Record<string, unknown>).label as string) ||
        server.audioLabel;

      const audioTracks =
        Array.isArray((s as Record<string, unknown>).audioTracks) &&
        ((s as Record<string, unknown>).audioTracks as Array<{ language: string; label: string }>).length > 0
          ? ((s as Record<string, unknown>).audioTracks as Array<{ language: string; label: string }>)
          : [{ language: audioLang, label: audioLabel }];

      sources.push({
        url: s.url,
        type: s.type === "mp4" ? "mp4" : s.type === "dash" ? "dash" : "hls",
        quality: parseQuality(s.quality),
        headers: {
          Referer: "https://www.vidy.st/",
          Origin: "https://www.vidy.st",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36",
        },
        provider: {
          id: `${PROVIDER_ID}-${server.id}`,
          name: server.name,
        },
        audioTracks,
      });
    }

    const subtitles: SubtitleTrack[] = (payload.subtitles ?? [])
      .filter((sub) => Boolean(sub.url))
      .map((sub, idx) => ({
        id: `vidy-payload-${sub.lang || sub.language || idx}`,
        lang: sub.lang || sub.language || "en",
        label: sub.display || sub.lang || sub.language || `Subtitle ${idx + 1}`,
        url: sub.url as string,
        format: sub.url?.endsWith(".srt") ? "srt" : "vtt",
        headers: {
          Referer: "https://www.vidy.st/",
          Origin: "https://www.vidy.st",
        },
      }));

    return { sources, subtitles };
  } catch (error) {
    if (!signal?.aborted) {
      logError(`Provider:vidy:${server.id}`, error);
    }
    return { sources: [], subtitles: [] };
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

  // 2. Fetch Vidy Subtitles concurrently in parallel with stream resolutions
  const subtitlesPromise = meta.imdbId
    ? fetchVidySubtitles(meta.imdbId, type, season, episode, signal)
    : Promise.resolve<SubtitleTrack[]>([]);

  const requestedServerId = req.serverId?.startsWith(`${PROVIDER_ID}-`)
    ? req.serverId.slice(PROVIDER_ID.length + 1)
    : null;

  const servers = requestedServerId
    ? VIDY_SERVERS.filter((server) => server.id === requestedServerId)
    : VIDY_SERVERS;

  if (servers.length === 0) {
    return { sources: [], subtitles: [] };
  }

  // Fast startup: if no specific server requested, race servers with Promise.any()
  if (!requestedServerId) {
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

  // Target specific server
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

export const vidyProvider: Provider = {
  id: PROVIDER_ID,
  name: PROVIDER_NAME,
  priority: 10,
  fetch: scrape,
};
