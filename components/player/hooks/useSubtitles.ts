import { useCallback, useMemo, useState } from "react";

import type { SubtitleTrack } from "../types";

interface UseSubtitlesOptions {
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

export interface UseSubtitlesResult {
  activeTrack: SubtitleTrack | null;
  selectTrack: (track: SubtitleTrack | null) => void;
  activeLabel: string;
}

function getActiveLabel(track: SubtitleTrack | null): string {
  if (!track) {
    return "Off";
  }

  return track.label || track.lang || "Unknown";
}

export function useSubtitles({ videoRef }: UseSubtitlesOptions): UseSubtitlesResult {
  const [activeTrack, setActiveTrack] = useState<SubtitleTrack | null>(null);

  const selectTrack = useCallback(
    (track: SubtitleTrack | null) => {
      const video = videoRef.current;

      if (video) {
        Array.from(video.textTracks).forEach((textTrack) => {
          textTrack.mode = "disabled";
        });
      }

      if (track?.url) {
        // A custom WebVTT/ASS subtitle URL is applied by clearing any prior
        // <track> element and re-adding a fresh one.
        const existing = video?.querySelector("track");
        existing?.remove();

        const element = document.createElement("track");
        element.kind = "subtitles";
        element.label = track.label;
        element.srclang = track.lang;
        element.src = track.url;
        element.default = true;
        video?.appendChild(element);
      }

      setActiveTrack(track);
    },
    [videoRef]
  );

  const activeLabel = useMemo(() => getActiveLabel(activeTrack), [activeTrack]);

  return { activeTrack, selectTrack, activeLabel };
}
