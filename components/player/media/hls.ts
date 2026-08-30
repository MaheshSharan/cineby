import Hls from "hls.js";

import type { QualityLabel } from "../types";

export interface HlsController {
  destroy: () => void;
  setQuality: (quality: QualityLabel | null) => void;
  getLevels: () => { height: number; bitrate: number }[];
}

function getHlsQualityCap(quality: QualityLabel | null): number {
  switch (quality) {
    case "2160p":
      return 2160;
    case "1080p":
      return 1080;
    case "720p":
      return 720;
    case "480p":
      return 480;
    default:
      return 0;
  }
}

export function attachHls(video: HTMLVideoElement, src: string): HlsController {
  const hls = new Hls({
    enableWorker: true,
    
    // Instant first frame - start with lowest bitrate
    startLevel: 0,
    testBandwidth: false,
    
    // Buffer tuning
    backBufferLength: 60,
    maxBufferLength: 45,
    maxMaxBufferLength: 90,
    maxBufferSize: 60 * 1024 * 1024,

    // ABR
    abrEwmaDefaultEstimate: 5_000_000,
    abrBandWidthFactor: 0.9,
    capLevelToPlayerSize: true,

    // Timeouts (proxied upstream segments can legitimately take several seconds)
    manifestLoadingTimeOut: 10_000,
    manifestLoadingMaxRetry: 3,
    levelLoadingTimeOut: 10_000,
    fragLoadingTimeOut: 15_000,
    fragLoadingMaxRetry: 3,
  });

  hls.loadSource(src);
  hls.attachMedia(video);

  // Hand off to ABR after first fragment renders
  hls.on(Hls.Events.FRAG_BUFFERED, (_event, data) => {
    if (data.frag.sn === 0) {
      hls.nextLevel = -1;
    }
  });

  hls.on(Hls.Events.LEVEL_SWITCHED, (_event, data) => {
    const level = hls.levels[data.level];
    if (level) {
      console.log(
        `[HlsEngine] ⚡ Active Stream Switched -> ${level.height}p @ ${level.bitrate ? Math.round(level.bitrate / 1000) : 0} kbps (${level.url || "chunk stream"})`
      );
    }
  });

  return {
    destroy: () => {
      hls.destroy();
    },
    setQuality: (quality) => {
      const cap = getHlsQualityCap(quality);

      if (cap === 0) {
        hls.currentLevel = -1;
        console.log("[HlsEngine] Quality setting changed to: Auto (Adaptive Bitrate)");
        return;
      }

      const target = hls.levels.findLastIndex((level) => level.height <= cap);
      hls.currentLevel = target >= 0 ? target : hls.levels.length - 1;
      const active = hls.levels[hls.currentLevel];
      console.log(
        `[HlsEngine] Quality setting changed to: ${quality} (Target Level: ${active?.height ?? cap}p)`
      );
    },
    getLevels: () =>
      hls.levels.map((level) => ({
        height: level.height,
        bitrate: level.bitrate,
      })),
  };
}

export function supportsHls(video: HTMLVideoElement): boolean {
  return Hls.isSupported() || video.canPlayType("application/vnd.apple.mpegurl") === "probably";
}
