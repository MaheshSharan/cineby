import type { Quality } from "./types";

export const DEFAULT_PROVIDER_TIMEOUT_MS = 12_000;

export const CIRCUIT_BREAKER_FAILURE_THRESHOLD = 5;

export const CIRCUIT_BREAKER_RESET_TIMEOUT_MS = 60_000;

export const QUALITY_RANKS: Record<Quality, number> = {
  "2160p": 6,
  "1440p": 5,
  "1080p": 4,
  "720p": 3,
  "480p": 2,
  "360p": 1,
  unknown: 0,
};

export const COMMON_USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
];
