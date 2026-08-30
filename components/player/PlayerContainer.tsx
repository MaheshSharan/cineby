import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { Episode, MediaSource, PlayerMedia, PlayerSeason, PlayerSettings, ServerOption, SubtitleTrack } from "./types";
import { HISTORY_SAVE_INTERVAL_MS, SERVERS } from "./constants";

import { createMediaEngine, type MediaEngine } from "./media";
import { resolveStream } from "./providers";
import { getSeasonEpisodes } from "@/lib/api/episodes";
import { formatRuntime } from "@/lib/utils/media";

import { usePlayerControls } from "./hooks/usePlayerControls";
import { usePlayerState } from "./hooks/usePlayerState";
import { useSubtitles } from "./hooks/useSubtitles";
import { useEpisodePrefetch } from "@/hooks/useEpisodePrefetch";

import { AudioSubtitlesPopover, DEFAULT_SUBTITLE_APPEARANCE, type SubtitleAppearance } from "./ui/AudioSubtitlesPopover";
import { EpisodesDrawer } from "./ui/EpisodesDrawer";
import { LoadingSpinner } from "./ui/LoadingSpinner";
import { PlayerControls } from "./ui/PlayerControls";
import { PlayerHeader } from "./ui/PlayerHeader";
import { QualityPopover } from "./ui/QualityPopover";

interface PlayerContainerProps {
  media: PlayerMedia;
  subtitle?: string;
  resolveToken: string;
  onBack?: () => void;
  onTimeUpdate?: (currentTime: number, duration: number, playback?: { seasonNumber?: number; episodeNumber?: number }) => void;
  onEnded?: () => void;
  onNavigateEpisode?: (seasonNumber: number, episodeNumber: number) => void;
}

interface StreamState {
  source: MediaSource | null;
  isError: boolean;
}

function detectFormat(url: string): MediaSource["format"] {
  const lower = url.toLowerCase();
  if (lower.includes(".m3u8")) return "hls";
  if (lower.includes(".mpd")) return "dash";
  if (lower.includes(".mp4")) return "mp4";
  if (lower.includes(".webm")) return "webm";
  if (lower.includes(".mkv")) return "mkv";
  return "unknown";
}

export function PlayerContainer({
  media,
  subtitle,
  resolveToken,
  onBack,
  onTimeUpdate,
  onEnded,
  onNavigateEpisode,
}: PlayerContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const stagingVideoRef = useRef<HTMLVideoElement | null>(null);
  const mediaEngineRef = useRef<MediaEngine | null>(null);
  const stagingEngineRef = useRef<MediaEngine | null>(null);
  const streamRequestControllerRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);
  const endedRef = useRef(false);
  const currentTokenRef = useRef<string>(resolveToken);

  const qualityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [settings, setSettings] = useState<PlayerSettings>({
    volume: 0.8,
    muted: false,
    rate: 1,
    quality: null,
    serverId: "default",
    subtitleLang: null,
    autoNext: true,
  });

  const [stream, setStream] = useState<StreamState>({ source: null, isError: false });
  const [isResolvingStream, setIsResolvingStream] = useState(true);
  const [availableSources, setAvailableSources] = useState<MediaSource[]>([]);
  const [availableSubtitles, setAvailableSubtitles] = useState<SubtitleTrack[]>([]);

  // Modals and Popovers state
  const [isQualityOpen, setIsQualityOpen] = useState(false);
  const [isAudioSubtitlesOpen, setIsAudioSubtitlesOpen] = useState(false);
  const [isEpisodesOpen, setIsEpisodesOpen] = useState(false);
  const [appearance, setAppearance] = useState<SubtitleAppearance>(DEFAULT_SUBTITLE_APPEARANCE);

  const isTv = media.mediaType === "tv";
  const seasons = useMemo<PlayerSeason[]>(() => media.seasons ?? [], [media.seasons]);

  const [currentSeason, setCurrentSeason] = useState<number>(media.seasonNumber ?? 1);
  const [currentEpisode, setCurrentEpisode] = useState<number>(media.episodeNumber ?? 1);
  const [drawerSeason, setDrawerSeason] = useState<number>(media.seasonNumber ?? 1);
  const [episodesBySeason, setEpisodesBySeason] = useState<Record<number, Episode[]>>({});
  const [isEpisodesLoading, setIsEpisodesLoading] = useState(false);

  const activeSeasonInfo = useMemo(
    () => seasons.find((season) => season.seasonNumber === currentSeason) ?? null,
    [seasons, currentSeason]
  );
  const currentSeasonEpisodes = episodesBySeason[currentSeason] ?? [];
  const drawerEpisodes = episodesBySeason[drawerSeason] ?? [];

  const isLastEpisode = useMemo(() => {
    if (!activeSeasonInfo) {
      return false;
    }

    const isLastOfSeason = currentEpisode >= activeSeasonInfo.episodeCount;
    if (!isLastOfSeason) {
      return false;
    }

    const hasNextSeason = seasons.some(
      (season) => season.seasonNumber > currentSeason && season.episodeCount > 0
    );
    return !hasNextSeason;
  }, [activeSeasonInfo, currentEpisode, currentSeason, seasons]);

  const hasNext = isTv && currentSeasonEpisodes.length > 0 && !isLastEpisode;

  const nextEpisode = useMemo(() => {
    if (!isTv || !hasNext) {
      return null;
    }

    const isLastOfCurrentSeason = currentEpisode >= (activeSeasonInfo?.episodeCount ?? 0);
    if (!isLastOfCurrentSeason) {
      return {
        tmdbId: media.mediaId,
        season: currentSeason,
        episode: currentEpisode + 1,
      };
    }

    const nextSeason = seasons.find(
      (season) => season.seasonNumber > currentSeason && season.episodeCount > 0
    );
    if (nextSeason) {
      return {
        tmdbId: media.mediaId,
        season: nextSeason.seasonNumber,
        episode: 1,
      };
    }

    return null;
  }, [isTv, hasNext, currentEpisode, activeSeasonInfo, currentSeason, seasons, media.mediaId]);

  // Fetch episodes for current and drawer seasons
  useEffect(() => {
    if (!isTv) {
      return;
    }

    const seasonsToLoad = [currentSeason, drawerSeason].filter(
      (s, idx, arr) => arr.indexOf(s) === idx && !episodesBySeason[s]
    );

    if (seasonsToLoad.length === 0) {
      return;
    }

    let isCurrent = true;
    setIsEpisodesLoading(true);

    Promise.all(
      seasonsToLoad.map(async (s) => {
        try {
          const data = await getSeasonEpisodes(media.mediaId, s);
          return {
            season: s,
            episodes: data.episodes.map((episode) => ({
              id: episode.id,
              seasonNumber: episode.seasonNumber,
              episodeNumber: episode.episodeNumber,
              name: episode.name,
              overview: episode.overview,
              stillPath: episode.stillPath,
              runtime: episode.runtime,
              airDate: episode.airDate,
              voteAverage: episode.voteAverage,
            })),
          };
        } catch {
          return null;
        }
      })
    )
      .then((results) => {
        if (!isCurrent) return;
        const updates: Record<number, Episode[]> = {};
        for (const res of results) {
          if (res) {
            updates[res.season] = res.episodes;
          }
        }
        if (Object.keys(updates).length > 0) {
          setEpisodesBySeason((prev) => ({ ...prev, ...updates }));
        }
      })
      .finally(() => {
        if (isCurrent) {
          setIsEpisodesLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [currentSeason, drawerSeason, episodesBySeason, isTv, media.mediaId]);

  const currentEpisodeData = useMemo(() => {
    if (!isTv) return null;
    const episodes = episodesBySeason[currentSeason] ?? [];
    return episodes.find((episode) => episode.episodeNumber === currentEpisode) ?? null;
  }, [isTv, episodesBySeason, currentSeason, currentEpisode]);

  const computedHeaderSubtitle = useMemo(() => {
    if (isTv) {
      const episodePrefix = `S${currentSeason} E${currentEpisode}`;
      const episodeName = currentEpisodeData?.name ?? media.episodeName ?? "";
      const runtimeMinutes = currentEpisodeData?.runtime ?? media.runtime ?? null;
      const durationStr = runtimeMinutes
        ? formatRuntime(runtimeMinutes)
        : media.duration ?? "";

      const titlePart = episodeName ? `${episodePrefix} ${episodeName}` : episodePrefix;
      if (durationStr) {
        return `${titlePart} · ${durationStr}`;
      }
      return titlePart;
    }

    const year = media.releaseYear ?? "";
    const runtimeMinutes = media.runtime ?? null;
    const durationStr = runtimeMinutes
      ? formatRuntime(runtimeMinutes)
      : media.duration ?? "";

    if (year && durationStr) {
      return `${year} · ${durationStr}`;
    }
    if (durationStr) {
      return durationStr;
    }
    if (year) {
      return year;
    }
    return subtitle ?? "";
  }, [
    isTv,
    currentSeason,
    currentEpisode,
    currentEpisodeData,
    media.episodeName,
    media.runtime,
    media.duration,
    media.releaseYear,
    subtitle,
  ]);

  const playerState = usePlayerState({
    videoRef,
    autoPlay: true,
  });
  const { setRate } = playerState;

  useEpisodePrefetch({
    currentTime: playerState.currentTime,
    duration: playerState.duration,
    nextEpisode,
    mediaType: media.mediaType,
  });

  function toggleFullscreen() {
    const element = containerRef.current;
    if (!element) return;

    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void element.requestFullscreen();
    }
  }

  const handleQualityMouseEnter = () => {
    if (qualityTimerRef.current) clearTimeout(qualityTimerRef.current);
    if (audioTimerRef.current) clearTimeout(audioTimerRef.current);
    setIsAudioSubtitlesOpen(false);
    setIsQualityOpen(true);
  };

  const handleQualityMouseLeave = () => {
    if (qualityTimerRef.current) clearTimeout(qualityTimerRef.current);
    qualityTimerRef.current = setTimeout(() => {
      setIsQualityOpen(false);
    }, 150);
  };

  const handleAudioMouseEnter = () => {
    if (qualityTimerRef.current) clearTimeout(qualityTimerRef.current);
    if (audioTimerRef.current) clearTimeout(audioTimerRef.current);
    setIsQualityOpen(false);
    setIsAudioSubtitlesOpen(true);
  };

  const handleAudioMouseLeave = () => {
    if (audioTimerRef.current) clearTimeout(audioTimerRef.current);
    audioTimerRef.current = setTimeout(() => {
      setIsAudioSubtitlesOpen(false);
    }, 150);
  };

  const controls = usePlayerControls({
    onTogglePlay: playerState.togglePlay,
    onSeekBy: playerState.seekBy,
    onToggleMute: playerState.toggleMute,
    onToggleFullscreen: toggleFullscreen,
    onToggleSettings: () => {
      setIsAudioSubtitlesOpen(false);
      setIsQualityOpen((open) => !open);
    },
    onToggleSubtitles: () => {
      setIsQualityOpen(false);
      setIsAudioSubtitlesOpen((open) => !open);
    },
  });

  const subtitles = useSubtitles({ videoRef });

  // Latest-value mirror: loadStream reads subtitle state through the ref instead of
  // depending on it, so selecting a track never re-creates loadStream (which would
  // re-resolve with an already-consumed single-use token and fail with 403).
  const subtitlesRef = useRef(subtitles);
  useEffect(() => {
    subtitlesRef.current = subtitles;
  }, [subtitles]);

  const fetchFreshResolveToken = useCallback(async (): Promise<string | null> => {
    try {
      const res = await fetch(`/api/stream/token-refresh?tmdbId=${media.mediaId}`);
      if (!res.ok) {
        return null;
      }
      const data = (await res.json()) as { token?: string };
      return data.token ?? null;
    } catch {
      return null;
    }
  }, [media.mediaId]);

  const currentMediaKey = `${media.mediaType}-${media.mediaId}-${isTv ? currentSeason : 0}-${isTv ? currentEpisode : 0}`;
  const lastMediaKeyRef = useRef<string>(currentMediaKey);

  const loadStream = useCallback(
    async (serverId: string) => {
      console.log(`[Player] Loading stream: serverId=${serverId}`);
      const element = videoRef.current;
      if (!element) return;

      const isSameMedia = lastMediaKeyRef.current === currentMediaKey;
      lastMediaKeyRef.current = currentMediaKey;

      const previousTime = isSameMedia && element.currentTime > 0 ? element.currentTime : 0;

      console.log(`[Player] Resolving stream for ${media.mediaType}/${media.mediaId}${isTv ? ` S${currentSeason}E${currentEpisode}` : ""}`);

      const requestId = ++requestIdRef.current;
      streamRequestControllerRef.current?.abort();
      const controller = new AbortController();
      streamRequestControllerRef.current = controller;
      setIsResolvingStream(true);
      setStream((current) => ({ ...current, isError: false }));

      const request = {
        mediaType: media.mediaType,
        mediaId: media.mediaId,
        seasonNumber: isTv ? currentSeason : undefined,
        episodeNumber: isTv ? currentEpisode : undefined,
        signal: controller.signal,
      };

      let result = await resolveStream(serverId, request, currentTokenRef.current);
      if (requestId !== requestIdRef.current) {
        console.log("[Player] Request aborted (navigation or new request)");
        return;
      }

      // Resolve tokens are single-use; a concurrent mount (React StrictMode) or a
      // stale token can exhaust the current one. Self-heal once with a fresh token
      // instead of failing the whole load.
      if (result.error && result.sources.length === 0 && !controller.signal.aborted) {
        console.warn(
          `[Player] Resolve rejected (status=${result.error.status}, reason=${result.error.reason ?? "unknown"}) - retrying with a fresh token`
        );
        const freshToken = await fetchFreshResolveToken();
        if (requestId !== requestIdRef.current) {
          return;
        }
        if (freshToken) {
          currentTokenRef.current = freshToken;
          result = await resolveStream(serverId, request, freshToken);
          if (requestId !== requestIdRef.current) {
            return;
          }
        }
      }

      setIsResolvingStream(false);

      console.log(`[Player] Resolved ${result.sources?.length ?? 0} sources, ${result.subtitles?.length ?? 0} subtitles`);

      if (result.subtitles && result.subtitles.length > 0) {
        setAvailableSubtitles(result.subtitles);
        // Auto-select English subtitle track by default if none is currently selected
        if (!subtitlesRef.current.activeTrack) {
          const defaultSub =
            result.subtitles.find(
              (s) => s.lang.toLowerCase() === "en" || s.label.toLowerCase().includes("english")
            ) ?? null;
          if (defaultSub) {
            subtitlesRef.current.selectTrack(defaultSub);
          }
        }
      }
      if (result.sources && result.sources.length > 0) {
        setAvailableSources(result.sources);
      }

      const source = result.source;
      if (!source) {
        console.error("[Player] ❌ No source resolved");
        // Keep a stream that is already playing instead of tearing it down with an error
        setStream((current) =>
          current.source ? current : { source: null, isError: true }
        );
        return;
      }

      console.log(`[Player] ✅ Playing source: ${source.name} (${source.quality ?? "unknown"}) - ${source.format}`);

      const format = source.format === "unknown" ? detectFormat(source.url) : source.format;

      if (mediaEngineRef.current) {
        mediaEngineRef.current.destroy();
        mediaEngineRef.current = null;
      }

      const engine = createMediaEngine(element, source.url, format);
      mediaEngineRef.current = engine;

      // Restore playback position seamlessly from the exact spot
      if (previousTime > 0) {
        const restoreTime = () => {
          try {
            if (element.duration && previousTime < element.duration) {
              element.currentTime = previousTime;
            } else if (!element.duration) {
              element.currentTime = previousTime;
            }
          } catch {}
        };

        if (element.readyState >= 1) {
          restoreTime();
        } else {
          element.addEventListener("loadedmetadata", restoreTime, { once: true });
        }
      }

      endedRef.current = false;
      setStream({ source, isError: false });
      void element.play().catch(() => {});
    },
    [currentEpisode, currentMediaKey, currentSeason, fetchFreshResolveToken, isTv, media.mediaId, media.mediaType]
  );

  const loadStreamDoubleBuffer = useCallback(
    async (serverId: string) => {
      const activeElement = videoRef.current;
      if (!activeElement) {
        await loadStream(serverId);
        return;
      }

      const snapshotTime = activeElement.currentTime;

      if (stagingVideoRef.current) {
        if (stagingEngineRef.current) {
          stagingEngineRef.current.destroy();
          stagingEngineRef.current = null;
        }
        stagingVideoRef.current.remove();
        stagingVideoRef.current = null;
      }

      const staging = document.createElement("video");
      staging.style.display = "none";
      staging.muted = true;
      staging.playsInline = true;
      activeElement.parentElement?.appendChild(staging);
      stagingVideoRef.current = staging;

      const requestId = ++requestIdRef.current;
      streamRequestControllerRef.current?.abort();
      const controller = new AbortController();
      streamRequestControllerRef.current = controller;
      setIsResolvingStream(true);

      let freshToken = currentTokenRef.current;
      const refreshedToken = await fetchFreshResolveToken();
      if (requestId !== requestIdRef.current) {
        return;
      }
      if (refreshedToken) {
        freshToken = refreshedToken;
        currentTokenRef.current = refreshedToken;
      }

      const request = {
        mediaType: media.mediaType,
        mediaId: media.mediaId,
        seasonNumber: isTv ? currentSeason : undefined,
        episodeNumber: isTv ? currentEpisode : undefined,
        signal: controller.signal,
      };

      const result = await resolveStream(serverId, request, freshToken);
      if (requestId !== requestIdRef.current) {
        return;
      }
      setIsResolvingStream(false);

      if (result.subtitles && result.subtitles.length > 0) {
        setAvailableSubtitles(result.subtitles);
      }
      if (result.sources && result.sources.length > 0) {
        setAvailableSources(result.sources);
      }

      const source = result.source;
      if (!source) {
        // Keep a stream that is already playing instead of tearing it down with an error
        setStream((current) =>
          current.source ? current : { source: null, isError: true }
        );
        if (stagingVideoRef.current) {
          stagingVideoRef.current.remove();
          stagingVideoRef.current = null;
        }
        return;
      }

      if (source.id && source.id !== serverId) {
        setSettings((prev) => ({ ...prev, serverId: source.id }));
      }

      const format = source.format === "unknown" ? detectFormat(source.url) : source.format;
      const stagingEngine = createMediaEngine(staging, source.url, format);
      stagingEngineRef.current = stagingEngine;

      staging.currentTime = snapshotTime;

      const onCanPlay = () => {
        if (requestId !== requestIdRef.current) {
          return;
        }

        activeElement.pause();
        staging.currentTime = activeElement.currentTime;
        staging.style.display = "block";
        staging.muted = activeElement.muted;
        staging.volume = activeElement.volume;
        activeElement.style.display = "none";

        void staging.play().catch(() => {});

        if (mediaEngineRef.current) {
          mediaEngineRef.current.destroy();
          mediaEngineRef.current = null;
        }
        activeElement.remove();

        videoRef.current = staging;
        mediaEngineRef.current = stagingEngine;
        stagingVideoRef.current = null;
        stagingEngineRef.current = null;

        staging.removeEventListener("canplay", onCanPlay);

        setStream({ source, isError: false });
      };

      staging.addEventListener("canplay", onCanPlay, { once: true });
    },
    [currentEpisode, currentSeason, fetchFreshResolveToken, isTv, loadStream, media.mediaId, media.mediaType]
  );

  useEffect(() => {
    void loadStream(settings.serverId);
  }, [loadStream, settings.serverId]);

  useEffect(() => {
    const onUnmount = () => {
      streamRequestControllerRef.current?.abort();
      streamRequestControllerRef.current = null;
      mediaEngineRef.current?.destroy();
      mediaEngineRef.current = null;

      if (stagingEngineRef.current) {
        stagingEngineRef.current.destroy();
        stagingEngineRef.current = null;
      }
      if (stagingVideoRef.current) {
        stagingVideoRef.current.remove();
        stagingVideoRef.current = null;
      }

      if (qualityTimerRef.current) clearTimeout(qualityTimerRef.current);
      if (audioTimerRef.current) clearTimeout(audioTimerRef.current);

      const video = videoRef.current;
      if (video) {
        video.removeAttribute("src");
        video.load();
      }
    };

    window.addEventListener("beforeunload", onUnmount);
    return () => {
      window.removeEventListener("beforeunload", onUnmount);
      onUnmount();
    };
  }, []);

  useEffect(() => {
    if (mediaEngineRef.current && "setQuality" in mediaEngineRef.current) {
      mediaEngineRef.current.setQuality(settings.quality);
    }
  }, [settings.quality]);

  useEffect(() => {
    if (!stream.source) {
      return;
    }

    const saveHistory = () => {
      onTimeUpdate?.(videoRef.current?.currentTime ?? 0, videoRef.current?.duration ?? 0, {
        seasonNumber: isTv ? currentSeason : undefined,
        episodeNumber: isTv ? currentEpisode : undefined,
      });
    };

    const interval = window.setInterval(saveHistory, HISTORY_SAVE_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [currentEpisode, currentSeason, isTv, onTimeUpdate, stream.source]);

  // Close open popovers with Escape
  useEffect(() => {
    if (!isQualityOpen && !isAudioSubtitlesOpen && !isEpisodesOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsQualityOpen(false);
        setIsAudioSubtitlesOpen(false);
        setIsEpisodesOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isQualityOpen, isAudioSubtitlesOpen, isEpisodesOpen]);

  const handleToggleAutoNext = useCallback(() => {
    setSettings((current) => ({ ...current, autoNext: !current.autoNext }));
  }, []);

  const handleNavigate = useCallback(
    (seasonNumber: number, episodeNumber: number) => {
      setCurrentSeason(seasonNumber);
      setCurrentEpisode(episodeNumber);
      setDrawerSeason(seasonNumber);
      setIsEpisodesOpen(false);
      onNavigateEpisode?.(seasonNumber, episodeNumber);
    },
    [onNavigateEpisode]
  );

  const handleNextEpisode = useCallback(() => {
    if (!activeSeasonInfo) {
      return;
    }

    if (currentEpisode < activeSeasonInfo.episodeCount) {
      handleNavigate(currentSeason, currentEpisode + 1);
      return;
    }

    const nextSeason = seasons.find(
      (season) => season.seasonNumber > currentSeason && season.episodeCount > 0
    );
    if (nextSeason) {
      handleNavigate(nextSeason.seasonNumber, 1);
    }
  }, [activeSeasonInfo, currentEpisode, currentSeason, handleNavigate, seasons]);

  useEffect(() => {
    if (!playerState.isEnded) {
      return;
    }

    if (settings.autoNext && !endedRef.current && hasNext) {
      endedRef.current = true;
      handleNextEpisode();
      return;
    }

    if (settings.autoNext && !endedRef.current && isLastEpisode) {
      endedRef.current = true;
      onEnded?.();
    }
  }, [playerState.isEnded, settings.autoNext, hasNext, isLastEpisode, handleNextEpisode, onEnded]);

  const handleSeasonChange = useCallback((seasonNumber: number) => {
    setDrawerSeason(seasonNumber);
  }, []);

  const handleEpisodeSelect = useCallback(
    (episode: Episode) => {
      handleNavigate(episode.seasonNumber, episode.episodeNumber);
    },
    [handleNavigate]
  );

  const handleServerChange = useCallback(
    (serverId: string) => {
      void loadStreamDoubleBuffer(serverId);
    },
    [loadStreamDoubleBuffer]
  );

  const handleQualityChange = useCallback((quality: PlayerSettings["quality"]) => {
    setSettings((current) => ({ ...current, quality }));
  }, []);

  const handleRateChange = useCallback(
    (rate: PlayerSettings["rate"]) => {
      setSettings((current) => ({ ...current, rate }));
      setRate(rate);
    },
    [setRate]
  );

  const handleUploadSubtitle = useCallback(
    (file: File) => {
      const url = URL.createObjectURL(file);
      const customTrack: SubtitleTrack = {
        id: `custom-${Date.now()}`,
        lang: "custom",
        label: file.name.replace(/\.[^/.]+$/, ""),
        url,
      };
      setAvailableSubtitles((prev) => [customTrack, ...prev]);
      subtitles.selectTrack(customTrack);
    },
    [subtitles]
  );

  const serverOptions = useMemo<ServerOption[]>(() => {
    const list = [...SERVERS];
    for (const src of availableSources) {
      const existingIndex = list.findIndex((server) => server.id === src.id);
      const sourceOption: ServerOption = {
        id: src.id,
        name: src.name,
        description: src.quality ? `${src.quality} stream` : "Direct source",
        kind: src.kind,
      };

      if (existingIndex >= 0) {
        list[existingIndex] = sourceOption;
      } else {
        list.push(sourceOption);
      }
    }

    return list;
  }, [availableSources]);

  const isLoading = isResolvingStream && !stream.source;

  return (
    <div ref={containerRef} className="fixed inset-0 bg-black overflow-hidden select-none">
      {/* Subtitle Appearance Dynamic Cue Style */}
      <style jsx global>{`
        video::cue {
          color: ${appearance.color} !important;
          background-color: rgba(0, 0, 0, ${appearance.bgOpacity}) !important;
          font-size: ${appearance.fontSize}px !important;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.9) !important;
        }
      `}</style>

      <div className="flex h-full w-full">
        <div className="cineby-container relative top-0 left-0 w-full h-full flex justify-center items-center">
          {/* Video */}
          <div className="absolute inset-0 z-0">
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video
              ref={videoRef}
              className="h-full w-full"
              playsInline
              preload="auto"
            />
          </div>

          {/* Top Header Bar */}
          <PlayerHeader
            title={media.title}
            subtitle={computedHeaderSubtitle}
            onBack={onBack}
            visible={controls.areControlsVisible}
            rightSlot={
              <div className="flex items-center gap-1 md:gap-4 flex-shrink-0 relative">
                {/* Quality Button with Hover/Click Popover */}
                <div
                  className="relative"
                  onMouseEnter={handleQualityMouseEnter}
                  onMouseLeave={handleQualityMouseLeave}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setIsAudioSubtitlesOpen(false);
                      setIsQualityOpen((prev) => !prev);
                    }}
                    className={`tabbable flex items-center gap-2 p-2 md:px-3 md:py-2 rounded-lg text-white/90 hover:text-white hover:bg-white/10 transition-all text-sm font-semibold ${
                      isQualityOpen ? "bg-white/20 text-white" : ""
                    }`}
                  >
                    <svg
                      className="w-6 h-6 flex-shrink-0"
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      color="currentColor"
                    >
                      <path
                        d="M14 12L10.5 14V10L14 12Z"
                        fill="currentColor"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M2 12.7075V11.2924C2 8.39705 2 6.94939 2.90549 6.01792C3.81099 5.08645 5.23656 5.04613 8.08769 4.96549C9.43873 4.92728 10.8188 4.8999 12 4.8999C13.1812 4.8999 14.5613 4.92728 15.9123 4.96549C18.7634 5.04613 20.189 5.08645 21.0945 6.01792C22 6.94939 22 8.39705 22 11.2924V12.7075C22 15.6028 22 17.0505 21.0945 17.9819C20.189 18.9134 18.7635 18.9537 15.9124 19.0344C14.5613 19.0726 13.1812 19.1 12 19.1C10.8188 19.1 9.43867 19.0726 8.0876 19.0344C5.23651 18.9537 3.81097 18.9134 2.90548 17.9819C2 17.0505 2 15.6028 2 12.7075Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                    </svg>
                    <span className="hidden md:inline">Quality</span>
                    <span className="hidden md:inline opacity-50 font-normal">
                      {settings.quality ?? "1080p"}
                    </span>
                  </button>

                  <QualityPopover
                    open={isQualityOpen}
                    quality={settings.quality}
                    onQualityChange={handleQualityChange}
                    servers={serverOptions}
                    activeServerId={settings.serverId}
                    onServerChange={handleServerChange}
                    rate={settings.rate}
                    onRateChange={handleRateChange}
                  />
                </div>

                {/* Audio & Subtitles Button with Hover/Click Popover */}
                <div
                  className="relative"
                  onMouseEnter={handleAudioMouseEnter}
                  onMouseLeave={handleAudioMouseLeave}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setIsQualityOpen(false);
                      setIsAudioSubtitlesOpen((prev) => !prev);
                    }}
                    className={`tabbable flex items-center gap-2 p-2 md:px-3 md:py-2 rounded-lg text-white/90 hover:text-white hover:bg-white/10 transition-all text-sm font-semibold ${
                      isAudioSubtitlesOpen ? "bg-white/20 text-white" : ""
                    }`}
                  >
                    <svg
                      className="w-6 h-6 flex-shrink-0"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      color="currentColor"
                    >
                      <path
                        d="M1 15V9C1 5.68629 3.68629 3 7 3H17C20.3137 3 23 5.68629 23 9V15C23 18.3137 20.3137 21 17 21H7C3.68629 21 1 18.3137 1 15Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                      <path
                        d="M10.5 10L10.3284 9.82843C9.79799 9.29799 9.07857 9 8.32843 9C6.76633 9 5.5 10.2663 5.5 11.8284V12.1716C5.5 13.7337 6.76633 15 8.32843 15C9.07857 15 9.79799 14.702 10.3284 14.1716L10.5 14"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                      <path
                        d="M18.5 10L18.3284 9.82843C17.798 9.29799 17.0786 9 16.3284 9C14.7663 9 13.5 10.2663 13.5 11.8284V12.1716C13.5 13.7337 14.7663 15 16.3284 15C17.0786 15 17.798 14.702 18.3284 14.1716L18.5 14"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="hidden md:inline">Audio &amp; Subtitles</span>
                  </button>

                  <AudioSubtitlesPopover
                    open={isAudioSubtitlesOpen}
                    subtitleTracks={availableSubtitles}
                    activeSubtitleId={subtitles.activeTrack?.id}
                    onSubtitleChange={subtitles.selectTrack}
                    onUploadSubtitle={handleUploadSubtitle}
                    appearance={appearance}
                    onAppearanceChange={setAppearance}
                  />
                </div>

                {/* Next Episode Button in Header (TV only) */}
                {isTv && hasNext ? (
                  <button
                    type="button"
                    onClick={handleNextEpisode}
                    className="tabbable flex items-center gap-2 p-2 md:px-3 md:py-2 rounded-lg text-white/90 hover:text-white hover:bg-white/10 transition-all text-sm font-semibold"
                  >
                    <svg
                      className="w-6 h-6 flex-shrink-0"
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      color="currentColor"
                    >
                      <path
                        d="M18 7V17"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M6.97179 5.2672C6.57832 4.95657 6 5.23682 6 5.73813V18.2619C6 18.7632 6.57832 19.0434 6.97179 18.7328L14.9035 12.4709C15.2078 12.2307 15.2078 11.7693 14.9035 11.5291L6.97179 5.2672Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="hidden md:inline">Next Episode</span>
                  </button>
                ) : null}
              </div>
            }
          />

          {/* Buffering Indicator */}
          {isLoading || playerState.isBuffering ? (
            <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
              <LoadingSpinner className="[&>svg]:h-7 [&>svg]:w-7" />
            </div>
          ) : null}

          {/* Stream Error Toast */}
          {stream.isError ? (
            <div
              data-player-ui
              className="absolute bottom-28 left-1/2 -translate-x-1/2 z-[60] player-surface rounded-2xl px-6 py-4 shadow-2xl flex items-center gap-4 max-w-md w-[calc(100%-2rem)] animate-in fade-in slide-in-from-bottom-4 duration-300"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">Unable to play this source</p>
                <p className="text-xs text-white/50 mt-0.5">Try a different server from Quality menu.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setStream({ source: null, isError: false });
                  void loadStreamDoubleBuffer(settings.serverId);
                }}
                className="flex-shrink-0 rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-black transition-colors hover:bg-white/90 cursor-pointer"
              >
                Retry
              </button>
              <button
                type="button"
                onClick={() => setStream((prev) => ({ ...prev, isError: false }))}
                aria-label="Dismiss"
                className="flex-shrink-0 p-1 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : null}

          {/* Bottom Controls Bar */}
          <PlayerControls
            visible={controls.areControlsVisible}
            isPlaying={playerState.isPlaying}
            currentTime={playerState.currentTime}
            duration={playerState.duration}
            volume={playerState.volume}
            muted={playerState.muted}
            onTogglePlay={playerState.togglePlay}
            onSeek={playerState.seekTo}
            onSeekBy={playerState.seekBy}
            onVolumeChange={playerState.setVolume}
            onToggleMute={playerState.toggleMute}
            onToggleFullscreen={toggleFullscreen}
            centerSlot={
              isTv ? (
                <button
                  type="button"
                  onClick={() => setIsEpisodesOpen(true)}
                  aria-label="Episodes"
                  className="tabbable group flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm font-semibold backdrop-blur-md transition-all active:scale-95 cursor-pointer"
                >
                  <span>Episodes</span>
                  <svg
                    className={`w-3.5 h-3.5 text-gray-300 transition-transform duration-200 ${
                      isEpisodesOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7" />
                  </svg>
                </button>
              ) : null
            }
          />

          {/* Episodes Modal (TV only) */}
          {isTv ? (
            <EpisodesDrawer
              open={isEpisodesOpen}
              onClose={() => setIsEpisodesOpen(false)}
              title={media.title}
              seasons={seasons.map((season) => ({
                seasonNumber: season.seasonNumber,
                name: season.name,
                episodeCount: season.episodeCount,
                overview: season.overview,
              }))}
              episodes={drawerEpisodes}
              selectedSeason={drawerSeason}
              onSeasonChange={handleSeasonChange}
              onEpisodeSelect={handleEpisodeSelect}
              activeEpisodeNumber={currentEpisode}
              activeSeasonNumber={currentSeason}
              isLoading={isEpisodesLoading}
              autoNext={settings.autoNext}
              onToggleAutoNext={handleToggleAutoNext}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
