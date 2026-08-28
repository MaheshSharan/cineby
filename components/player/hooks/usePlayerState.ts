import { useCallback, useEffect, useState } from "react";

import type { PlaybackRate, QualityLabel, SubtitleTrack } from "../types";

interface UsePlayerStateOptions {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  autoPlay?: boolean;
}

export interface UsePlayerStateResult {
  isPlaying: boolean;
  isBuffering: boolean;
  isEnded: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  muted: boolean;
  rate: PlaybackRate;
  quality: QualityLabel | null;
  subtitleLang: string | null;
  togglePlay: () => void;
  seekTo: (time: number) => void;
  seekBy: (seconds: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setRate: (rate: PlaybackRate) => void;
  setQuality: (quality: QualityLabel | null) => void;
  setSubtitleLang: (lang: string | null) => void;
  setSubtitleTrack: (track: SubtitleTrack | null) => void;
}

export function usePlayerState({
  videoRef,
  autoPlay = false,
}: UsePlayerStateOptions): UsePlayerStateResult {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [rate, setRateState] = useState<PlaybackRate>(1);
  const [quality, setQuality] = useState<QualityLabel | null>(null);
  const [subtitleLang, setSubtitleLang] = useState<string | null>(null);

  const syncFromVideo = useCallback(() => {
    const element = videoRef.current;
    if (!element) return;

    const time = element.currentTime;
    setCurrentTime(time);

    const dur = element.duration;
    if (Number.isFinite(dur)) {
      setDuration(dur);
    }
  }, [videoRef]);

  useEffect(() => {
    const element = videoRef.current;
    if (!element) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      setIsEnded(true);
      setIsPlaying(false);
    };
    const onWaiting = () => setIsBuffering(true);
    const onPlaying = () => {
      setIsBuffering(false);
      setIsEnded(false);
    };
    const onPlayable = () => setIsBuffering(false);

    element.addEventListener("play", onPlay);
    element.addEventListener("pause", onPause);
    element.addEventListener("ended", onEnded);
    element.addEventListener("waiting", onWaiting);
    element.addEventListener("playing", onPlaying);
    element.addEventListener("canplay", onPlayable);
    element.addEventListener("loadeddata", onPlayable);
    element.addEventListener("seeked", onPlayable);
    element.addEventListener("timeupdate", syncFromVideo);
    element.addEventListener("loadedmetadata", syncFromVideo);

    if (autoPlay) {
      void element.play().catch(() => {});
    }

    return () => {
      element.removeEventListener("play", onPlay);
      element.removeEventListener("pause", onPause);
      element.removeEventListener("ended", onEnded);
      element.removeEventListener("waiting", onWaiting);
      element.removeEventListener("playing", onPlaying);
      element.removeEventListener("canplay", onPlayable);
      element.removeEventListener("loadeddata", onPlayable);
      element.removeEventListener("seeked", onPlayable);
      element.removeEventListener("timeupdate", syncFromVideo);
      element.removeEventListener("loadedmetadata", syncFromVideo);
    };
  }, [autoPlay, syncFromVideo, videoRef]);

  const togglePlay = useCallback(() => {
    const element = videoRef.current;
    if (!element) return;

    if (element.paused) {
      void element.play().catch(() => {});
    } else {
      element.pause();
    }
  }, [videoRef]);

  const seekTo = useCallback(
    (time: number) => {
      const element = videoRef.current;
      if (!element) return;
      const safeDuration = Number.isFinite(element.duration) ? element.duration : time;
      const targetTime = Math.min(Math.max(0, time), safeDuration);
      element.currentTime = targetTime;
      setCurrentTime(targetTime);
    },
    [videoRef]
  );

  const seekBy = useCallback(
    (seconds: number) => {
      const element = videoRef.current;
      if (!element) return;
      element.currentTime += seconds;
      setCurrentTime(element.currentTime);
    },
    [videoRef]
  );

  const setVolume = useCallback(
    (nextVolume: number) => {
      const clamped = Math.min(1, Math.max(0, nextVolume));
      setVolumeState(clamped);
      const element = videoRef.current;
      if (element) {
        element.volume = clamped;
        element.muted = clamped === 0;
      }
    },
    [videoRef]
  );

  const toggleMute = useCallback(() => {
    const element = videoRef.current;
    if (!element) return;
    const nextMuted = !element.muted;
    element.muted = nextMuted;
    setMuted(nextMuted);
  }, [videoRef]);

  const setRate = useCallback(
    (nextRate: PlaybackRate) => {
      setRateState(nextRate);
      const element = videoRef.current;
      if (element) element.playbackRate = nextRate;
    },
    [videoRef]
  );

  const setSubtitleTrack = useCallback((track: SubtitleTrack | null) => {
    setSubtitleLang(track?.lang ?? null);
  }, []);

  return {
    isPlaying,
    isBuffering,
    isEnded,
    currentTime,
    duration,
    volume,
    muted,
    rate,
    quality,
    subtitleLang,
    togglePlay,
    seekTo,
    seekBy,
    setVolume,
    toggleMute,
    setRate,
    setQuality,
    setSubtitleLang,
    setSubtitleTrack,
  };
}
