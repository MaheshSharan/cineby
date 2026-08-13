import { useEffect } from "react";

export interface PlayerMedia {
  mediaType: "movie" | "tv";
  mediaId: number;
  posterPath?: string | null;
  backdropPath?: string | null;
  seasonNumber?: number | null;
  episodeNumber?: number | null;
  duration?: string | null;
}

interface PlayerShellProps {
  title: string;
  subtitle?: string;
  media?: PlayerMedia;
  onBack?: () => void;
}

export function PlayerShell({ title, subtitle, media, onBack }: PlayerShellProps) {
  useEffect(() => {
    if (!media) {
      return;
    }

    // Recording history is best-effort: failures (e.g. anonymous playback)
    // must never block the player UI.
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
      }),
    }).catch(() => {});
  }, [media, title]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      <div className="flex items-center justify-between px-4 py-3">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors duration-150 hover:text-foreground"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4 rotate-180"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
          Go back
        </button>
        <span className="truncate text-sm font-medium">{title}</span>
        <span className="w-20" />
      </div>

      <div className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-4xl">
          <div className="relative flex aspect-video w-full flex-col items-center justify-center gap-5 rounded-lg border border-border bg-[#0a0c10]">
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/90 text-primary-foreground shadow-[0_0_40px_rgba(220,38,38,0.4)]">
              <svg viewBox="0 0 24 24" className="ml-1 h-9 w-9 fill-current" aria-hidden="true">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>

            <div className="text-center">
              <p className="text-lg font-semibold">{title}</p>
              {subtitle ? (
                <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
              ) : null}
            </div>

            <p className="max-w-md text-center text-xs leading-relaxed text-muted-foreground">
              Playback source will be available once the media stream resolver is integrated.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}