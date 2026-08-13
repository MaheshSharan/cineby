const tmdbImageBaseUrl = process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE_URL;

export function getTmdbImageBaseUrl(): string {
  if (!tmdbImageBaseUrl) {
    throw new Error("Missing required environment variable: NEXT_PUBLIC_TMDB_IMAGE_BASE_URL");
  }

  return tmdbImageBaseUrl;
}
