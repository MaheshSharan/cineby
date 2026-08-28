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
    backBufferLength: 30,
    maxBufferLength: 20,
    maxMaxBufferLength: 40,
    startLevel: -1,
    capLevelToPlayerSize: true,
  });

  hls.loadSource(src);
  hls.attachMedia(video);

  return {
    destroy: () => {
      hls.destroy();
    },
    setQuality: (quality) => {
      const cap = getHlsQualityCap(quality);

      if (cap === 0) {
        hls.currentLevel = -1;
        return;
      }

      const target = hls.levels.findLastIndex((level) => level.height <= cap);
      hls.currentLevel = target >= 0 ? target : hls.levels.length - 1;
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
