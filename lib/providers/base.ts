import { COMMON_USER_AGENTS } from "./constants";

export function getRandomUserAgent(): string {
  return COMMON_USER_AGENTS[Math.floor(Math.random() * COMMON_USER_AGENTS.length)] || COMMON_USER_AGENTS[0];
}

export function getDefaultHeaders(customHeaders?: Record<string, string>): Record<string, string> {
  return {
    "User-Agent": getRandomUserAgent(),
    Accept: "*/*",
    "Accept-Language": "en-US,en;q=0.9",
    ...customHeaders,
  };
}

export async function safeFetchJson<T>(
  url: string,
  options?: RequestInit
): Promise<T | null> {
  try {
    const res = await fetch(url, {
      ...options,
      headers: getDefaultHeaders(options?.headers as Record<string, string> | undefined),
    });

    if (!res.ok) {
      return null;
    }

    const data: unknown = await res.json().catch(() => null);
    return data as T;
  } catch {
    return null;
  }
}

export async function safeFetchText(
  url: string,
  options?: RequestInit
): Promise<string | null> {
  try {
    const res = await fetch(url, {
      ...options,
      headers: getDefaultHeaders(options?.headers as Record<string, string> | undefined),
    });

    if (!res.ok) {
      return null;
    }

    return await res.text();
  } catch {
    return null;
  }
}
