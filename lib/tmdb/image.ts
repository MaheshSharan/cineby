import { getImageProxyUrl, getTmdbImageBaseUrl, isImageProxyEnabled } from "@/lib/env";

export function buildImageUrl(
  path: string | null | undefined,
  size:
    | "w92"
    | "w154"
    | "w185"
    | "w300"
    | "w342"
    | "w500"
    | "w780"
    | "w1280"
    | "original"
): string | null {
  if (!path) {
    return null;
  }

  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const imageBaseUrl = getTmdbImageBaseUrl();

  return `${imageBaseUrl}/${size}${cleanPath}`;
}

export function getLogoUrl(path: string | null | undefined): string | null {
  const tmdbUrl = buildImageUrl(path, "w500");

  return tmdbUrl ? optimizeImageUrl(tmdbUrl, 50) : null;
}

export function getHeroBackdropUrl(path: string | null | undefined): string | null {
  const tmdbUrl = buildImageUrl(path, "original");

  return tmdbUrl ? optimizeImageUrl(tmdbUrl, 80) : null;
}

export function getProfileUrl(path: string | null | undefined): string | null {
  return buildImageUrl(path, "w185");
}

export function getStillThumbUrl(path: string | null | undefined): string | null {
  const tmdbUrl = buildImageUrl(path, "w300");

  return tmdbUrl ? optimizeImageUrl(tmdbUrl, 50) : null;
}

function optimizeImageUrl(rawUrl: string, quality: number): string {
  if (!isImageProxyEnabled()) {
    return rawUrl;
  }

  const proxyBase = getImageProxyUrl();
  return `${proxyBase}/?url=${encodeURIComponent(rawUrl)}&output=webp&q=${quality}&n=-1`;
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
    mobile: mobileTmdb ? optimizeImageUrl(mobileTmdb, 50) : null,
    desktop: desktopTmdb ? optimizeImageUrl(desktopTmdb, 65) : null,
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
    mobile: mobileTmdb ? optimizeImageUrl(mobileTmdb, 70) : null,
    desktop: desktopTmdb ? optimizeImageUrl(desktopTmdb, 80) : null,
  };
}