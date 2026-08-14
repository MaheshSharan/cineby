const rawImageBaseUrl = process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE_URL || "https://image.tmdb.org/t/p";
const imageProxyUrl = process.env.NEXT_PUBLIC_IMAGE_PROXY_URL || "https://wsrv.nl";
const isProxyEnabled = process.env.NEXT_PUBLIC_ENABLE_IMAGE_PROXY !== "false";

export function getTmdbImageBaseUrl(): string {
  // If the base URL in env accidentally has a proxy prefix like wsrv.nl/?url=, extract the actual target URL
  if (rawImageBaseUrl.includes("url=")) {
    const parts = rawImageBaseUrl.split("url=");
    const target = parts[parts.length - 1];
    return decodeURIComponent(target).replace(/\/+$/, "");
  }

  return rawImageBaseUrl.replace(/\/+$/, "");
}

export function getImageProxyUrl(): string {
  return imageProxyUrl.replace(/\/+$/, "");
}

export function isImageProxyEnabled(): boolean {
  return isProxyEnabled;
}

