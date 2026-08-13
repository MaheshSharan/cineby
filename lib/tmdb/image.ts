import { getTmdbImageBaseUrl } from "@/lib/env";

export function buildImageUrl(
  path: string | null | undefined,
  size: "w92" | "w154" | "w185" | "w342" | "w500" | "w780" | "w1280" | "original"
): string | null {
  if (!path) {
    return null;
  }

  const imageBaseUrl = getTmdbImageBaseUrl();

  return `${imageBaseUrl}/${size}${path}`;
}

export function getPosterUrl(
  path: string | null | undefined,
  size: "w185" | "w342" | "w500" | "w780" | "original" = "w342"
): string | null {
  return buildImageUrl(path, size);
}

export function getBackdropUrl(
  path: string | null | undefined,
  size: "w780" | "w1280" | "original" = "w1280"
): string | null {
  return buildImageUrl(path, size);
}

export function getProfileUrl(path: string | null | undefined): string | null {
  return buildImageUrl(path, "w185");
}

export function getStillUrl(path: string | null | undefined): string | null {
  return buildImageUrl(path, "w500");
}

function buildWsrvUrl(tmdbUrl: string, quality: number): string {
  return `https://wsrv.nl/?url=${encodeURIComponent(tmdbUrl)}&output=webp&q=${quality}&n=-1`;
}

export interface PosterResponsiveUrls {
  mobile: string | null;
  desktop: string | null;
}

export function getPosterResponsiveUrls(
  path: string | null | undefined
): PosterResponsiveUrls {
  const mobileTmdb = buildImageUrl(path, "w342");
  const desktopTmdb = buildImageUrl(path, "w780");

  return {
    mobile: mobileTmdb ? buildWsrvUrl(mobileTmdb, 50) : null,
    desktop: desktopTmdb ? buildWsrvUrl(desktopTmdb, 65) : null,
  };
}

export interface BackdropResponsiveUrls {
  mobile: string | null;
  desktop: string | null;
}

export function getBackdropResponsiveUrls(
  path: string | null | undefined
): BackdropResponsiveUrls {
  const mobileTmdb = buildImageUrl(path, "w780");
  const desktopTmdb = buildImageUrl(path, "original");

  return {
    mobile: mobileTmdb ? buildWsrvUrl(mobileTmdb, 70) : null,
    desktop: desktopTmdb ? buildWsrvUrl(desktopTmdb, 80) : null,
  };
}