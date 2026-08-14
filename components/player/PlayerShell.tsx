import { useCallback } from "react";

import type { PlayerMedia } from "./types";
import { PlayerContainer } from "./PlayerContainer";

interface PlayerShellProps {
  title: string;
  subtitle?: string;
  media?: PlayerMedia;
  onBack?: () => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onEnded?: () => void;
  onNavigateEpisode?: (seasonNumber: number, episodeNumber: number) => void;
}

export function PlayerShell({
  title,
  subtitle,
  media,
  onBack,
  onTimeUpdate,
  onEnded,
  onNavigateEpisode,
}: PlayerShellProps) {
  const handleTimeUpdate = useCallback(
    (currentTime: number, duration: number) => {
      if (!media) return;
      // Persist history through the existing POST endpoint.
      fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mediaType: media.mediaType,
          mediaId: media.mediaId,
          title,
          posterPath: media.posterPath ?? null,
          backdropPath: media.backdropPath ?? null,
          seasonNumber: media.seasonNumber ?? null,
          episodeNumber: media.episodeNumber ?? null,
          duration: media.duration ?? null,
          progress: Math.round((currentTime / Math.max(1, duration)) * 100),
        }),
      }).catch(() => {});
      onTimeUpdate?.(currentTime, duration);
    },
    [media, onTimeUpdate, title]
  );

  return (
    <PlayerContainer
      media={media ?? defaultMedia(title)}
      subtitle={subtitle}
      onBack={onBack}
      onTimeUpdate={handleTimeUpdate}
      onEnded={onEnded}
      onNavigateEpisode={onNavigateEpisode}
    />
  );
}

function defaultMedia(title: string): PlayerMedia {
  return {
    mediaType: "movie",
    mediaId: 0,
    title,
  };
}
