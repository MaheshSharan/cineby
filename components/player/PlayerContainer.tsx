import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { Episode, MediaSource, PlayerMedia, PlayerSeason, PlayerSettings, ServerOption, SubtitleTrack } from "./types";
import { HISTORY_SAVE_INTERVAL_MS, SERVERS } from "./constants";

import { createMediaEngine, type MediaEngine } from "./media";
import { resolveStream } from "./providers";
import { getSeasonEpisodes } from "@/lib/api/episodes";

import { usePlayerControls } from "./hooks/usePlayerControls";
import { usePlayerState } from "./hooks/usePlayerState";
import { useSubtitles } from "./hooks/useSubtitles";

import { EpisodesDrawer } from "./ui/EpisodesDrawer";
import { LoadingSpinner } from "./ui/LoadingSpinner";
import { PlayerControls } from "./ui/PlayerControls";
import { PlayerHeader } from "./ui/PlayerHeader";
import { SettingsModal, type SettingsTab } from "./ui/SettingsModal";

interface PlayerContainerProps {
  media: PlayerMedia;
  subtitle?: string;
  onBack?: () => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onEnded?: () => void;
  onNavigateEpisode?: (seasonNumber: number, episodeNumber: number) => void;
}

interface StreamState {
  source: MediaSource | null;
  isError: boolean;
}

const EMPTY_TRACKS: SubtitleTrack[] = [];

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
  onBack,
  onTimeUpdate,
  onEnded,
  onNavigateEpisode,
}: PlayerContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaEngineRef = useRef<MediaEngine | null>(null);
  const requestIdRef = useRef(0);
  const endedRef = useRef(false);

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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<SettingsTab>("quality");
  const [isEpisodesOpen, setIsEpisodesOpen] = useState(false);

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

    // Last episode of this season; only "no next" if there is no later season with episodes.
    const hasNextSeason = seasons.some(
      (season) => season.seasonNumber > currentSeason && season.episodeCount > 0
    );
    return !hasNextSeason;
  }, [activeSeasonInfo, currentEpisode, currentSeason, seasons]);

  const hasNext = isTv && currentSeasonEpisodes.length > 0 && !isLastEpisode;

  // Fetch episodes for the season shown in the drawer
  useEffect(() => {
    if (!isTv) {
      return;
    }

    if (episodesBySeason[drawerSeason]) {
      return;
    }

    let isCurrent = true;
    setIsEpisodesLoading(true);

    getSeasonEpisodes(media.mediaId, drawerSeason)
      .then((data) => {
        if (!isCurrent) return;
        const mapped: Episode[] = data.episodes.map((episode) => ({
          id: episode.id,
          seasonNumber: episode.seasonNumber,
          episodeNumber: episode.episodeNumber,
          name: episode.name,
          overview: episode.overview,
          stillPath: episode.stillPath,
          runtime: episode.runtime,
          airDate: episode.airDate,
          voteAverage: episode.voteAverage,
        }));
        setEpisodesBySeason((prev) => ({ ...prev, [drawerSeason]: mapped }));
      })
      .catch(() => {})
      .finally(() => {
        if (isCurrent) {
          setIsEpisodesLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [drawerSeason, episodesBySeason, isTv, media.mediaId]);

  const playerState = usePlayerState({
    videoRef,
    autoPlay: true,
    onTimeUpdate,
  });

  const controls = usePlayerControls({
    onTogglePlay: playerState.togglePlay,
    onSeekBy: playerState.seekBy,
    onToggleMute: playerState.toggleMute,
    onToggleFullscreen: toggleFullscreen,
    onToggleSettings: () => setIsSettingsOpen((open) => !open),
    onToggleSubtitles: () => {
      setSettingsTab("subtitles");
      setIsSettingsOpen(true);
    },
  });

  const subtitles = useSubtitles({ videoRef });

  function toggleFullscreen() {
    const element = containerRef.current;
    if (!element) return;

    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void element.requestFullscreen();
    }
  }

  const loadStream = useCallback(
    async (serverId: string) => {
      const element = videoRef.current;
      if (!element) return;

      const requestId = ++requestIdRef.current;
      setStream({ source: null, isError: false });

      const request = {
        mediaType: media.mediaType,
        mediaId: media.mediaId,
        seasonNumber: media.seasonNumber,
        episodeNumber: media.episodeNumber,
      };

      const source = await resolveStream(serverId, request);
      if (requestId !== requestIdRef.current) {
        return;
      }

      if (!source) {
        setStream({ source: null, isError: true });
        return;
      }

      const format = source.format === "unknown" ? detectFormat(source.url) : source.format;

      if (mediaEngineRef.current) {
        mediaEngineRef.current.destroy();
        mediaEngineRef.current = null;
      }

      const engine = createMediaEngine(element, source.url, format);
      mediaEngineRef.current = engine;

      setStream({ source, isError: false });
    },
    [media.mediaType, media.mediaId, media.seasonNumber, media.episodeNumber]
  );

  // Load initial stream when serverId changes
  useEffect(() => {
    void loadStream(settings.serverId);
  }, [loadStream, settings.serverId]);

  // Cleanup media engine + blob URLs
  useEffect(() => {
    const onUnmount = () => {
      mediaEngineRef.current?.destroy();
      mediaEngineRef.current = null;

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

  // Quality changes flow into the media engine
  useEffect(() => {
    if (mediaEngineRef.current && "setQuality" in mediaEngineRef.current) {
      mediaEngineRef.current.setQuality(settings.quality);
    }
  }, [settings.quality]);

  // History: save progress every N seconds once playing
  useEffect(() => {
    if (!stream.source) {
      return;
    }

    const saveHistory = () => {
      onTimeUpdate?.(videoRef.current?.currentTime ?? 0, videoRef.current?.duration ?? 0);
    };

    const interval = window.setInterval(saveHistory, HISTORY_SAVE_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [stream.source, onTimeUpdate]);

  // Close open modals with Escape
  useEffect(() => {
    if (!isSettingsOpen && !isEpisodesOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsSettingsOpen(false);
        setIsEpisodesOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isSettingsOpen, isEpisodesOpen]);

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

    // Last episode of this season — jump to the next season's first episode if one exists.
    const nextSeason = seasons.find(
      (season) => season.seasonNumber > currentSeason && season.episodeCount > 0
    );
    if (nextSeason) {
      handleNavigate(nextSeason.seasonNumber, 1);
    }
  }, [activeSeasonInfo, currentEpisode, currentSeason, handleNavigate, seasons]);

  // Auto-next on ended
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

  const handleSeasonChange = useCallback(
    (seasonNumber: number) => {
      setDrawerSeason(seasonNumber);
      setIsEpisodesOpen(true);
    },
    []
  );

  const handleEpisodeSelect = useCallback(
    (episode: Episode) => {
      handleNavigate(episode.seasonNumber, episode.episodeNumber);
    },
    [handleNavigate]
  );

  const handleServerChange = useCallback((serverId: string) => {
    setSettings((current) => ({ ...current, serverId }));
  }, []);

  const handleQualityChange = useCallback((quality: PlayerSettings["quality"]) => {
    setSettings((current) => ({ ...current, quality }));
  }, []);

  const handleRateChange = useCallback((rate: PlayerSettings["rate"]) => {
    setSettings((current) => ({ ...current, rate }));
    playerState.setRate(rate);
  }, [playerState.setRate]);

  const serverOptions = useMemo<ServerOption[]>(() => SERVERS, []);

  const isLoading = !stream.source && !stream.isError;

  return (
    <div ref={containerRef} className="fixed inset-0 bg-black">
      <div className="flex h-full w-full">
        <div className="cineby-container relative top-0 left-0 w-full h-full flex justify-center items-center">
          {/* Video */}
          <div className="absolute inset-0 z-0">
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video
              ref={videoRef}
              className="h-full w-full"
              playsInline
              preload="metadata"
            />
          </div>

          {/* Top header */}
          <PlayerHeader onBack={onBack} visible={controls.areControlsVisible} />

          {/* Loading / buffering overlay */}
          {isLoading || playerState.isBuffering ? (
            <div className="absolute inset-0 z-[100] bg-black/70 flex items-center justify-center pointer-events-none">
              <LoadingSpinner label={isLoading ? "Loading stream…" : undefined} />
            </div>
          ) : null}

          {/* Stream error */}
          {stream.isError ? (
            <div className="absolute inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center gap-4 px-6 text-center">
              <p className="text-lg font-semibold text-white">Unable to play this source</p>
              <p className="max-w-md text-sm text-white/60">
                Try selecting a different server from the settings menu.
              </p>
              <button
                type="button"
                onClick={() => {
                  setStream({ source: null, isError: false });
                  void loadStream(settings.serverId);
                }}
                className="mt-2 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90"
              >
                Retry
              </button>
            </div>
          ) : null}

          {/* Bottom controls */}
          <PlayerControls
            visible={controls.areControlsVisible}
            isPlaying={playerState.isPlaying}
            currentTime={playerState.currentTime}
            duration={playerState.duration}
            volume={playerState.volume}
            muted={playerState.muted}
            title={media.title}
            subtitle={subtitle}
            onTogglePlay={playerState.togglePlay}
            onSeek={playerState.seekTo}
            onSeekBy={playerState.seekBy}
            onVolumeChange={playerState.setVolume}
            onToggleMute={playerState.toggleMute}
            onToggleFullscreen={toggleFullscreen}
            onOpenSettings={() => {
              if (isSettingsOpen && settingsTab === "quality") {
                setIsSettingsOpen(false);
                return;
              }
              setSettingsTab("quality");
              setIsSettingsOpen(true);
            }}
            onToggleSubtitles={() => {
              if (isSettingsOpen && settingsTab === "subtitles") {
                setIsSettingsOpen(false);
                return;
              }
              setSettingsTab("subtitles");
              setIsSettingsOpen(true);
            }}
          >
            {isTv ? (
              <>
                {hasNext ? (
                  <NextEpisodeButton onNext={handleNextEpisode} />
                ) : null}
                <EpisodeSelectorButton
                  onOpen={() => setIsEpisodesOpen((open) => !open)}
                />
              </>
            ) : null}
          </PlayerControls>

          {/* Settings modal dim layer — always mounted, opacity-toggled */}
          <div
            data-player-ui
            className={`absolute inset-0 z-[100] bg-black/70 transition-opacity duration-500 ${
              isSettingsOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            }`}
            onClick={() => setIsSettingsOpen(false)}
            aria-hidden="true"
          />

          {/* Settings modal */}
          <SettingsModal
            open={isSettingsOpen}
            activeTab={settingsTab}
            onTabChange={setSettingsTab}
            onClose={() => setIsSettingsOpen(false)}
            quality={settings.quality}
            onQualityChange={handleQualityChange}
            subtitleTracks={EMPTY_TRACKS}
            subtitleLabel={subtitles.activeLabel}
            onSubtitleChange={subtitles.selectTrack}
            servers={serverOptions}
            activeServerId={settings.serverId}
            onServerChange={handleServerChange}
            rate={settings.rate}
            onRateChange={handleRateChange}
          />

          {/* Episodes drawer (TV only) */}
          {isTv ? (
            <>
              {/* Episodes drawer dim layer — always mounted, opacity-toggled */}
              <div
                data-player-ui
                className={`absolute inset-0 z-[100] bg-black/70 transition-opacity duration-500 ${
                  isEpisodesOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                }`}
                onClick={() => setIsEpisodesOpen(false)}
                aria-hidden="true"
              />
              <EpisodesDrawer
                open={isEpisodesOpen}
                onClose={() => setIsEpisodesOpen(false)}
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
                activeEpisodeId={
                  drawerSeason === currentSeason
                    ? drawerEpisodes.find(
                        (episode) => episode.episodeNumber === currentEpisode
                      )?.id
                    : undefined
                }
                isLoading={isEpisodesLoading}
                autoNext={settings.autoNext}
                onToggleAutoNext={handleToggleAutoNext}
              />
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function NextEpisodeButton({ onNext }: { onNext: () => void }) {
  return (
    <button
      type="button"
      onClick={onNext}
      aria-label="Next episode"
      title="Next episode"
      className="tabbable p-2 rounded-full hover:bg-white/20 transition-transform duration-100 flex items-center gap-3 active:scale-110 active:bg-white/30 active:text-white"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="1.25em"
        height="1.25em"
        viewBox="0 0 18 18"
        fill="none"
        aria-hidden="true"
      >
        <path
          fill="currentColor"
          d="M14.625 2.8125V15.1875C14.625 15.3367 14.5657 15.4798 14.4602 15.5852C14.3548 15.6907 14.2117 15.75 14.0625 15.75C13.9133 15.75 13.7702 15.6907 13.6648 15.5852C13.5593 15.4798 13.5 15.3367 13.5 15.1875V10.3198L5.09273 15.5777C4.92342 15.684 4.72878 15.7431 4.52895 15.7489C4.32913 15.7547 4.13139 15.707 3.95621 15.6107C3.78102 15.5144 3.63477 15.373 3.53258 15.2012C3.43039 15.0294 3.37599 14.8333 3.375 14.6334V3.36656C3.37599 3.16666 3.43039 2.97065 3.53258 2.79883C3.63477 2.62702 3.78102 2.48564 3.95621 2.38933C4.13139 2.29303 4.32913 2.2453 4.52895 2.25109C4.72878 2.25688 4.92342 2.31598 5.09273 2.42227L13.5 7.68023V2.8125C13.5 2.66332 13.5593 2.52024 13.6648 2.41475C13.7702 2.30926 13.9133 2.25 14.0625 2.25C14.2117 2.25 14.3548 2.30926 14.4602 2.41475C14.5657 2.52024 14.625 2.66332 14.625 2.8125Z"
        />
      </svg>
    </button>
  );
}

function EpisodeSelectorButton({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label="Episodes"
      title="Episodes"
      className="tabbable p-2 rounded-full hover:bg-white/20 transition-transform duration-100 flex items-center gap-3 active:scale-110 active:bg-white/30 active:text-white"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="1.25em"
        height="1.25em"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          fill="currentColor"
          d="M3 4C1.34315 4 0 5.34314 0 7V13.9496C0 15.6065 1.34315 16.9496 3 16.9496H5.86645V14.9496H3C2.44772 14.9496 2 14.5019 2 13.9496V7C2 6.44771 2.44771 6 3 6H16.0327C16.585 6 17.0327 6.44772 17.0327 7V9.86645H19.0327V7C19.0327 5.34315 17.6896 4 16.0327 4H3Z"
        />
        <rect x="5.89929" y="10.5444" width="17" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
      </svg>
    </button>
  );
}
