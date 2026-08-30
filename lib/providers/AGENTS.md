# Cineby Provider Engineering Standards

This document defines the contract, architecture, and coding standards for all media stream providers in Cineby.

---

## 1. Core Philosophy

Providers are responsible for resolving playable media streams (HLS/DASH/MP4) and subtitle tracks from upstream sources.

Priority order:
1. Reliability
2. Observability & Type Safety
3. Security
4. Maintainability
5. Performance

---

## 2. Directory Structure

```text
lib/
  providers/
    types.ts                 # Provider, StreamRequest, StreamResponse, StreamSource, SubtitleTrack
    constants.ts             # Default timeouts, quality rankings, circuit-breaker thresholds
    registry.ts              # Registry: timeout/abort racing, circuit-breakers, parallel execution, deduplication
    base.ts                  # Shared HTTP helpers, User-Agents, safe fetch utilities
    circuitBreaker.ts        # Circuit breaker state tracking
    sources/                 # Isolated provider modules
      test/
        index.ts
      <providerId>/
        index.ts             # Provider implementation
        helpers.ts           # Any token/crypto/parser helper specific to this provider
```

---

## 3. The Provider Contract

Every provider is located at `lib/providers/sources/<id>/index.ts` and exports an object implementing the `Provider` interface:

```ts
import type { Provider, StreamRequest, StreamResponse } from "../../types";

async function scrape(req: StreamRequest): Promise<StreamResponse> {
  // Scraper implementation
  return {
    sources: [],
    subtitles: [],
  };
}

export const myProvider: Provider = {
  id: "myprovider",       // Lowercase identifier — matches ENABLE_MYPROVIDER env var
  name: "My Provider",   // Human-readable title
  priority: 30,          // Lower number = higher priority for sorting (e.g. 10=highest, 100=default)
  fetch: scrape,
};
```

---

## 4. `fetch()` Signature & Request / Response Shape

### Input: `StreamRequest`
```ts
export interface StreamRequest {
  tmdbId: number;
  type: "movie" | "tv";
  season?: number | null;     // Season number (TV only)
  episode?: number | null;    // Episode number (TV only)
  serverId?: string;          // Targeted server id (e.g. "vidy-miami") when the user picked one
  signal?: AbortSignal;       // Must be passed to every fetch call
}
```

> **Note on URLs**: providers return **raw upstream URLs**. The resolve route wraps them
> with fresh signed proxy descriptors at serve time (`applyStreamProxy`), so cached
> results never hold expiring descriptors. Never proxy-wrap inside a provider.

### Output: `StreamResponse`
```ts
export interface StreamResponse {
  sources: Array<{
    url: string;              // Playable m3u8 / mpd / mp4 URL
    type: "hls" | "dash" | "mp4" | "webm" | "mkv" | "unknown";
    quality: "2160p" | "1440p" | "1080p" | "720p" | "480p" | "360p" | "unknown";
    headers?: Record<string, string>;
    audioTracks?: Array<{ language: string; label: string }>;
    provider: { id: string; name: string };
  }>;
  subtitles: Array<{
    url: string;              // VTT / SRT subtitle URL
    label: string;            // Human-readable (e.g. "English", "Spanish")
    lang?: string;            // BCP-47 language code (e.g. "en", "es")
    format: "vtt" | "srt" | "ass" | "ssa";
    headers?: Record<string, string>;
  }>;
}
```

If the upstream source returns nothing or fails, return `{ sources: [], subtitles: [] }`. **Never throw an unhandled error on normal missing media.**

---

## 5. Rules Every Provider Must Follow

1. **Providers Are Pure Fetchers**:
   - Fetch, decrypt, parse, and normalize data.
   - Providers must **NOT** manage caching, timeouts, retries, rate limiting, or circuit breaking. The registry owns all infrastructure.

2. **5-Second Developer Target & 12-Second Hard Limit**:
   - **Developer Rule**: Developers writing providers must optimize scraping, token decryption, and network calls so the provider resolves in **under 5 seconds**.
   - **Registry Hard Timeout**: The registry enforces a hard safety cut-off of **12 seconds** (`DEFAULT_PROVIDER_TIMEOUT_MS = 12_000`). Any provider taking longer than 12 seconds is automatically aborted to preserve server and network resources.

3. **Strict TypeScript (Never Use `any`)**:
   - Validate and narrow untrusted external JSON/API structures before accessing properties.

4. **Honor `req.signal` & Immediate Mid-Search Abort**:
   - Pass `req.signal` to every `fetch()` call.
   - Check `req.signal?.aborted` before performing subsequent async work.
   - On `AbortError` or aborted signal, return `{ sources: [], subtitles: [] }` immediately. Do not log aborts as errors.
   - If a user navigates away from the player, the client aborts the request, terminating all background provider searches immediately.

5. **Fast First-Stream Playback & Background Server Discovery**:
   - The first resolved stream is delivered to the player immediately so video starts without waiting for all providers.
   - Remaining active providers continue resolving in the background to populate the **Server Selection** menu for instant server switching if the current source lags or degrades in quality.

6. **Timeouts Are Owned by Registry**:
   - Never set manual `setTimeout` timers inside a provider. The registry races provider execution against `DEFAULT_PROVIDER_TIMEOUT_MS`.

7. **Defensive Parsing & Error Handling**:
   - Wrap `res.json()` and DOM/crypto parsing in `try/catch`.
   - Never let network failures crash the process. Catch errors, log via `logError("Provider:<id>", error)`, and return empty results.

8. **Parallelism Over Sequential IO**:
   - When fetching multiple URLs or subtitles independently, always use `Promise.all()` or `Promise.allSettled()`. Never chain sequential `await`s for independent network requests.

9. **No Magic Numbers or Hardcoded Secrets**:
   - Define upstream endpoints, headers, and constants at the top of the provider file.
   - Read API keys only through environment variables.

10. **Structured Logging**:
   - Use `logError("Provider:<id>", error)` from `@/lib/logger`. Never use raw `console.log`.

---

## 6. Playback & Discovery Lifecycle

```text
[User opens player]
        │
        ├── 1. Request Stream (/api/stream/resolve) with AbortSignal
        │
        ├── 2. First Stream Found  ──► [Player starts HLS stream immediately]
        │
        ├── 3. Background Discovery ──► [Populates Server Menu with alternate sources]
        │
        └── 4. User Navigates Away ──► [AbortSignal fired -> Aborts all mid-flight fetches]
```

---

## 7. Provider Registration & Configuration

1. Create your provider in `lib/providers/sources/<id>/index.ts`.
2. Add the provider to `ALL_PROVIDERS` in `lib/providers/sources/index.ts`.
3. Enable or disable any provider using the environment variable `ENABLE_<ID_UPPERCASE>=true/false` in `.env.local` (enabled by default).

Example:
```env
ENABLE_VIXSRC=true
ENABLE_FLIXHQ=true
ENABLE_TEST=false
```

---

## 8. Quality Ranking Reference

Sources are sorted automatically by provider priority and quality rank:

| Quality String | Rank |
|---|---|
| `2160p` | 6 (highest) |
| `1440p` | 5 |
| `1080p` | 4 |
| `720p` | 3 |
| `480p` | 2 |
| `360p` | 1 |
| `unknown` | 0 |

---

## 9. Provider Template

```ts
import type { Provider, StreamRequest, StreamResponse } from "../../types";
import { getDefaultHeaders, safeFetchJson } from "../../base";
import { logError } from "@/lib/logger";

const PROVIDER_ID = "myprovider";
const PROVIDER_NAME = "My Provider";
const BASE_URL = "https://upstream.example.com";

async function scrape(req: StreamRequest): Promise<StreamResponse> {
  const { tmdbId, type, season, episode, signal } = req;

  if (signal?.aborted) {
    return { sources: [], subtitles: [] };
  }

  try {
    const targetUrl =
      type === "tv"
        ? `${BASE_URL}/tv/${tmdbId}/${season ?? 1}/${episode ?? 1}`
        : `${BASE_URL}/movie/${tmdbId}`;

    const data = await safeFetchJson<{ streamUrl?: string; quality?: string }>(targetUrl, {
      headers: getDefaultHeaders(),
      signal,
    });

    if (!data?.streamUrl) {
      return { sources: [], subtitles: [] };
    }

    return {
      sources: [
        {
          url: data.streamUrl,
          type: "hls",
          quality: data.quality === "1080p" ? "1080p" : "720p",
          provider: { id: PROVIDER_ID, name: PROVIDER_NAME },
        },
      ],
      subtitles: [],
    };
  } catch (error) {
    if (signal?.aborted || (error instanceof Error && error.name === "AbortError")) {
      return { sources: [], subtitles: [] };
    }
    logError(`Provider:${PROVIDER_ID}`, error);
    return { sources: [], subtitles: [] };
  }
}

export const myProvider: Provider = {
  id: PROVIDER_ID,
  name: PROVIDER_NAME,
  priority: 50,
  fetch: scrape,
};
```
