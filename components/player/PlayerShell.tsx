import { useCallback, useState, useEffect } from "react";

import type { PlayerMedia } from "./types";
import { PlayerContainer } from "./PlayerContainer";

interface PlayerShellProps {
  title: string;
  subtitle?: string;
  media?: PlayerMedia;
  resolveToken?: string;
  onBack?: () => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onEnded?: () => void;
  onNavigateEpisode?: (seasonNumber: number, episodeNumber: number) => void;
}

export function PlayerShell({
  title,
  subtitle,
  media,
  resolveToken: providedToken,
  onBack,
  onTimeUpdate,
  onEnded,
  onNavigateEpisode,
}: PlayerShellProps) {
  const [token, setToken] = useState<string | null>(providedToken ?? null);
  const [tokenError, setTokenError] = useState(false);

  useEffect(() => {
    if (providedToken) {
      setToken(providedToken);
      return;
    }

    if (!media) return;

    let isCurrent = true;

    fetch(`/api/stream/token?tmdbId=${media.mediaId}`)
      .then((res) => res.json())
      .then((data: { token?: string }) => {
        if (isCurrent && data.token) {
          setToken(data.token);
        }
      })
      .catch(() => {
        if (isCurrent) {
          setTokenError(true);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [media, providedToken]);

  const handleTimeUpdate = useCallback(
    (currentTime: number, duration: number, playback?: { seasonNumber?: number; episodeNumber?: number }) => {
      if (!media) return;
      fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mediaType: media.mediaType,
          mediaId: media.mediaId,
          title,
          posterPath: media.posterPath ?? null,
          backdropPath: media.backdropPath ?? null,
          seasonNumber: playback?.seasonNumber ?? media.seasonNumber ?? null,
          episodeNumber: playback?.episodeNumber ?? media.episodeNumber ?? null,
          duration: media.duration ?? null,
          progress: Math.round((currentTime / Math.max(1, duration)) * 100),
        }),
      }).catch(() => {});
      onTimeUpdate?.(currentTime, duration);
    },
    [media, onTimeUpdate, title]
  );

  if (tokenError) {
    return (
      <div className="flex h-screen items-center justify-center bg-black text-white">
        <p>Unable to initialize player - security token generation failed</p>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-white/60">Initializing player...</p>
        </div>
      </div>
    );
  }

  return (
    <PlayerContainer
      media={media ?? defaultMedia(title)}
      subtitle={subtitle}
      resolveToken={token}
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
