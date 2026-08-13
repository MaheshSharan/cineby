export interface TmdbConfig {
  apiUrl: string;
  apiKey: string;
  defaultLanguage: string;
}

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value || value.trim() === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getTmdbConfig(): TmdbConfig {
  return {
    apiUrl: getRequiredEnv("TMDB_API_URL"),
    apiKey: getRequiredEnv("TMDB_API_KEY"),
    defaultLanguage: getRequiredEnv("NEXT_PUBLIC_TMDB_DEFAULT_LANGUAGE"),
  };
}