import { useEffect, useRef } from "react";

interface NextEpisode {
  tmdbId: number;
  season: number;
  episode: number;
}

interface UsePrefetchParams {
  currentTime: number;
  duration: number;
  nextEpisode: NextEpisode | null;
  mediaType: string;
}

const PREFETCH_THRESHOLD = 0.8;

export function useEpisodePrefetch({
  currentTime,
  duration,
  nextEpisode,
  mediaType,
}: UsePrefetchParams) {
  const prefetchedRef = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!nextEpisode || mediaType !== "tv") {
      return;
    }

    const episodeKey = `${nextEpisode.tmdbId}-${nextEpisode.season}-${nextEpisode.episode}`;

    if (prefetchedRef.current === episodeKey) {
      return;
    }

    const progress = duration > 0 ? currentTime / duration : 0;

    if (progress < PREFETCH_THRESHOLD) {
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    (async () => {
      try {
        const tokenRes = await fetch(
          `/api/stream/token-refresh?tmdbId=${nextEpisode.tmdbId}`,
          { signal: controller.signal }
        );

        if (!tokenRes.ok) {
          return;
        }

        const tokenData = (await tokenRes.json()) as { token?: string };
        const token = tokenData.token;

        if (!token) {
          return;
        }

        const params = new URLSearchParams({
          tmdbId: nextEpisode.tmdbId.toString(),
          type: "tv",
          season: nextEpisode.season.toString(),
          episode: nextEpisode.episode.toString(),
        });

        const resolveRes = await fetch(`/api/stream/resolve?${params.toString()}`, {
          headers: { "X-Stream-Token": token },
          signal: controller.signal,
        });

        if (!resolveRes.ok) {
          return;
        }

        const data = (await resolveRes.json()) as {
          sources?: Array<{ url: string }>;
        };

        if (data.sources?.[0]?.url) {
          const link = document.createElement("link");
          link.rel = "prefetch";
          link.href = data.sources[0].url;
          link.as = "fetch";
          document.head.appendChild(link);

          prefetchedRef.current = episodeKey;
        }
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.debug("[Prefetch] Silent failure:", error);
        }
      }
    })();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [currentTime, duration, nextEpisode, mediaType]);

  useEffect(() => {
    if (nextEpisode) {
      const episodeKey = `${nextEpisode.tmdbId}-${nextEpisode.season}-${nextEpisode.episode}`;
      if (prefetchedRef.current !== episodeKey) {
        prefetchedRef.current = null;
      }
    }
  }, [nextEpisode]);
}
