import { getTmdbConfig } from "./config";

const REQUEST_TIMEOUT_MS = 15_000;

export class TmdbApiError extends Error {
  constructor(
    message: string,
    readonly status: number | null
  ) {
    super(message);
    this.name = "TmdbApiError";
  }
}

export class TmdbTimeoutError extends Error {
  constructor() {
    super(`TMDB request timed out after ${REQUEST_TIMEOUT_MS}ms`);
    this.name = "TmdbTimeoutError";
  }
}

interface RequestOptions {
  path: string;
  params?: Record<string, string | number | undefined>;
}

const MAX_RETRIES = 2;

export async function tmdbGet<T>({ path, params }: RequestOptions): Promise<T> {
  for (let attempt = 0; ; attempt += 1) {
    try {
      return await singleRequest<T>({ path, params });
    } catch (error) {
      if (attempt >= MAX_RETRIES || !isTransientError(error)) {
        throw error;
      }
    }
  }
}

// ISP-level resets and TLS handshake drops are transient and safe to retry.
// Bun and Node surface these differently (error.code vs nested cause), so check both.
function isTransientError(error: unknown): boolean {
  if (error instanceof TmdbTimeoutError) {
    return true;
  }

  const cause = error instanceof Error ? (error.cause as Error | undefined) : undefined;
  const errorCode = error instanceof Error ? (error as { code?: string }).code : undefined;
  const causeCode = cause instanceof Error ? (cause as { code?: string }).code : undefined;

  const codes = new Set([causeCode, errorCode]);

  for (const code of codes) {
    if (
      code === "ECONNRESET" ||
      code === "ECONNREFUSED" ||
      code === "ETIMEDOUT" ||
      code === "UND_ERR_CONNECT_TIMEOUT"
    ) {
      return true;
    }
  }

  return error instanceof Error && error.name === "TypeError" && error.message === "fetch failed";
}

async function singleRequest<T>({ path, params }: RequestOptions): Promise<T> {
  const { apiUrl, apiKey } = getTmdbConfig();

  const url = new URL(`${apiUrl}${path}`);
  url.searchParams.set("api_key", apiKey);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url.toString(), {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new TmdbApiError(`TMDB request failed (${response.status})`, response.status);
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new TmdbTimeoutError();
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}