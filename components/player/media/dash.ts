import type { QualityLabel } from "../types";

export interface DashController {
  destroy: () => void;
  setQuality: (quality: QualityLabel | null) => void;
}

export function attachDash(video: HTMLVideoElement, src: string): DashController {
  // Native MSE supports fragmented MP4/DASH (e.g. Apple HLS). Full DASH
  // manifest support requires shaka-player; we keep a native-first strategy
  // here so unsupported manifests surface as a clean fallback error.
  video.src = src;
  video.load();

  return {
    destroy: () => {
      video.removeAttribute("src");
      video.load();
    },
    setQuality: () => {
      // Native playback has no client-side level switching.
    },
  };
}
