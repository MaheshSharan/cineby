import type { MediaType } from "@/lib/tmdb";

export function getYear(dateString: string | null): string {
  if (!dateString) {
    return "";
  }

  return dateString.slice(0, 4);
}

export function getMediaHref(mediaType: MediaType, id: number): string {
  return mediaType === "tv" ? `/tv/${id}` : `/movie/${id}`;
}

export function getPlayHref(mediaType: MediaType, id: number): string {
  return `${getMediaHref(mediaType, id)}?play=true`;
}

export function getEpisodeHref(id: number, seasonNumber: number, episodeNumber: number): string {
  return `/tv/${id}/${seasonNumber}/${episodeNumber}?play=true`;
}

export function getMediaTypeLabel(mediaType: MediaType): string {
  return mediaType === "tv" ? "TV Show" : "Movie";
}

export function formatRuntime(minutes: number | null): string {
  if (!minutes || minutes <= 0) {
    return "";
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return hours > 0 ? `${hours}h ${remainingMinutes}m` : `${remainingMinutes}m`;
}